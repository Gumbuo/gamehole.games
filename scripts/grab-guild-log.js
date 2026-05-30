(async () => {
    const findScrollContainer = function() {
      return Array.from(document.querySelectorAll('ul')).find(function(el) {
        return el.scrollHeight > el.clientHeight + 20 && el.clientHeight > 100;
      });
    };

    const parseAgo = function(text) {
      var m = text.match(/(\d+)\s+(second|minute|hour|day)s?\s+ago/i);
      if (!m) return null;
      var n = parseInt(m[1], 10);
      var unit = m[2].toLowerCase();
      if (unit === 'second') return n * 1000;
      if (unit === 'minute') return n * 60000;
      if (unit === 'hour')   return n * 3600000;
      if (unit === 'day')    return n * 86400000;
      return null;
    };

    const isActionLine = function(text) {
      return /harvested|planted|cut a tree|mined|fished|contributed|unplanted|accepted|kicked|gold as member share|transferred \d+ gold to the guild|gold was added to the guild vault/.test(text);
    };

    var panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:monospace;user-select:none;';
    document.body.appendChild(panel);

    var statusEl = document.createElement('div');
    statusEl.style.cssText = 'padding:8px 18px;background:rgba(0,0,0,0.85);color:#66fcf1;font-size:13px;font-weight:bold;border-radius:6px;border:1px solid #45a29e;text-align:center;';
    statusEl.innerText = 'Guild Scraper — set hours and click START';
    panel.appendChild(statusEl);

    // Hours input row
    var inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.85);padding:8px 14px;border-radius:6px;border:1px solid #45a29e;';
    var inputLabel = document.createElement('span');
    inputLabel.style.cssText = 'color:#c5c6c7;font-size:13px;';
    inputLabel.innerText = 'Collect last';
    var hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.value = '24';
    hoursInput.min = '1';
    hoursInput.max = '168';
    hoursInput.style.cssText = 'width:54px;padding:4px 8px;border-radius:4px;border:1px solid #45a29e;background:#111;color:#66fcf1;font-size:14px;font-weight:bold;font-family:monospace;text-align:center;';
    var inputLabel2 = document.createElement('span');
    inputLabel2.style.cssText = 'color:#c5c6c7;font-size:13px;';
    inputLabel2.innerText = 'hours';

    var speedLabel = document.createElement('span');
    speedLabel.style.cssText = 'color:#c5c6c7;font-size:13px;margin-left:10px;';
    speedLabel.innerText = 'Speed:';
    var speedSelect = document.createElement('select');
    speedSelect.style.cssText = 'padding:4px 8px;border-radius:4px;border:1px solid #45a29e;background:#111;color:#66fcf1;font-size:13px;font-family:monospace;cursor:pointer;';
    [['Fast (300ms)', 300], ['Normal (600ms)', 600], ['Slow (1s)', 1000]].forEach(function(opt) {
      var o = document.createElement('option');
      o.text = opt[0]; o.value = opt[1];
      if (opt[1] === 300) o.selected = true;
      speedSelect.appendChild(o);
    });

    inputRow.appendChild(inputLabel);
    inputRow.appendChild(hoursInput);
    inputRow.appendChild(inputLabel2);
    inputRow.appendChild(speedLabel);
    inputRow.appendChild(speedSelect);
    panel.appendChild(inputRow);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;';
    panel.appendChild(row);

    var makeBtn = function(label, bg, onClick) {
      var b = document.createElement('button');
      b.innerText = label;
      b.style.cssText = 'padding:10px 24px;background:' + bg + ';color:#000;font-size:14px;font-weight:bold;border:none;border-radius:8px;cursor:pointer;font-family:monospace;';
      b.onclick = onClick;
      row.appendChild(b);
      return b;
    };

    var running = false;
    var allEntries = [];
    var processedCount = 0;
    var reachedLimit = false;
    var staleTicks = 0;
    var downloadBtn = null;
    var startBtn, stopBtn;

    var showDownload = function() {
      if (allEntries.length === 0) return;
      var output = allEntries.join('\n');
      var blob = new Blob([output], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      if (downloadBtn) {
        downloadBtn.href = url;
        downloadBtn.download = 'guild-log-' + new Date().toISOString().slice(0,10) + '.txt';
        downloadBtn.innerText = 'Download (' + allEntries.length + ' entries)';
        downloadBtn.style.display = '';
        return;
      }
      downloadBtn = document.createElement('a');
      downloadBtn.href = url;
      downloadBtn.download = 'guild-log-' + new Date().toISOString().slice(0,10) + '.txt';
      downloadBtn.style.cssText = 'padding:12px 24px;background:#4ade80;color:#000;font-size:14px;font-weight:bold;border-radius:8px;text-decoration:none;font-family:monospace;';
      downloadBtn.innerText = 'Download (' + allEntries.length + ' entries)';
      panel.appendChild(downloadBtn);
    };

    startBtn = makeBtn('START', '#4ade80', function() {
      running = true;
      reachedLimit = false;
      staleTicks = 0;
      startBtn.style.display = 'none';
      stopBtn.style.display = '';
      hoursInput.disabled = true;
      speedSelect.disabled = true;
      if (downloadBtn) downloadBtn.style.display = 'none';
      run();
    });

    stopBtn = makeBtn('STOP', '#f87171', function() {
      running = false;
      stopBtn.style.display = 'none';
      startBtn.style.display = '';
      hoursInput.disabled = false;
      speedSelect.disabled = false;
      statusEl.innerText = 'Stopped — ' + allEntries.length + ' entries. Hit START to resume.';
      showDownload();
    });
    stopBtn.style.display = 'none';

    var collectNew = function(container, maxAgeMs) {
      var items = Array.from(container.querySelectorAll('li'));
      var newItems = items.slice(processedCount);
      for (var i = 0; i < newItems.length; i++) {
        var item = newItems[i];
        var text = item.innerText && item.innerText.trim();
        if (!text || text.length < 10) continue;
        var lines = text.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        var actionLine = lines.find(isActionLine);
        if (!actionLine) continue;
        var agoLine = lines.find(function(l) { return parseAgo(l) !== null; });
        var ageMs = agoLine ? parseAgo(agoLine) : null;
        if (ageMs !== null && ageMs > maxAgeMs) { reachedLimit = true; continue; }
        allEntries.push(actionLine);
      }
      var prev = processedCount;
      processedCount = items.length;
      return processedCount - prev;
    };

    var run = async function() {
      var maxAgeMs = parseFloat(hoursInput.value) * 3600000;
      var container = findScrollContainer();
      if (!container) {
        alert('Could not find the events list. Make sure the guild events panel is open.');
        running = false; startBtn.style.display = ''; stopBtn.style.display = 'none';
        hoursInput.disabled = false;
      speedSelect.disabled = false;
        return;
      }
      while (running && !reachedLimit && staleTicks < 20) {
        var newCount = collectNew(container, maxAgeMs);
        if (newCount === 0) { staleTicks++; } else { staleTicks = 0; }
        statusEl.innerText = allEntries.length + ' entries | Stale: ' + staleTicks + '/20 | Done: ' + reachedLimit;
        container.scrollTop = container.scrollHeight;
        container.dispatchEvent(new Event('scroll', { bubbles: true }));
        container.dispatchEvent(new WheelEvent('wheel', { deltaY: 500, bubbles: true }));
        var items = container.querySelectorAll('li');
        if (items.length > 0) items[items.length - 1].scrollIntoView({ block: 'end' });
        var parent = container.parentElement;
        for (var j = 0; j < 5; j++) {
          if (!parent) break;
          parent.scrollTop = parent.scrollHeight;
          parent.dispatchEvent(new Event('scroll', { bubbles: true }));
          parent = parent.parentElement;
        }
        await new Promise(function(r) { setTimeout(r, parseInt(speedSelect.value)); });
      }
      if (!running) return;
      collectNew(container, maxAgeMs);
      statusEl.innerText = 'Done — ' + allEntries.length + ' entries collected';
      stopBtn.style.display = 'none';
      startBtn.style.display = '';
      hoursInput.disabled = false;
      speedSelect.disabled = false;
      showDownload();
    };
  })();
