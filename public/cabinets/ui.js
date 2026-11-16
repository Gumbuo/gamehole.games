(function () {
  'use strict';
  const { ITEM_TYPES, NAMES, WALL_COUNT, fmtIn, fmtFtIn, computeAll, num } = window.CabLogic;
  const STORE = 'cabinet-planner-v1';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const auto = () => ({ type: 'auto', lock: '' });

  function defaultWalls() {
    return [
      { ft: '12', inch: '0', uppers: true, items: [{ type: 'fridge', w: 36 }, auto(), { type: 'range', w: 30 }, auto()] },
      { ft: '10', inch: '0', uppers: true, items: [auto(), { type: 'sink', w: 36, window: true }, { type: 'dishwasher', w: 24 }, auto()] },
      { ft: '8', inch: '0', uppers: true, items: [auto(), { type: 'pantry', w: 24 }] },
    ];
  }
  const RD = window.CabRender;
  function defaultState() { return { layout: 'L', cornerType: 'susan', upperH: 30, walls: defaultWalls(), style: Object.assign({}, RD.DEFAULT_STYLE) }; }

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && Array.isArray(s.walls) && WALL_COUNT[s.layout]) return s;
    } catch (e) { /* storage blocked or bad data */ }
    return null;
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  const state = load() || defaultState();
  const defaults = defaultWalls();
  function ensureWalls() {
    const n = WALL_COUNT[state.layout];
    while (state.walls.length < n) state.walls.push(defaults[state.walls.length]);
  }
  ensureWalls();
  state.style = Object.assign({}, RD.DEFAULT_STYLE, state.style || {});

  const form = document.getElementById('form');
  const results = document.getElementById('results');

  // ---------- form ----------

  function opt(value, label, cur) {
    return `<option value="${esc(value)}"${String(value) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`;
  }

  function cornerOf(i) {
    const L = state.layout;
    const left = (L === 'L' || L === 'U') && i >= 1 ? NAMES[i - 1] : null;
    const right = (L === 'L' && i === 0) || (L === 'U' && i <= 1) ? NAMES[i + 1] : null;
    return { left, right };
  }

  function renderForm() {
    const n = WALL_COUNT[state.layout];
    const hasCorner = state.layout === 'L' || state.layout === 'U';
    let h = `
      <div class="field"><span>Kitchen shape</span>
        <select data-g="layout">
          ${opt('single', 'Single wall', state.layout)}
          ${opt('galley', 'Galley (two facing walls)', state.layout)}
          ${opt('L', 'L-shape (2 walls + corner)', state.layout)}
          ${opt('U', 'U-shape (3 walls + 2 corners)', state.layout)}
        </select>
      </div>
      ${hasCorner ? `<div class="field"><span>Corner base cabinet</span>
        <select data-g="cornerType">
          ${opt('susan', 'Lazy susan (takes 36" on both walls)', state.cornerType)}
          ${opt('blind', 'Blind corner (42" on one wall, 3" filler)', state.cornerType)}
        </select></div>` : ''}
      <div class="field"><span>Upper cabinet height</span>
        <select data-g="upperH">
          ${opt(30, '30" (8\' ceiling, open space above)', state.upperH)}
          ${opt(36, '36" (8\' ceiling with crown, or 9\')', state.upperH)}
          ${opt(42, '42" (to an 8\' ceiling)', state.upperH)}
        </select>
      </div>
      <p class="hint">Measure each wall corner to corner (or to the end of the run). Then list what goes on it, <b>left to right as you face the wall</b>. "Cabinets (auto-fill)" sections split whatever space is left.</p>`;

    for (let i = 0; i < n; i++) {
      const w = state.walls[i];
      const c = cornerOf(i);
      h += `<div class="wallcard">
        <div class="wallhead"><h3>Wall ${NAMES[i]}</h3>
          <label class="check"><input type="checkbox" data-w="${i}" data-f="uppers"${w.uppers ? ' checked' : ''}> Upper cabinets</label>
        </div>
        <div class="field"><span>Length</span>
          <div class="len">
            <input type="text" inputmode="decimal" data-w="${i}" data-f="ft" value="${esc(w.ft)}" aria-label="Wall ${NAMES[i]} feet">
            <span class="unit">ft</span>
            <input type="text" inputmode="decimal" data-w="${i}" data-f="inch" value="${esc(w.inch)}" aria-label="Wall ${NAMES[i]} inches" placeholder="0">
            <span class="unit">in</span>
          </div>
        </div>
        <div class="items">
          ${c.left ? `<div class="cornertag">◤ Left end: corner with Wall ${c.left}</div>` : ''}
          ${w.items.map((it, j) => itemRow(i, j, it, w.items.length)).join('')}
          ${c.right ? `<div class="cornertag">Right end: corner with Wall ${c.right} ◥</div>` : ''}
        </div>
        <button type="button" class="btn ghost" data-act="add" data-w="${i}">+ Add item</button>
      </div>`;
    }
    form.innerHTML = h + styleForm();
  }

  function swatches(key, list) {
    const cur = state.style[key];
    const custom = /^#/.test(cur) ? cur : (list.find((c) => c.id === cur) || list[0]).hex;
    return `<div class="swatches" role="group">
      ${list.map((c) => `<button type="button" class="sw${c.id === cur ? ' on' : ''}${c.wood ? ' wood' : ''}" style="--c:${c.hex}" data-act="swatch" data-s="${key}" data-v="${c.id}" title="${esc(c.name)}" aria-label="${esc(c.name)}" aria-pressed="${c.id === cur}"></button>`).join('')}
      <label class="sw custom${/^#/.test(cur) ? ' on' : ''}" title="Pick any color"><input type="color" data-s="${key}" value="${custom}" aria-label="Custom color">+</label>
    </div>`;
  }

  function styleSelect(key, label, map) {
    return `<div class="field"><span>${label}</span><select data-s="${key}">
      ${Object.entries(map).map(([k, v]) => opt(k, typeof v === 'string' ? v : v.name, state.style[key])).join('')}
    </select></div>`;
  }

  function styleForm() {
    const S = state.style;
    const cabName = /^#/.test(S.cab) ? 'Custom color' : (RD.CAB_COLORS.find((c) => c.id === S.cab) || {}).name;
    return `<div class="wallcard stylecard">
      <h3>Look &amp; finish</h3>
      <div class="field"><span>Cabinet color <em class="pick">${esc(cabName || '')}</em></span>${swatches('cab', RD.CAB_COLORS)}</div>
      ${styleSelect('door', 'Door style', RD.DOORS)}
      <div class="two">
        ${styleSelect('hw', 'Hardware', RD.HARDWARE)}
        ${styleSelect('hwFinish', 'Hardware finish', RD.HW_FINISH)}
      </div>
      <div class="two">
        ${styleSelect('counter', 'Countertop', RD.COUNTERS)}
        ${styleSelect('splash', 'Backsplash', RD.SPLASHES)}
      </div>
      <div class="two">
        ${styleSelect('app', 'Appliances', RD.APPLIANCES)}
        ${styleSelect('floor', 'Floor', RD.FLOORS)}
      </div>
      <div class="field"><span>Wall paint</span>${swatches('wall', RD.WALL_COLORS)}</div>
      <label class="check"><input type="checkbox" data-s="labels"${S.labels ? ' checked' : ''}> Show cabinet codes on the drawings</label>
    </div>`;
  }

  function itemRow(i, j, it, count) {
    const t = ITEM_TYPES[it.type];
    const types = Object.keys(ITEM_TYPES).map((k) => opt(k, ITEM_TYPES[k].label, it.type)).join('');
    const size = it.type === 'auto'
      ? `<input type="text" inputmode="decimal" data-w="${i}" data-i="${j}" data-f="lock" value="${esc(it.lock || '')}" placeholder="auto" title="Leave blank to share the leftover space, or type a width in inches" aria-label="Section width in inches">`
      : `<select data-w="${i}" data-i="${j}" data-f="w" aria-label="Width">${t.widths.map((w) => opt(w, w + '"', it.w)).join('')}</select>`;
    return `<div class="item">
      <select data-w="${i}" data-i="${j}" data-f="type" aria-label="Item type">${types}</select>
      ${size}
      <button type="button" class="icon" data-act="up" data-w="${i}" data-i="${j}" title="Move left"${j === 0 ? ' disabled' : ''}>↑</button>
      <button type="button" class="icon" data-act="down" data-w="${i}" data-i="${j}" title="Move right"${j === count - 1 ? ' disabled' : ''}>↓</button>
      <button type="button" class="icon" data-act="del" data-w="${i}" data-i="${j}" title="Remove">✕</button>
      ${it.type === 'sink' ? `<label class="sub2"><input type="checkbox" data-w="${i}" data-i="${j}" data-f="window"${it.window ? ' checked' : ''}> Window over the sink (no upper cabinets there)</label>` : ''}
    </div>`;
  }

  function apply(t) {
    const d = t.dataset;
    const val = t.type === 'checkbox' ? t.checked : t.value;
    if (d.s) {
      state.style[d.s] = val;
      return t.type !== 'checkbox';
    }
    if (d.g) {
      state[d.g] = d.g === 'upperH' ? +val : val;
      if (d.g === 'layout') ensureWalls();
      return d.g === 'layout';
    }
    if (d.w == null) return false;
    const wall = state.walls[+d.w];
    if (d.i == null) { wall[d.f] = val; return false; }
    const it = wall.items[+d.i];
    if (d.f === 'type') {
      it.type = val;
      it.w = ITEM_TYPES[val].defaultW;
      it.lock = '';
      if (val === 'sink') it.window = true;
      return true;
    }
    it[d.f] = d.f === 'w' ? +val : val;
    return d.f === 'window' ? false : false;
  }

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.tagName === 'INPUT' && t.type === 'color') { apply(t); renderResults(); save(); return; }
    if (t.tagName !== 'INPUT' || t.type !== 'text') return;
    apply(t);
    t.classList.toggle('bad', Number.isNaN(num(t.value)));
    renderResults(); save();
  });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.tagName === 'INPUT' && t.type === 'text') return;
    if (apply(t)) renderForm();
    renderResults(); save();
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    if (b.dataset.act === 'swatch') {
      state.style[b.dataset.s] = b.dataset.v;
      renderForm(); renderResults(); save();
      return;
    }
    const wall = state.walls[+b.dataset.w];
    const j = +b.dataset.i;
    const a = b.dataset.act;
    if (a === 'add') wall.items.push(auto());
    else if (a === 'del') wall.items.splice(j, 1);
    else if (a === 'up' && j > 0) [wall.items[j - 1], wall.items[j]] = [wall.items[j], wall.items[j - 1]];
    else if (a === 'down' && j < wall.items.length - 1) [wall.items[j + 1], wall.items[j]] = [wall.items[j], wall.items[j + 1]];
    renderForm(); renderResults(); save();
  });
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  // ---------- results ----------

  function renderResults() {
    const R = computeAll(state);
    const totalCabs = R.cabinets.reduce((s, c) => s + c.qty, 0);
    const baseCabs = R.cabinets.filter((c) => !/^W/.test(c.code)).reduce((s, c) => s + c.qty, 0);
    let h = `<div class="card">
      <h2>Overview</h2>
      <div class="stats">
        <div class="stat"><b>${totalCabs}</b><span>cabinets</span></div>
        <div class="stat"><b>${baseCabs}</b><span>base + tall</span></div>
        <div class="stat"><b>${totalCabs - baseCabs}</b><span>upper</span></div>
        <div class="stat"><b>${R.fillers.length}</b><span>filler strips</span></div>
      </div>
      <div class="svgwrap">${RD.plan(R, state.style)}</div>
      <p class="hint">Top-down view of the base cabinets, which are 24" deep.</p>
    </div>`;

    R.walls.forEach((w, wi) => {
      const seq = (row) => row.filter((p) => p.code || p.kind === 'window').map((p) => (p.kind === 'filler' ? `F${fmtIn(p.w)}"` : p.kind === 'window' ? 'window' : p.code)).join(' · ');
      h += `<div class="card">
        <h2>Wall ${w.name} <small>${fmtFtIn(w.length)} · ${fmtIn(w.length)}"</small></h2>
        <div class="svgwrap">${RD.elevation(w, R, state.style, "e" + wi)}</div>
        ${w.uppers ? `<p class="seq">Upper: ${esc(seq(w.upper)) || '-'}</p>` : ''}
        <p class="seq">Base:&nbsp; ${esc(seq(w.base)) || '-'}</p>
        ${w.warn.length ? `<ul class="msgs">${w.warn.map((m) => `<li class="${m.level}">${esc(m.text)}</li>`).join('')}</ul>` : ''}
      </div>`;
    });

    const rows = (list) => list.map((c) => `<tr><td class="qty">${c.qty}</td><td class="code">${esc(c.code)}</td><td>${esc(c.desc || '')}</td><td>${esc(c.walls)}</td></tr>`).join('');
    const fillerGroups = {};
    for (const f of R.fillers) {
      const k = `${fmtIn(f.w)}" ${f.upper ? 'upper' : 'base'}`;
      fillerGroups[k] = (fillerGroups[k] || 0) + 1;
    }
    h += `<div class="card">
      <h2>Cabinet list</h2>
      <div class="tablewrap"><table>
        <thead><tr><th>Qty</th><th>Code</th><th>Size</th><th>Wall</th></tr></thead>
        <tbody>${rows(R.cabinets) || '<tr><td colspan="4">Nothing yet. Add some wall lengths.</td></tr>'}</tbody>
      </table></div>
      ${R.fillers.length ? `<p class="hint" style="margin-top:10px"><b>Fillers:</b> ${Object.entries(fillerGroups).map(([k, n]) => `${n} × ${k}`).join(', ')}. Cut these from 3" or 6" filler stock in the same finish.</p>` : ''}
      ${R.appliances.length ? `<h2 style="margin-top:16px">Appliance openings</h2>
      <div class="tablewrap"><table>
        <thead><tr><th>Qty</th><th>Code</th><th>Opening</th><th>Wall</th></tr></thead>
        <tbody>${rows(R.appliances)}</tbody>
      </table></div>` : ''}
      <p class="hint" style="margin-top:12px">How to read the codes: <b>B24</b> is a base cabinet 24" wide. <b>W3030</b> is a wall cabinet 30" wide × 30" tall (width first, then height). <b>SB</b> is a sink base, <b>TP</b> a tall pantry, <b>LS</b> a lazy susan, <b>BBC</b> a blind base corner, <b>WDC</b> a diagonal wall corner.</p>
    </div>`;

    results.innerHTML = h;
  }

  renderForm();
  renderResults();
})();
