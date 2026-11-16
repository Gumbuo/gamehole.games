// Cabinet layout logic. Pure functions, no DOM, so it runs in the browser and in Node.
// All measurements are in inches.
(function (root) {
  'use strict';

  // Standard stock widths (US). Base and wall cabinets both come in 3" steps.
  const BASE_WIDTHS = [9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const WALL_WIDTHS = [9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
  const MAX_FILLER = 3; // over this, a filler strip looks wrong; warn
  const NAMES = ['A', 'B', 'C'];
  const WALL_COUNT = { single: 1, galley: 2, L: 2, U: 3 };

  const ITEM_TYPES = {
    auto:       { label: 'Cabinets (auto-fill)' },
    sink:       { label: 'Sink base',        widths: [30, 33, 36],     defaultW: 36, code: 'SB' },
    dishwasher: { label: 'Dishwasher',       widths: [18, 24],         defaultW: 24, code: 'DW' },
    range:      { label: 'Range / cooktop',  widths: [30, 36],         defaultW: 30, code: 'RANGE' },
    fridge:     { label: 'Refrigerator',     widths: [30, 33, 36, 42], defaultW: 36, code: 'REF' },
    pantry:     { label: 'Tall pantry',      widths: [18, 24, 30, 36], defaultW: 24, code: 'TP' },
  };

  // ---------- number parsing / formatting ----------

  // Accepts "6", "6.5", "6 1/2", "1/2". Empty -> 0. Garbage -> NaN.
  function num(s) {
    s = String(s == null ? '' : s).trim();
    if (!s) return 0;
    const m = s.match(/^(\d+(?:\.\d+)?)?\s*(?:(\d+)\s*\/\s*(\d+))?$/);
    if (!m || (!m[1] && !m[2])) return NaN;
    let v = m[1] ? parseFloat(m[1]) : 0;
    if (m[2]) v += +m[2] / (+m[3] || 1);
    return v;
  }

  const FRACS = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
  function fmtIn(v) {
    const e = Math.round(v * 8);
    const whole = Math.floor(e / 8), frac = e % 8;
    if (!whole && frac) return FRACS[frac];
    return String(whole) + FRACS[frac];
  }
  function fmtFtIn(v) {
    const e = Math.round(v * 8);
    const ft = Math.floor(e / 96);
    return `${ft}' ${fmtIn((e - ft * 96) / 8)}"`;
  }

  // ---------- filling a run with stock cabinets ----------

  // Pick stock widths that fill W as closely as possible (smallest filler),
  // then use as few boxes as possible, and avoid skinny 9"/12" boxes.
  function fillRun(W, widths) {
    if (!(W > 0.01)) return { cabs: [], filler: Math.max(0, W || 0) };
    const N = Math.floor(W + 1e-6);
    const INF = 1e9;
    const cost = new Array(N + 1).fill(INF);
    const pick = new Array(N + 1).fill(0);
    cost[0] = 0;
    for (let n = 1; n <= N; n++) {
      for (const w of widths) {
        if (w > n || cost[n - w] >= INF) continue;
        const c = cost[n - w] + 10 + (w === 9 ? 6 : w === 12 ? 3 : 0);
        if (c < cost[n]) { cost[n] = c; pick[n] = w; }
      }
    }
    let n = N;
    while (n > 0 && cost[n] >= INF) n--;
    const cabs = [];
    for (let k = n; k > 0; k -= pick[k]) cabs.push(pick[k]);
    cabs.sort((a, b) => b - a);
    return { cabs, filler: W - n };
  }

  // ---------- corners ----------

  // Wall A's right end meets Wall B's left end (and B's right meets C's left).
  function cornersFor(layout, n) {
    const c = Array.from({ length: n }, () => ({ left: null, right: null }));
    const pairs = layout === 'L' ? [[0, 1]] : layout === 'U' ? [[0, 1], [1, 2]] : [];
    for (const [a, b] of pairs) {
      if (b >= n) continue;
      c[a].right = { other: b, primary: true };
      c[b].left = { other: a, primary: false };
    }
    return c;
  }

  const P = (code, w, kind, extra) => Object.assign({ code, w, kind, count: false }, extra || {});

  function baseCornerPieces(corner, side, ctx) {
    const other = 'Wall ' + NAMES[corner.other];
    if (ctx.cornerType === 'blind') {
      if (corner.primary) {
        return [P('BBC42', 42, 'corner', {
          count: true, group: 'cabinet',
          desc: 'Blind corner base, 42" W (blind side tucks into the corner)',
        })];
      }
      const dead = P('', 24, 'dead', { note: `blind corner from ${other}` });
      const fil = P('F', 3, 'filler', { count: true, group: 'filler', note: 'corner clearance' });
      return side === 'left' ? [dead, fil] : [fil, dead];
    }
    return [P('LS36', 36, 'corner', {
      count: corner.primary, group: 'cabinet',
      desc: 'Lazy susan corner base, 36" × 36"',
      note: corner.primary ? '' : `same cabinet as ${other}`,
    })];
  }

  // ---------- one wall ----------

  function layoutWall(wall, idx, ctx) {
    const L = wall.length;
    const H = ctx.H;
    const name = NAMES[idx];
    const warn = [];
    const c = ctx.corners[idx];
    const sum = (a) => a.reduce((s, p) => s + p.w, 0);

    const bl = c.left ? baseCornerPieces(c.left, 'left', ctx).map((p) => Object.assign(p, { side: 'left' })) : [];
    const br = c.right ? baseCornerPieces(c.right, 'right', ctx).map((p) => Object.assign(p, { side: 'right' })) : [];

    // Work out how wide each item is. Unlocked auto-fill sections share what's left.
    const items = wall.items.map((it) => Object.assign({}, it));
    let fixed = 0;
    for (const it of items) {
      if (it.type === 'auto') {
        const lk = num(it.lock);
        if (lk > 0) { it.width = lk; fixed += lk; } else it.width = null;
      } else {
        it.width = +it.w || ITEM_TYPES[it.type].defaultW;
        fixed += it.width;
      }
    }
    let rem = L - sum(bl) - sum(br) - fixed;
    let over = 0;
    if (rem < -0.01) {
      over = -rem;
      warn.push({ level: 'error', text: `Doesn't fit: the items on this wall need ${fmtIn(over)}" more than the wall has. Remove something or pick narrower sizes.` });
      rem = 0;
    }
    const autos = items.filter((it) => it.type === 'auto' && it.width == null);
    let gap = 0;
    if (autos.length) {
      const share = Math.floor(rem / autos.length / 3) * 3;
      let left = rem;
      autos.forEach((it, j) => {
        it.width = j === autos.length - 1 ? left : share;
        left -= it.width;
      });
    } else {
      gap = rem;
    }

    // ----- base row -----
    const base = [];
    const range = [];
    let x = 0;
    const push = (p) => { p.x = x; x += p.w; base.push(p); };
    bl.forEach(push);

    items.forEach((it, i) => {
      const x0 = x;
      if (it.type === 'auto') {
        const f = fillRun(it.width, BASE_WIDTHS);
        const cabs = f.cabs.map((w) => P('B' + w, w, 'base', { count: true, group: 'cabinet', desc: `Base cabinet, ${w}" W × 34½" H × 24" D` }));
        const bareStart = i === 0 && !c.left;
        const bareEnd = i === items.length - 1 && !c.right && gap < 0.01;
        let seq = cabs;
        if (f.filler > 0.01) {
          const fil = P('F', f.filler, 'filler', { count: true, group: 'filler' });
          seq = bareStart && !bareEnd ? [fil, ...cabs] : [...cabs, fil];
          if (!cabs.length) {
            warn.push({ level: 'warn', text: `A ${fmtIn(f.filler)}" space is too narrow for a cabinet (9" is the smallest). Close it with a filler, or shift an appliance.` });
          } else if (f.filler > MAX_FILLER + 0.01) {
            warn.push({ level: 'warn', text: `${fmtIn(f.filler)}" of filler in one spot is a lot. Try different appliance sizes or set a section width.` });
          }
        }
        seq.forEach(push);
      } else {
        const t = ITEM_TYPES[it.type];
        const extra = { count: true, item: i };
        if (it.type === 'sink') Object.assign(extra, { group: 'cabinet', desc: `Sink base, ${it.width}" W × 34½" H × 24" D`, window: !!it.window });
        else if (it.type === 'pantry') Object.assign(extra, { group: 'cabinet', h: ctx.tallH, desc: `Tall pantry, ${it.width}" W × ${ctx.tallH}" H × 24" D` });
        else Object.assign(extra, { group: 'appliance', desc: `${t.label} opening, ${it.width}" W` });
        const code = it.type === 'pantry' ? `TP${it.width}${ctx.tallH}` : t.code + it.width;
        push(P(code, it.width, it.type, extra));
      }
      range[i] = { x0, x1: x };
    });

    const gapX0 = x;
    if (gap > 0.01) {
      push(P('F', gap, 'filler', { count: true, group: 'filler' }));
      warn.push({ level: gap > MAX_FILLER ? 'warn' : 'info', text: `${fmtIn(gap)}" is left over at the end. Add a "Cabinets (auto-fill)" item to use it.` });
    }
    const rightX0 = x;
    br.forEach(push);
    const xEnd = x;

    // ----- upper row -----
    const upper = [];
    if (wall.uppers) {
      const hOver = Math.max(12, ctx.top - 72); // fridge is ~70" tall, leave a little air
      const wdc = (corner) => P(`WDC24${H}`, 24, 'wallcorner', {
        count: corner.primary ? true : !ctx.walls[corner.other].uppers,
        group: 'cabinet', h: H, desc: `Diagonal corner wall cabinet, 24" × 24" × ${H}" H`,
      });
      const spans = [];
      if (c.left) {
        const p = wdc(c.left); p.x = 0; p.side = 'left'; upper.push(p);
        // base corner zone is 27–42" deep into this wall; uppers only need 24"
        spans.push({ x0: 24, x1: sum(bl), fill: true });
      }
      items.forEach((it, i) => {
        const r = range[i];
        if (!r || r.x1 - r.x0 < 0.01) return;
        const fill = it.type === 'auto' || it.type === 'dishwasher' || (it.type === 'sink' && !it.window);
        spans.push({ x0: r.x0, x1: r.x1, fill, it });
      });
      if (gap > 0.01) spans.push({ x0: gapX0, x1: rightX0, fill: true });
      if (c.right) {
        spans.push({ x0: rightX0, x1: xEnd - 24, fill: true });
        const p = wdc(c.right); p.x = xEnd - 24; p.side = 'right'; upper.push(p);
      }

      // merge neighbouring fillable spans so uppers run across e.g. sink + dishwasher
      const merged = [];
      for (const s of spans) {
        if (s.x1 - s.x0 < 0.01) continue;
        const last = merged[merged.length - 1];
        if (s.fill && last && last.fill && Math.abs(last.x1 - s.x0) < 0.01) last.x1 = s.x1;
        else merged.push(Object.assign({}, s));
      }

      for (const s of merged) {
        const w = s.x1 - s.x0;
        if (s.fill) {
          const f = fillRun(w, WALL_WIDTHS);
          const cabs = f.cabs.map((cw) => P(`W${cw}${H}`, cw, 'wall', { count: true, group: 'cabinet', h: H, desc: `Wall cabinet, ${cw}" W × ${H}" H × 12" D` }));
          let seq = cabs;
          if (f.filler > 0.01) {
            const fil = P('F', f.filler, 'filler', { count: true, group: 'filler', h: H });
            const bareStart = s.x0 < 0.01 && !c.left;
            const bareEnd = Math.abs(s.x1 - xEnd) < 0.01 && !c.right;
            seq = bareStart && !bareEnd ? [fil, ...cabs] : [...cabs, fil];
          }
          let ux = s.x0;
          for (const p of seq) { p.x = ux; ux += p.w; upper.push(p); }
        } else if (s.it.type === 'range') {
          upper.push(P('HOOD' + s.it.width, w, 'hood', { x: s.x0, count: true, group: 'appliance', desc: `Range hood, ${s.it.width}" W` }));
        } else if (s.it.type === 'fridge') {
          upper.push(P(`W${s.it.width}${hOver}`, w, 'wall', { x: s.x0, count: true, group: 'cabinet', h: hOver, deep: true, desc: `Wall cabinet over fridge, ${s.it.width}" W × ${hOver}" H × 24" D` }));
        } else if (s.it.type === 'sink') {
          upper.push(P('', w, 'window', { x: s.x0 }));
        }
        // pantry: full height, nothing above
      }
      upper.sort((a, b) => a.x - b.x);
    }

    // ----- layout advice -----
    const edge = (side) => (side === 'left' ? (c.left ? 'corner' : 'end of the wall') : (c.right ? 'corner' : 'end of the wall'));
    items.forEach((it, i) => {
      const nb = [i - 1, i + 1].map((j) => (j < 0 ? edge('left') : j >= items.length ? edge('right') : items[j]));
      if (it.type === 'range') {
        for (const n of nb) {
          if (typeof n === 'string') warn.push({ level: 'warn', text: `The range sits right against the ${n}. Leave 12–15" of counter on each side.` });
          else if (n.type === 'fridge' || n.type === 'pantry') warn.push({ level: 'warn', text: `The range is right next to the ${ITEM_TYPES[n.type].label.toLowerCase()}. Put counter space between them.` });
          else if (n.type === 'auto' && n.width > 0 && n.width < 12) warn.push({ level: 'warn', text: `Only ${fmtIn(n.width)}" of counter beside the range. 12–15" is the usual minimum.` });
        }
      }
      if (it.type === 'dishwasher' && !nb.some((n) => typeof n !== 'string' && n.type === 'sink')) {
        warn.push({ level: 'warn', text: 'The dishwasher usually goes right next to the sink so it can share the plumbing.' });
      }
    });

    return { name, length: L, base, upper, warn, over, xEnd, uppers: !!wall.uppers };
  }

  // ---------- whole kitchen ----------

  function computeAll(state) {
    const n = WALL_COUNT[state.layout] || 1;
    const H = +state.upperH || 30;
    const top = 54 + H; // 36" counter + 18" backsplash + upper height
    const walls = state.walls.slice(0, n).map((w) => Object.assign({}, w, {
      length: (num(w.ft) || 0) * 12 + (num(w.inch) || 0),
    }));
    const ctx = { walls, corners: cornersFor(state.layout, n), cornerType: state.cornerType, H, top, tallH: top };
    const res = walls.map((w, i) => layoutWall(w, i, ctx));

    const map = new Map();
    const fillers = [];
    for (const r of res) {
      for (const p of [...r.base, ...r.upper]) {
        if (!p.count) continue;
        if (p.group === 'filler') { fillers.push({ w: p.w, upper: p.h != null, wall: r.name }); continue; }
        const key = p.code;
        if (!map.has(key)) map.set(key, { code: p.code, desc: p.desc, group: p.group, qty: 0, walls: new Set() });
        const e = map.get(key); e.qty++; e.walls.add(r.name);
      }
    }
    const order = (code) => (/^LS|^BBC/.test(code) ? 0 : /^B/.test(code) ? 1 : /^SB/.test(code) ? 2 : /^TP/.test(code) ? 3 : /^WDC/.test(code) ? 5 : 4);
    const all = [...map.values()].map((e) => Object.assign(e, { walls: [...e.walls].join(', ') }));
    const cabinets = all.filter((e) => e.group === 'cabinet')
      .sort((a, b) => order(a.code) - order(b.code) || a.code.localeCompare(b.code, undefined, { numeric: true }));
    const appliances = all.filter((e) => e.group === 'appliance');

    return { walls: res, cabinets, appliances, fillers, H, top, layout: state.layout };
  }

  const api = { BASE_WIDTHS, WALL_WIDTHS, ITEM_TYPES, NAMES, WALL_COUNT, num, fmtIn, fmtFtIn, fillRun, computeAll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CabLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
