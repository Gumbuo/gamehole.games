// Easy Kitchen Designer: type a wall length, drag stock cabinet sizes onto the wall.
(function () {
  'use strict';
  const { fmtIn, fmtFtIn, fillRun, num, BASE_WIDTHS, WALL_WIDTHS } = window.CabLogic;
  const RD = window.CabRender;
  const STORE = 'cabinet-easy-v1';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const r1 = (v) => Math.round(v * 100) / 100;
  const nid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------- catalog ----------

  const UPPER = new Set(['wall', 'overfridge', 'wallcorner', 'hood', 'window', 'gap', 'ufiller']);
  const rowOf = (type) => (UPPER.has(type) ? 'upper' : 'base');
  const APPLIANCE = new Set(['dishwasher', 'range', 'fridge', 'hood']);
  const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(v); return o; };

  const WIDTHS = {
    base: BASE_WIDTHS, sink: [30, 33, 36], dishwasher: [18, 24], range: [30, 36], fridge: [30, 33, 36, 42],
    susan: [36], blind: [36, 39, 42, 45, 48], pantry: [18, 24, 30, 36], filler: [1, 1.5, 2, 3, 4.5, 6],
    wall: WALL_WIDTHS, overfridge: [30, 33, 36, 42], wallcorner: [24], hood: [30, 36], window: [24, 30, 36, 48, 60],
    gap: range(6, 60, 6), ufiller: [1, 1.5, 2, 3, 4.5, 6],
  };

  const PALETTE = [
    { title: 'Base cabinets', row: 'base', items: BASE_WIDTHS.map((w) => ({ type: 'base', w })) },
    { title: 'Sink bases', row: 'base', items: [30, 33, 36].map((w) => ({ type: 'sink', w })) },
    { title: 'Appliances', row: 'base', items: [{ type: 'dishwasher', w: 24 }, { type: 'range', w: 30 }, { type: 'range', w: 36 }, { type: 'fridge', w: 30 }, { type: 'fridge', w: 33 }, { type: 'fridge', w: 36 }] },
    { title: 'Corners, pantry & filler', row: 'base', items: [{ type: 'susan', w: 36 }, { type: 'blind', w: 42 }, { type: 'pantry', w: 18 }, { type: 'pantry', w: 24 }, { type: 'pantry', w: 30 }, { type: 'filler', w: 3 }] },
    { title: 'Upper cabinets', row: 'upper', items: WALL_WIDTHS.map((w) => ({ type: 'wall', w })) },
    { title: 'Over fridge & corner', row: 'upper', items: [30, 33, 36].map((w) => ({ type: 'overfridge', w })).concat([{ type: 'wallcorner', w: 24 }]) },
    { title: 'Hood, window & open wall', row: 'upper', items: [{ type: 'hood', w: 30 }, { type: 'hood', w: 36 }, { type: 'window', w: 30 }, { type: 'window', w: 36 }, { type: 'window', w: 48 }, { type: 'gap', w: 12 }, { type: 'gap', w: 24 }, { type: 'gap', w: 36 }, { type: 'ufiller', w: 3 }] },
  ];

  // spec {id, type, w} -> drawable piece for render.js
  function makePiece(s) {
    const H = state.H, top = 54 + H, hOver = Math.max(12, top - 72), w = +s.w;
    const W = fmtIn(w) + '"';
    switch (s.type) {
      case 'base': return { kind: 'base', code: 'B' + w, w, name: `Base ${W}`, desc: `Base cabinet, ${W} W × 34½" H × 24" D`, group: 'cabinet' };
      case 'sink': return { kind: 'sink', code: 'SB' + w, w, name: `Sink base ${W}`, desc: `Sink base, ${W} W × 34½" H × 24" D`, group: 'cabinet' };
      case 'dishwasher': return { kind: 'dishwasher', code: 'DW' + w, w, name: `Dishwasher ${W}`, desc: `Dishwasher opening, ${W} W`, group: 'appliance' };
      case 'range': return { kind: 'range', code: 'RANGE' + w, w, name: `Range ${W}`, desc: `Range / cooktop opening, ${W} W`, group: 'appliance' };
      case 'fridge': return { kind: 'fridge', code: 'REF' + w, w, name: `Refrigerator ${W}`, desc: `Refrigerator opening, ${W} W`, group: 'appliance' };
      case 'susan': return { kind: 'corner', code: 'LS36', w, name: 'Lazy susan corner', desc: 'Lazy susan corner base, 36" × 36"', group: 'cabinet' };
      case 'blind': return { kind: 'corner', code: 'BBC' + w, w, name: `Blind corner ${W}`, desc: `Blind corner base, ${W} W`, group: 'cabinet' };
      case 'pantry': return { kind: 'pantry', code: `TP${w}${top}`, w, h: top, name: `Tall pantry ${W}`, desc: `Tall pantry, ${W} W × ${top}" H × 24" D`, group: 'cabinet' };
      case 'filler': return { kind: 'filler', code: 'F', w, name: `Filler ${W}`, desc: `Base filler strip, ${W}`, group: 'filler' };
      case 'wall': return { kind: 'wall', code: `W${w}${H}`, w, h: H, name: `Upper ${W}`, desc: `Wall cabinet, ${W} W × ${H}" H × 12" D`, group: 'cabinet' };
      case 'overfridge': return { kind: 'wall', code: `W${w}${hOver}`, w, h: hOver, deep: true, name: `Over-fridge ${W}`, desc: `Wall cabinet over fridge, ${W} W × ${hOver}" H × 24" D`, group: 'cabinet' };
      case 'wallcorner': return { kind: 'wallcorner', code: `WDC24${H}`, w, h: H, name: 'Corner upper', desc: `Diagonal corner wall cabinet, 24" × 24" × ${H}" H`, group: 'cabinet' };
      case 'hood': return { kind: 'hood', code: 'HOOD' + w, w, name: `Range hood ${W}`, desc: `Range hood, ${W} W`, group: 'appliance' };
      case 'window': return { kind: 'window', code: '', w, name: `Window ${W}`, desc: '', group: 'none' };
      case 'gap': return { kind: 'gap', code: '', w, name: `Open wall ${W}`, desc: '', group: 'none' };
      case 'ufiller': return { kind: 'filler', code: 'F', w, h: H, name: `Upper filler ${W}`, desc: `Upper filler strip, ${W}`, group: 'filler' };
      default: return { kind: 'gap', code: '', w, name: '?', group: 'none' };
    }
  }
  const tileLabel = (s) => {
    const p = makePiece(s);
    const short = { window: 'Window', gap: 'Open', filler: 'Filler', ufiller: 'Filler', hood: 'Hood' }[s.type];
    return { code: p.code && p.code !== 'F' ? p.code : `${short} ${fmtIn(s.w)}"`, name: p.name };
  };

  // ---------- state ----------

  const blankWall = (n) => ({ id: nid(), name: `Wall ${n}`, ft: '', inch: '', base: [], upper: [] });
  function defaultState() {
    return { H: 30, cur: 0, walls: [blankWall(1)], style: Object.assign({}, RD.DEFAULT_STYLE, { labels: true }) };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && Array.isArray(s.walls) && s.walls.length) return s;
    } catch (e) { /* ignore */ }
    return null;
  }
  const state = load() || defaultState();
  state.style = Object.assign({}, RD.DEFAULT_STYLE, state.style || {});
  if (!(state.cur < state.walls.length)) state.cur = 0;
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  const history = [];
  function commit() {
    history.push(JSON.stringify(state));
    if (history.length > 60) history.shift();
  }
  function undo() {
    const s = history.pop();
    if (!s) return;
    const o = JSON.parse(s);
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, o);
    selected = null;
    renderAll();
  }

  let selected = null; // {row, id}
  const wall = () => state.walls[state.cur];
  const wallLen = (w) => (num(w.ft) || 0) * 12 + (num(w.inch) || 0);
  const used = (list) => list.reduce((s, p) => s + +p.w, 0);

  // ---------- geometry of the current wall ----------

  function pack(specs, row) {
    let x = 0;
    return specs.map((s, i) => {
      const p = makePiece(s);
      p.x = x; p.id = s.id; p.row = row; p.type = s.type;
      if (s.type === 'susan' || s.type === 'blind' || s.type === 'wallcorner') p.side = i === 0 ? 'left' : 'right';
      x += p.w;
      return p;
    });
  }

  function view() {
    const w = wall();
    const L = wallLen(w);
    const base = pack(w.base, 'base');
    const upper = pack(w.upper, 'upper');
    const baseEnd = used(w.base), upEnd = used(w.upper);
    const top = 54 + state.H;
    return {
      w, L, base, upper, baseEnd, upEnd, top, H: state.H, ceil: Math.max(96, top),
      xEnd: Math.max(L, baseEnd, upEnd),
    };
  }

  // ---------- rendering ----------

  const $ = (id) => document.getElementById(id);
  let V = null;

  function renderTabs() {
    $('tabs').innerHTML = state.walls.map((w, i) => `<button type="button" class="tab${i === state.cur ? ' on' : ''}" data-tab="${i}">${esc(w.name || 'Wall ' + (i + 1))}</button>`).join('')
      + (state.walls.length < 6 ? '<button type="button" class="tab add" data-act="addwall">+ Add wall</button>' : '');
    const w = wall();
    $('wallset').innerHTML = `
      <label class="field"><span>Wall name</span><input type="text" class="nm" data-wf="name" value="${esc(w.name)}"></label>
      <div class="field big-len"><span>Wall length (wall to wall)</span>
        <div class="len">
          <input type="text" inputmode="decimal" data-wf="ft" value="${esc(w.ft)}" placeholder="10" aria-label="Feet"><span class="unit">ft</span>
          <input type="text" inputmode="decimal" data-wf="inch" value="${esc(w.inch)}" placeholder="0" aria-label="Inches"><span class="unit">in</span>
        </div>
      </div>
      <label class="field"><span>Upper cabinet height</span>
        <select data-h>
          ${[30, 36, 42].map((h) => `<option value="${h}"${state.H === h ? ' selected' : ''}>${h}"${h === 30 ? ' (most common)' : h === 42 ? ' (to an 8\' ceiling)' : ''}</option>`).join('')}
        </select>
      </label>
      <div class="row">
        <button type="button" class="linkbtn" data-act="example">Load an example</button>
        <button type="button" class="linkbtn danger" data-act="clear">Clear wall</button>
        ${state.walls.length > 1 ? '<button type="button" class="linkbtn danger" data-act="delwall">Delete wall</button>' : ''}
      </div>`;
  }

  function rowStat(label, usedIn, L, row) {
    if (!L) return `<div class="rowstat"><div class="t"><b>${label}</b><span>Enter the wall length first</span></div><div class="bar"><i style="width:0"></i></div></div>`;
    const left = L - usedIn;
    const cls = left < -0.01 ? 'over' : left < 0.01 ? 'full' : '';
    const msg = left < -0.01 ? `${fmtIn(-left)}" too long` : left < 0.01 ? 'Full ✓' : `${fmtIn(left)}" open`;
    const fill = left >= 0.5 ? `<button type="button" class="sbtn fill" data-act="fill" data-row="${row}">Fill the open space for me</button>` : '';
    return `<div class="rowstat ${cls}">
      <div class="t"><b>${label}</b><span>${msg}</span></div>
      <div class="bar"><i style="width:${Math.min(100, (usedIn / L) * 100)}%"></i></div>
      <div class="t"><small>${fmtIn(usedIn)}" of ${fmtIn(L)}" used</small>${fill}</div>
    </div>`;
  }

  function renderCanvas() {
    V = view();
    const Rall = { top: V.top, H: V.H, tallH: V.top };
    const wv = { name: V.w.name, length: V.L || V.xEnd || 120, base: V.base, upper: V.upper, xEnd: V.xEnd, uppers: true, warn: [] };
    if (!V.L) V.Lshow = wv.length; else V.Lshow = V.L;
    let svg = RD.elevation(wv, Rall, state.style, 'ez');
    svg = svg.replace(/<\/svg>$/, '<g id="ov"></g></svg>');
    $('canvas').innerHTML = svg;
    V.svg = $('canvas').querySelector('svg');
    drawOverlay();

    $('status').innerHTML = rowStat('Lower cabinets', V.baseEnd, V.L, 'base') + rowStat('Upper cabinets', V.upEnd, V.L, 'upper');
    renderSel();
    renderWarn();
  }

  function pieceBox(p) {
    // returns [x, hBottom, w, hTop] in inches from floor
    if (p.row === 'base') {
      const hTop = p.kind === 'fridge' ? 70 : p.kind === 'pantry' ? V.top : 36;
      return [p.x, 0, p.w, hTop];
    }
    if (p.kind === 'window') return [p.x, 42, p.w, 80];
    if (p.kind === 'hood') return [p.x, 66, p.w, V.top];
    if (p.kind === 'gap') return [p.x, V.top - V.H, p.w, V.top];
    return [p.x, V.top - (p.h || V.H), p.w, V.top];
  }

  function drawOverlay() {
    const g = V.svg && V.svg.querySelector('#ov');
    if (!g) return;
    const y = (h) => V.ceil - h;
    const L = V.Lshow;
    const o = [];
    if (V.L) {
      if (V.baseEnd < L - 0.01) {
        const w = L - V.baseEnd;
        o.push(`<rect class="ov-empty" x="${r1(V.baseEnd)}" y="${y(34.5)}" width="${r1(w)}" height="30.5"/>`);
        if (w >= 14) o.push(`<text class="ov-txt" x="${r1(V.baseEnd + w / 2)}" y="${y(19)}">${fmtIn(w)}" open</text>`);
      }
      if (V.upEnd < L - 0.01) {
        const w = L - V.upEnd;
        o.push(`<rect class="ov-empty" x="${r1(V.upEnd)}" y="${y(V.top)}" width="${r1(w)}" height="${V.H}"/>`);
        if (w >= 14) o.push(`<text class="ov-txt" x="${r1(V.upEnd + w / 2)}" y="${y(V.top - V.H / 2)}">${fmtIn(w)}" open</text>`);
      }
      if (V.xEnd > L + 0.01) o.push(`<rect class="ov-over" x="${r1(L)}" y="${y(V.ceil)}" width="${r1(V.xEnd - L)}" height="${V.ceil}"/>`);
    }
    // invisible hit areas so the cursor shows "grab"
    for (const p of [...V.base, ...V.upper]) {
      const [x, h0, w, h1] = pieceBox(p);
      o.push(`<rect class="hit" x="${r1(x)}" y="${r1(y(h1))}" width="${r1(w)}" height="${r1(h1 - h0)}" fill="transparent"/>`);
    }
    if (selected) {
      const p = [...V.base, ...V.upper].find((q) => q.id === selected.id);
      if (p) {
        const [x, h0, w, h1] = pieceBox(p);
        o.push(`<rect class="ov-sel" x="${r1(x)}" y="${r1(y(h1))}" width="${r1(w)}" height="${r1(h1 - h0)}" rx=".8"/>`);
      }
    }
    if (drag && drag.target) {
      const t = drag.target;
      const [h0, h1] = t.row === 'base' ? [0, 36] : [V.top - V.H, V.top];
      const w = +drag.spec.w;
      o.push(`<rect class="ov-dropzone" x="${r1(t.x)}" y="${r1(y(h1))}" width="${r1(w)}" height="${h1 - h0}"/>`);
      o.push(`<rect class="ov-drop" x="${r1(t.x - 0.6)}" y="${r1(y(h1) - 2)}" width="1.2" height="${h1 - h0 + 4}" rx=".6"/>`);
    }
    g.innerHTML = o.join('');
  }

  function renderSel() {
    const el = $('selbar');
    const p = selected && [...V.base, ...V.upper].find((q) => q.id === selected.id);
    if (!p) {
      el.innerHTML = `<p class="hint">${V.L ? 'Drag sizes from the list onto the wall, or tap one to add it at the end. Click a cabinet on the wall to change or remove it.' : 'Start by typing your wall length above.'}</p>`;
      return;
    }
    const list = wall()[p.row];
    const i = list.findIndex((s) => s.id === p.id);
    const ws = WIDTHS[p.type] || [p.w];
    const wi = ws.indexOf(+p.w);
    el.innerHTML = `
      <span class="what">${esc(p.name)} <small>${esc(p.code && p.code !== 'F' ? p.code : '')}</small></span>
      <button type="button" class="sbtn" data-sel="left"${i <= 0 ? ' disabled' : ''}>◀ Move left</button>
      <button type="button" class="sbtn" data-sel="right"${i >= list.length - 1 ? ' disabled' : ''}>Move right ▶</button>
      <button type="button" class="sbtn" data-sel="narrower"${wi <= 0 ? ' disabled' : ''}>Narrower</button>
      <button type="button" class="sbtn" data-sel="wider"${wi < 0 || wi >= ws.length - 1 ? ' disabled' : ''}>Wider</button>
      <button type="button" class="sbtn" data-sel="dup">Duplicate</button>
      <button type="button" class="sbtn danger" data-sel="remove">Remove</button>`;
  }

  function renderWarn() {
    const warn = [];
    const ov = (a, b) => a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01;
    for (const b of V.base) {
      for (const u of V.upper) {
        if (!ov(b, u) || u.kind === 'gap') continue;
        if (b.kind === 'fridge' && u.kind !== 'hood' && pieceBox(u)[1] < 70) warn.push(`${u.code || u.name} runs into the refrigerator. Use an "Over fridge" cabinet (or open wall) above it.`);
        if (b.kind === 'pantry') warn.push(`${u.code || u.name} overlaps the tall pantry. Leave open wall above the pantry.`);
        if (b.kind === 'range' && (u.kind === 'wall' || u.kind === 'wallcorner')) warn.push(`${u.code} is right over the range. Put a range hood there.`);
      }
      if (b.kind === 'dishwasher') {
        const i = V.base.indexOf(b);
        if (![V.base[i - 1], V.base[i + 1]].some((n) => n && n.kind === 'sink')) warn.push('The dishwasher usually goes right next to the sink.');
      }
    }
    if (V.L && V.baseEnd > V.L + 0.01) warn.unshift(`The lower cabinets are ${fmtIn(V.baseEnd - V.L)}" longer than the wall. Remove one or pick a narrower size.`);
    if (V.L && V.upEnd > V.L + 0.01) warn.unshift(`The upper cabinets are ${fmtIn(V.upEnd - V.L)}" longer than the wall.`);
    $('warn').innerHTML = [...new Set(warn)].map((t) => `<li class="warn">${esc(t)}</li>`).join('');
  }

  function renderPalette() {
    const L = wallLen(wall());
    const left = { base: L - used(wall().base), upper: L - used(wall().upper) };
    let h = `<h2>Cabinet sizes</h2><p class="pal-help">Drag a size onto the wall, or tap to add it at the end. Sizes too wide for the open space are faded.</p>`;
    for (const g of PALETTE) {
      const room = left[g.row];
      h += `<div class="pal-group"><h3>${g.title}${L ? `<em>${fmtIn(Math.max(0, room))}" open</em>` : ''}</h3><div class="tiles">`;
      for (const s of g.items) {
        const t = tileLabel(s);
        const nofit = L && s.w > room + 0.01;
        h += `<button type="button" class="tile${APPLIANCE.has(s.type) ? ' app' : ''}${nofit ? ' nofit' : ''}" data-type="${s.type}" data-w="${s.w}" title="${esc(t.name)}">
          <b>${esc(t.code)}</b><span>${esc(t.name)}</span><i style="width:${Math.min(100, (s.w / 48) * 100)}%"></i></button>`;
      }
      h += '</div></div>';
    }
    $('palette').innerHTML = h;
  }

  function opt(v, label, cur) { return `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`; }
  function swatches(key, list) {
    const cur = state.style[key];
    const custom = /^#/.test(cur) ? cur : (list.find((c) => c.id === cur) || list[0]).hex;
    return `<div class="swatches">${list.map((c) => `<button type="button" class="sw${c.id === cur ? ' on' : ''}${c.wood ? ' wood' : ''}" style="--c:${c.hex}" data-sw="${key}" data-v="${c.id}" title="${esc(c.name)}" aria-label="${esc(c.name)}" aria-pressed="${c.id === cur}"></button>`).join('')}
      <label class="sw custom${/^#/.test(cur) ? ' on' : ''}" title="Pick any color"><input type="color" data-s="${key}" value="${custom}" aria-label="Custom color">+</label></div>`;
  }
  const sel = (key, label, map) => `<label class="field"><span>${label}</span><select data-s="${key}">${Object.entries(map).map(([k, v]) => opt(k, typeof v === 'string' ? v : v.name, state.style[key])).join('')}</select></label>`;

  function renderFinish() {
    const S = state.style;
    const cabName = /^#/.test(S.cab) ? 'Custom color' : (RD.CAB_COLORS.find((c) => c.id === S.cab) || {}).name;
    $('finish').innerHTML = `<h2>Colors &amp; finishes</h2>
      <div class="field"><span>Cabinet color <em class="pick">${esc(cabName || '')}</em></span>${swatches('cab', RD.CAB_COLORS)}</div>
      <div class="finishgrid" style="margin-top:10px">
        ${sel('door', 'Door style', RD.DOORS)}${sel('hw', 'Hardware', RD.HARDWARE)}${sel('hwFinish', 'Hardware finish', RD.HW_FINISH)}
        ${sel('counter', 'Countertop', RD.COUNTERS)}${sel('splash', 'Backsplash', RD.SPLASHES)}${sel('app', 'Appliances', RD.APPLIANCES)}
        ${sel('floor', 'Floor', RD.FLOORS)}
      </div>
      <div class="field" style="margin-top:10px"><span>Wall paint</span>${swatches('wall', RD.WALL_COLORS)}</div>
      <label class="check" style="margin-top:10px"><input type="checkbox" data-s="labels"${S.labels ? ' checked' : ''}> Show cabinet codes on the drawing</label>`;
  }

  function renderList() {
    const map = new Map();
    const fillers = [];
    state.walls.forEach((w) => {
      for (const s of [...w.base, ...w.upper]) {
        const p = makePiece(s);
        if (p.group === 'none') continue;
        if (p.group === 'filler') { fillers.push(p.name); continue; }
        if (!map.has(p.code)) map.set(p.code, { p, qty: 0, walls: new Set() });
        const e = map.get(p.code); e.qty++; e.walls.add(w.name);
      }
    });
    const rows = (grp) => [...map.values()].filter((e) => e.p.group === grp)
      .sort((a, b) => a.p.code.localeCompare(b.p.code, undefined, { numeric: true }))
      .map((e) => `<tr><td class="qty">${e.qty}</td><td class="code">${esc(e.p.code)}</td><td>${esc(e.p.desc)}</td><td>${esc([...e.walls].join(', '))}</td></tr>`).join('');
    const cabs = rows('cabinet'), apps = rows('appliance');
    const total = [...map.values()].filter((e) => e.p.group === 'cabinet').reduce((s, e) => s + e.qty, 0);
    $('list').innerHTML = `<h2>Your cabinet list <small style="font-weight:400;color:var(--muted)">${total} cabinet${total === 1 ? '' : 's'}, all walls</small></h2>
      ${cabs ? `<div class="tablewrap"><table><thead><tr><th>Qty</th><th>Code</th><th>Size</th><th>Wall</th></tr></thead><tbody>${cabs}</tbody></table></div>` : '<p class="hint">Nothing placed yet.</p>'}
      ${fillers.length ? `<p class="hint" style="margin-top:8px"><b>Fillers:</b> ${esc(fillers.join(', '))}</p>` : ''}
      ${apps ? `<h2 style="margin-top:14px">Appliance spaces</h2><div class="tablewrap"><table><thead><tr><th>Qty</th><th>Code</th><th>Opening</th><th>Wall</th></tr></thead><tbody>${apps}</tbody></table></div>` : ''}`;
  }

  function renderAll() {
    renderTabs(); renderCanvas(); renderPalette(); renderFinish(); renderList();
    $('undoBtn').disabled = !history.length;
    save();
  }
  function refresh() { // everything except inputs that may have focus
    renderCanvas(); renderPalette(); renderList();
    $('undoBtn').disabled = !history.length;
    save();
  }

  // ---------- editing ----------

  function addSpec(type, w, row, index) {
    const s = { id: nid(), type, w: +w };
    const list = wall()[row];
    list.splice(index == null ? list.length : index, 0, s);
    selected = { row, id: s.id };
    return s;
  }

  function fillOpen(row) {
    const L = wallLen(wall());
    const left = L - used(wall()[row]);
    if (left < 0.5) return;
    commit();
    if (row === 'upper') { fillUpper(L); selected = null; return; }
    const f = fillRun(left, BASE_WIDTHS);
    f.cabs.forEach((w) => addSpec('base', w, row));
    if (f.filler > 0.05) addSpec('filler', Math.round(f.filler * 8) / 8, row);
    selected = null;
  }

  // Uppers follow what's below them: over-fridge cabinet above the fridge,
  // a hood above the range, open wall above a tall pantry, regular uppers elsewhere.
  function fillUpper(L) {
    const v = view();
    let x = v.upEnd;
    const segs = [];
    const run = (w) => {
      const last = segs[segs.length - 1];
      if (last && last.type === 'run') last.w += w; else segs.push({ type: 'run', w });
    };
    for (const b of v.base) {
      const s = Math.max(b.x, x), e = Math.min(b.x + b.w, L);
      if (e <= s + 0.01) continue;
      const special = b.kind === 'fridge' ? 'overfridge' : b.kind === 'range' ? 'hood' : b.kind === 'pantry' ? 'gap' : null;
      if (special && Math.abs(s - b.x) < 0.01 && Math.abs(e - (b.x + b.w)) < 0.01 && (WIDTHS[special].includes(b.w) || special === 'gap')) segs.push({ type: special, w: b.w });
      else if (special) segs.push({ type: 'gap', w: e - s });
      else run(e - s);
      x = e;
    }
    if (x < L - 0.01) run(L - x);
    for (const s of segs) {
      if (s.type !== 'run') { addSpec(s.type, s.w, 'upper'); continue; }
      const f = fillRun(s.w, WALL_WIDTHS);
      f.cabs.forEach((w) => addSpec('wall', w, 'upper'));
      if (f.filler > 0.05) addSpec('ufiller', Math.round(f.filler * 8) / 8, 'upper');
    }
  }

  function loadExample() {
    commit();
    const w = wall();
    if (!wallLen(w)) { w.ft = '10'; w.inch = '0'; }
    const L = wallLen(w);
    const s = (type, wd) => ({ id: nid(), type, w: wd });
    w.base = [s('fridge', 36), s('base', 15), s('range', 30), s('base', 15)];
    w.upper = [s('overfridge', 36), s('wall', 15), s('hood', 30), s('wall', 15)];
    const rest = L - 96;
    if (rest >= 9) {
      const f = fillRun(rest, BASE_WIDTHS);
      f.cabs.forEach((x) => { w.base.push(s('base', x)); w.upper.push(s('wall', x)); });
      if (f.filler > 0.05) { w.base.push(s('filler', f.filler)); w.upper.push(s('ufiller', f.filler)); }
    }
    selected = null;
    renderAll();
  }

  function selAction(a) {
    const list = wall()[selected.row];
    const i = list.findIndex((s) => s.id === selected.id);
    if (i < 0) return;
    const s = list[i];
    commit();
    if (a === 'left' && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    else if (a === 'right' && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    else if (a === 'narrower' || a === 'wider') {
      const ws = WIDTHS[s.type] || [s.w];
      const wi = ws.indexOf(+s.w);
      const ni = wi + (a === 'wider' ? 1 : -1);
      if (ni >= 0 && ni < ws.length) s.w = ws[ni];
    } else if (a === 'dup') {
      const c = { id: nid(), type: s.type, w: s.w };
      list.splice(i + 1, 0, c);
      selected = { row: selected.row, id: c.id };
    } else if (a === 'remove') {
      list.splice(i, 1);
      selected = null;
    }
    refresh();
  }

  // ---------- drag & drop (pointer events: mouse, pen and touch) ----------

  let drag = null;
  let ghost = null;
  const trash = $('trash');

  function toInches(e) {
    const pt = V.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(V.svg.getScreenCTM().inverse());
    return { x: p.x, h: V.ceil - p.y };
  }
  const inside = (el, e) => { const r = el.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };

  function hitPiece(e) {
    const { x, h } = toInches(e);
    const at = (p) => { const [px, h0, w, h1] = pieceBox(p); return x >= px && x <= px + w && h >= h0 && h <= h1; };
    return V.upper.find(at) || V.base.find(at) || null;
  }

  function dropTarget(e) {
    const row = rowOf(drag.spec.type);
    const { x } = toInches(e);
    const list = wall()[row].filter((s) => !drag.from || s.id !== drag.from.id);
    let acc = 0, index = 0, bx = 0;
    for (let i = 0; i < list.length; i++) {
      const w = +list[i].w;
      if (acc + w / 2 < x) { index = i + 1; bx = acc + w; }
      acc += w;
    }
    return { row, index, x: bx };
  }

  function startDrag(e, spec, from) {
    drag = { spec, from, sx: e.clientX, sy: e.clientY, started: false, target: null, trash: false };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', endDrag);
  }

  function onMove(e) {
    if (!drag) return;
    if (!drag.started) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      drag.started = true;
      ghost = document.createElement('div');
      ghost.className = 'ghost';
      ghost.textContent = tileLabel(drag.spec).code;
      document.body.appendChild(ghost);
      document.body.classList.add('dragging');
      if (drag.from) trash.classList.add('show');
    }
    e.preventDefault();
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    drag.trash = !!drag.from && inside(trash, e);
    trash.classList.toggle('hot', drag.trash);
    drag.target = !drag.trash && V.svg && inside(V.svg, e) ? dropTarget(e) : null;
    ghost.classList.toggle('del', drag.trash);
    ghost.classList.toggle('bad', !drag.trash && !drag.target);
    ghost.textContent = drag.trash ? 'Remove' : tileLabel(drag.spec).code;
    drawOverlay();
  }

  function endDrag() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', endDrag);
    if (ghost) ghost.remove();
    ghost = null;
    document.body.classList.remove('dragging');
    trash.classList.remove('show', 'hot');
    const d = drag;
    drag = null;
    if (d && d.started) drawOverlay();
    return d;
  }

  function onUp() {
    const d = endDrag();
    if (!d) return;
    if (!d.started) {
      // a tap / click
      if (d.from) selected = selected && selected.id === d.from.id ? null : { row: d.from.row, id: d.from.id };
      else { commit(); addSpec(d.spec.type, d.spec.w, rowOf(d.spec.type)); }
      refresh();
      return;
    }
    if (d.trash && d.from) {
      commit();
      const list = wall()[d.from.row];
      list.splice(list.findIndex((s) => s.id === d.from.id), 1);
      selected = null;
      refresh();
      return;
    }
    if (!d.target) return;
    commit();
    const list = wall()[d.target.row];
    if (d.from) {
      const i = list.findIndex((s) => s.id === d.from.id);
      const [s] = list.splice(i, 1);
      list.splice(d.target.index, 0, s);
      selected = { row: d.target.row, id: s.id };
    } else {
      addSpec(d.spec.type, d.spec.w, d.target.row, d.target.index);
    }
    refresh();
  }

  $('palette').addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.tile');
    if (!t || e.button > 0) return;
    if (e.pointerType === 'mouse') e.preventDefault();
    startDrag(e, { type: t.dataset.type, w: +t.dataset.w }, null);
  });
  $('palette').addEventListener('keydown', (e) => {
    const t = e.target.closest('.tile');
    if (t && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      commit(); addSpec(t.dataset.type, t.dataset.w, rowOf(t.dataset.type)); refresh();
    }
  });

  $('canvas').addEventListener('pointerdown', (e) => {
    if (!V || !V.svg || e.button > 0) return;
    const p = hitPiece(e);
    if (!p) { if (selected) { selected = null; renderSel(); drawOverlay(); } return; }
    if (e.pointerType === 'mouse') e.preventDefault();
    startDrag(e, { type: p.type, w: p.w }, { row: p.row, id: p.id });
  });

  // ---------- other controls ----------

  $('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.tab != null) { state.cur = +b.dataset.tab; selected = null; renderAll(); }
    else if (b.dataset.act === 'addwall') { commit(); state.walls.push(blankWall(state.walls.length + 1)); state.cur = state.walls.length - 1; selected = null; renderAll(); }
  });
  $('wallset').addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.wf) {
      wall()[t.dataset.wf] = t.value;
      if (t.dataset.wf === 'name') { renderList(); save(); $('tabs').querySelector('.tab.on').textContent = t.value || 'Wall'; }
      else refresh();
    }
  });
  $('wallset').addEventListener('change', (e) => {
    if (e.target.dataset.h != null) { commit(); state.H = +e.target.value; refresh(); }
  });
  $('wallset').addEventListener('click', (e) => {
    const a = e.target.closest('button') && e.target.closest('button').dataset.act;
    if (a === 'example') loadExample();
    else if (a === 'clear') { commit(); wall().base = []; wall().upper = []; selected = null; refresh(); }
    else if (a === 'delwall') { commit(); state.walls.splice(state.cur, 1); state.cur = Math.max(0, state.cur - 1); selected = null; renderAll(); }
  });
  $('status').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act=fill]');
    if (b) { fillOpen(b.dataset.row); refresh(); }
  });
  $('selbar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sel]');
    if (b && selected) selAction(b.dataset.sel);
  });
  $('finish').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sw]');
    if (!b) return;
    state.style[b.dataset.sw] = b.dataset.v;
    renderFinish(); renderCanvas(); save();
  });
  $('finish').addEventListener('input', (e) => {
    const t = e.target;
    if (t.type === 'color') { state.style[t.dataset.s] = t.value; renderCanvas(); save(); }
  });
  $('finish').addEventListener('change', (e) => {
    const t = e.target;
    if (!t.dataset.s) return;
    state.style[t.dataset.s] = t.type === 'checkbox' ? t.checked : t.value;
    renderFinish(); renderCanvas(); save();
  });
  $('undoBtn').addEventListener('click', undo);
  $('printBtn').addEventListener('click', () => window.print());

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); undo(); return; }
    if (!selected || typing) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); selAction('remove'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); selAction('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); selAction('right'); }
    else if (e.key === 'Escape') { selected = null; renderSel(); drawOverlay(); }
  });

  renderAll();
})();
