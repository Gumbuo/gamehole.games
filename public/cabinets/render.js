// Realistic SVG drawings: wall front views and a top-down plan, styled by the user's finish picks.
// All geometry is in inches; the SVG viewBox does the scaling.
(function () {
  'use strict';
  const { fmtIn, fmtFtIn } = window.CabLogic;

  // ---------- style catalog ----------

  const CAB_COLORS = [
    { id: 'white', name: 'White', hex: '#f4f2ec' },
    { id: 'cream', name: 'Cream', hex: '#ebe1cb' },
    { id: 'greige', name: 'Greige', hex: '#c9c0b2' },
    { id: 'gray', name: 'Gray', hex: '#8b9095' },
    { id: 'sage', name: 'Sage', hex: '#98a68c' },
    { id: 'navy', name: 'Navy', hex: '#2f3d55' },
    { id: 'forest', name: 'Forest green', hex: '#34473a' },
    { id: 'black', name: 'Black', hex: '#28292c' },
    { id: 'oak', name: 'Natural oak', hex: '#c49660', wood: true },
    { id: 'walnut', name: 'Walnut', hex: '#6a4831', wood: true },
  ];
  const WALL_COLORS = [
    { id: 'warm', name: 'Warm white', hex: '#ece7de' },
    { id: 'cool', name: 'Cool gray', hex: '#dde1df' },
    { id: 'beige', name: 'Beige', hex: '#e3d8c5' },
    { id: 'sage', name: 'Pale sage', hex: '#cfd8cc' },
    { id: 'blue', name: 'Pale blue', hex: '#d4dce6' },
    { id: 'charcoal', name: 'Charcoal', hex: '#3d4146' },
  ];
  const DOORS = { shaker: 'Shaker', slab: 'Flat slab (modern)', raised: 'Raised panel (traditional)' };
  const HARDWARE = { bar: 'Bar pulls', knob: 'Knobs', cup: 'Cup pulls + knobs', none: 'No hardware (push-open)' };
  const HW_FINISH = {
    black: { name: 'Matte black', hex: '#1c1c1e' },
    brass: { name: 'Brushed brass', hex: '#b8923d' },
    nickel: { name: 'Satin nickel', hex: '#b4b7ba' },
    chrome: { name: 'Polished chrome', hex: '#dfe1e3' },
  };
  const COUNTERS = {
    quartz: { name: 'White quartz', base: '#f0eee9', fleck: '#cbc6bc' },
    marble: { name: 'Carrara marble', base: '#f3f2ef', vein: '#9a9ea3' },
    granite: { name: 'Black granite', base: '#262628', fleck: '#77777a' },
    butcher: { name: 'Butcher block', base: '#b57d45', wood: true },
    concrete: { name: 'Concrete', base: '#a8a69f', fleck: '#8b8983' },
    soapstone: { name: 'Soapstone', base: '#45494c', vein: '#81878c' },
  };
  const SPLASHES = {
    subway: { name: 'White subway tile', tile: 'subway', base: '#f7f6f2', grout: '#cbc7be' },
    subwaygray: { name: 'Gray subway tile', tile: 'subway', base: '#b7bbbe', grout: '#e9e9e6' },
    zellige: { name: 'Green zellige tile', tile: 'square', base: '#6f9483', grout: '#d8d5cc', vary: true },
    blue: { name: 'Blue square tile', tile: 'square', base: '#6c8aa6', grout: '#e3e3df', vary: true },
    slab: { name: 'Same as countertop', tile: 'slab' },
    paint: { name: 'Painted wall (no tile)', tile: 'paint' },
  };
  const FLOORS = {
    oak: { name: 'Oak wood', hex: '#b98b5a' },
    dark: { name: 'Dark wood', hex: '#5a3d2b' },
    gray: { name: 'Gray tile', hex: '#9c9d9b' },
    white: { name: 'White tile', hex: '#e2dfd8' },
  };
  const APPLIANCES = {
    stainless: { name: 'Stainless steel', a: '#eceef0', b: '#a3a8ad', ink: '#3a3d42' },
    black: { name: 'Black stainless', a: '#55585d', b: '#1d1e21', ink: '#c9cbce' },
    white: { name: 'White', a: '#fdfdfb', b: '#d9d9d4', ink: '#7b7d80' },
  };
  const DEFAULT_STYLE = {
    cab: 'white', door: 'shaker', hw: 'bar', hwFinish: 'black', counter: 'quartz',
    splash: 'subway', app: 'stainless', wall: 'warm', floor: 'oak', labels: true,
  };

  // ---------- helpers ----------

  const r1 = (v) => Math.round(v * 100) / 100;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  // a < 0 darkens, a > 0 lightens
  const shade = (h, a) => hex(rgb(h).map((v) => (a < 0 ? v * (1 + a) : v + (255 - v) * a)));
  const lum = (h) => { const [r, g, b] = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  function resolve(S) {
    S = Object.assign({}, DEFAULT_STYLE, S || {});
    const cab = /^#[0-9a-f]{6}$/i.test(S.cab)
      ? { id: 'custom', name: 'Custom', hex: S.cab }
      : CAB_COLORS.find((c) => c.id === S.cab) || CAB_COLORS[0];
    const wall = /^#[0-9a-f]{6}$/i.test(S.wall) ? { hex: S.wall } : WALL_COLORS.find((c) => c.id === S.wall) || WALL_COLORS[0];
    return {
      S, cab,
      wall: wall.hex,
      counter: COUNTERS[S.counter] || COUNTERS.quartz,
      splash: SPLASHES[S.splash] || SPLASHES.subway,
      floor: (FLOORS[S.floor] || FLOORS.oak).hex,
      app: APPLIANCES[S.app] || APPLIANCES.stainless,
      hw: HW_FINISH[S.hwFinish] || HW_FINISH.black,
    };
  }

  const rect = (x, yy, w, h, fill, extra) =>
    `<rect x="${r1(x)}" y="${r1(yy)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${fill}"${extra || ''}/>`;

  // ---------- shared <defs> ----------

  function counterPattern(id, c) {
    let s = `<pattern id="${id}" patternUnits="userSpaceOnUse" `;
    if (c.wood) {
      s += `width="6" height="40">${rect(0, 0, 6, 40, c.base)}${rect(0, 0, 1.5, 40, shade(c.base, -0.08))}${rect(3, 0, 1.5, 40, shade(c.base, 0.06))}${rect(4.5, 0, 1.5, 40, shade(c.base, -0.04))}`;
    } else if (c.vein) {
      s += `width="60" height="30">${rect(0, 0, 60, 30, c.base)}
        <path d="M-2 6 C 12 2, 18 16, 32 12 S 52 22, 62 18" stroke="${c.vein}" stroke-width=".45" fill="none" opacity=".55"/>
        <path d="M-2 24 C 10 20, 24 28, 40 23 S 55 27, 62 25" stroke="${c.vein}" stroke-width=".25" fill="none" opacity=".45"/>`;
    } else {
      s += `width="5" height="5">${rect(0, 0, 5, 5, c.base)}`;
      [[0.7, 1.1], [3.2, 0.6], [2.1, 2.9], [4.3, 3.8], [1.2, 4.2], [3.8, 2.1]].forEach(([x, yy], i) => {
        s += `<circle cx="${x}" cy="${yy}" r="${i % 2 ? 0.16 : 0.24}" fill="${c.fleck}" opacity=".8"/>`;
      });
    }
    return s + '</pattern>';
  }

  function defs(uid, R) {
    const { cab, counter, splash, app, wall } = R;
    let d = '<defs>';
    if (cab.wood) {
      d += `<pattern id="${uid}-cab" patternUnits="userSpaceOnUse" width="8" height="36">${rect(0, 0, 8, 36, cab.hex)}
        <path d="M1.2 0 C 1.6 9, 0.8 18, 1.4 36 M3.6 0 C 3.2 12, 4.1 22, 3.5 36 M6.1 0 C 6.5 8, 5.7 26, 6.3 36" stroke="${shade(cab.hex, -0.22)}" stroke-width=".22" fill="none" opacity=".7"/>
        <path d="M2.4 0 C 2.7 14, 2.2 24, 2.6 36 M7.2 0 C 7 10, 7.5 20, 7.1 36" stroke="${shade(cab.hex, 0.15)}" stroke-width=".18" fill="none" opacity=".6"/></pattern>`;
    }
    d += counterPattern(`${uid}-ct`, counter);
    if (splash.tile === 'subway') {
      d += `<pattern id="${uid}-bs" patternUnits="userSpaceOnUse" width="6" height="6">${rect(0, 0, 6, 6, splash.grout)}
        ${rect(0.08, 0.08, 5.84, 2.84, splash.base)}${rect(-2.92, 3.08, 5.84, 2.84, splash.base)}${rect(3.08, 3.08, 5.84, 2.84, splash.base)}
        ${rect(0.08, 0.08, 5.84, 0.5, 'rgba(255,255,255,.25)')}</pattern>`;
    } else if (splash.tile === 'square') {
      const v = splash.vary ? [-0.06, 0.04, 0.07, -0.02] : [0, 0, 0, 0];
      d += `<pattern id="${uid}-bs" patternUnits="userSpaceOnUse" width="8" height="8">${rect(0, 0, 8, 8, splash.grout)}
        ${rect(0.08, 0.08, 3.84, 3.84, shade(splash.base, v[0]))}${rect(4.08, 0.08, 3.84, 3.84, shade(splash.base, v[1]))}
        ${rect(0.08, 4.08, 3.84, 3.84, shade(splash.base, v[2]))}${rect(4.08, 4.08, 3.84, 3.84, shade(splash.base, v[3]))}</pattern>`;
    }
    d += `<linearGradient id="${uid}-ap" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${app.b}"/><stop offset=".45" stop-color="${app.a}"/><stop offset="1" stop-color="${app.b}"/></linearGradient>`;
    d += `<linearGradient id="${uid}-gl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9cc6e6"/><stop offset="1" stop-color="#e3f1fa"/></linearGradient>`;
    d += `<linearGradient id="${uid}-sh" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;
    d += `<linearGradient id="${uid}-lt" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient>`;
    void wall;
    return d + '</defs>';
  }

  // ---------- wall front view ----------

  function elevation(w, Rall, style, uid) {
    const R = resolve(style);
    const S = R.S;
    const top = Rall.top;
    const ceil = Math.max(96, top);
    const L = Math.max(w.length, w.xEnd);
    const y = (h) => ceil - h;
    const cabFill = R.cab.wood ? `url(#${uid}-cab)` : R.cab.hex;
    const gapFill = shade(R.cab.hex, -0.45);
    const edge = lum(R.cab.hex) > 0.45 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.55)';
    const ctFill = `url(#${uid}-ct)`;
    const apFill = `url(#${uid}-ap)`;
    const o = [];
    const labels = [];
    const wallMid = w.length / 2;

    // room: wall paint, backsplash band, floor
    o.push(rect(0, y(ceil), w.length, ceil, R.wall));
    if (R.splash.tile === 'slab') o.push(rect(0, y(54), w.length, 18, ctFill));
    else if (R.splash.tile !== 'paint') o.push(rect(0, y(54), w.length, 18, `url(#${uid}-bs)`));
    o.push(rect(-6, y(0), L + 12, 6, R.floor));
    o.push(rect(-6, y(0), L + 12, 0.6, 'rgba(0,0,0,.25)'));

    // ----- fronts -----
    function pull(x0, x1, h0, h1, kind, side, at) {
      if (S.hw === 'none') return;
      const fin = R.hw.hex;
      const sh = 'rgba(0,0,0,.28)';
      if (kind === 'drawer') {
        const cx = (x0 + x1) / 2, cy = (h0 + h1) / 2;
        if (S.hw === 'knob') {
          o.push(`<circle cx="${r1(cx + 0.15)}" cy="${r1(y(cy) + 0.2)}" r=".7" fill="${sh}"/><circle cx="${r1(cx)}" cy="${r1(y(cy))}" r=".7" fill="${fin}"/>`);
        } else if (S.hw === 'cup') {
          o.push(`<path d="M${r1(cx - 1.8)} ${r1(y(cy + 0.4))} h3.6 a1.8 1.1 0 0 1 -3.6 0 z" fill="${fin}" stroke="${sh}" stroke-width=".15"/>`);
        } else {
          const len = Math.min(12, Math.max(4, (x1 - x0) * 0.35));
          o.push(rect(cx - len / 2 + 0.15, y(cy) - 0.05, len, 0.5, sh, ' rx=".25"'));
          o.push(rect(cx - len / 2, y(cy) - 0.25, len, 0.5, fin, ' rx=".25"'));
        }
        return;
      }
      const px = side === 'right' ? x1 - 1.6 : x0 + 1.6;
      const len = h1 - h0 > 40 ? 10 : 5;
      let a; // top of the pull, inches from floor
      if (at === 'top') a = h1 - 2;
      else if (at === 'bottom') a = h0 + 2 + len;
      else a = (h0 + h1) / 2 + len / 2;
      if (S.hw === 'bar') {
        o.push(rect(px - 0.25 + 0.15, y(a) + 0.2, 0.5, len, sh, ' rx=".25"'));
        o.push(rect(px - 0.25, y(a), 0.5, len, fin, ' rx=".25"'));
      } else {
        const ky = at === 'bottom' ? h0 + 2.5 : at === 'top' ? h1 - 2.5 : (h0 + h1) / 2;
        o.push(`<circle cx="${r1(px + 0.15)}" cy="${r1(y(ky) + 0.2)}" r=".7" fill="${sh}"/><circle cx="${r1(px)}" cy="${r1(y(ky))}" r=".7" fill="${fin}"/>`);
      }
    }

    function front(x0, x1, h0, h1, kind, side, at) {
      const g = 0.12;
      x0 += g; x1 -= g; h0 += g; h1 -= g;
      const wd = x1 - x0, ht = h1 - h0;
      if (wd <= 0.5 || ht <= 0.5) return;
      o.push(rect(x0, y(h1), wd, ht, cabFill, ` stroke="${edge}" stroke-width=".15"`));
      if (kind === 'side') { o.push(rect(x0, y(h1), wd, ht, 'rgba(0,0,0,.18)')); return; }
      const drawer = kind === 'drawer';
      if (S.door !== 'slab') {
        const rail = drawer ? (ht < 5 ? 0 : 1.4) : 2.25;
        if (rail && wd > 2 * rail + 1 && ht > 2 * rail + 1) {
          const ix = x0 + rail, iw = wd - 2 * rail, ih = ht - 2 * rail, itop = y(h1 - rail);
          o.push(rect(ix, itop, iw, ih, 'rgba(0,0,0,.05)', ` stroke="rgba(0,0,0,.22)" stroke-width=".18"`));
          o.push(rect(ix, itop, iw, 0.35, 'rgba(0,0,0,.18)'));
          o.push(rect(ix, itop + ih - 0.3, iw, 0.3, 'rgba(255,255,255,.35)'));
          if (S.door === 'raised' && !drawer && iw > 4 && ih > 4) {
            o.push(rect(ix + 1.2, itop + 1.2, iw - 2.4, ih - 2.4, 'rgba(255,255,255,.10)', ` stroke="rgba(0,0,0,.16)" stroke-width=".15" rx=".6"`));
          }
        }
      }
      o.push(rect(x0, y(h1), wd, ht, `url(#${uid}-lt)`));
      pull(x0, x1, h0, h1, kind, side, at);
    }

    // Lay drawers and doors across [a, b] between heights h0 and h1.
    // drawerH: height of the drawer row on top (0 = no drawers). at: where door pulls go.
    function standard(a, b, h0, h1, drawerH, at, single) {
      const wd = b - a;
      let doorTop = h1;
      if (drawerH) {
        doorTop = h1 - drawerH;
        if (wd >= 30) { front(a, (a + b) / 2, doorTop, h1, 'drawer'); front((a + b) / 2, b, doorTop, h1, 'drawer'); }
        else front(a, b, doorTop, h1, 'drawer');
      }
      if (wd >= 24) {
        front(a, (a + b) / 2, h0, doorTop, 'door', 'right', at);
        front((a + b) / 2, b, h0, doorTop, 'door', 'left', at);
      } else {
        const side = single || ((a + b) / 2 < wallMid ? 'right' : 'left');
        front(a, b, h0, doorTop, 'door', side, at);
      }
    }

    const counterTop = (p) => {
      o.push(rect(p.x, y(36), p.w, 1.5, ctFill));
      o.push(rect(p.x, y(34.5) - 0.25, p.w, 0.25, 'rgba(0,0,0,.35)'));
    };
    const toeKick = (p) => o.push(rect(p.x, y(4), p.w, 4, shade(R.cab.hex, -0.6)));
    const tag = (p, h) => labels.push({ x: p.x + p.w / 2, y: y(h), code: p.code, w: p.w });

    for (const p of w.base) {
      const x0 = p.x, x1 = p.x + p.w;
      switch (p.kind) {
        case 'base': case 'sink': case 'corner': case 'dead': case 'filler': {
          toeKick(p);
          o.push(rect(x0, y(34.5), p.w, 30.5, p.kind === 'filler' ? cabFill : gapFill));
          if (p.kind === 'filler') o.push(rect(x0, y(34.5), p.w, 30.5, 'rgba(0,0,0,.04)', ` stroke="${edge}" stroke-width=".12"`));
          else if (p.kind === 'dead') front(x0, x1, 4, 34.5, 'side');
          else if (p.kind === 'corner') {
            const susan = p.code.startsWith('LS');
            let a = x0, b = x1;
            if (p.side === 'right') { front(b - 24, b, 4, 34.5, 'side'); b -= 24; } else { front(a, a + 24, 4, 34.5, 'side'); a += 24; }
            const away = p.side === 'right' ? 'left' : 'right';
            if (susan) front(a, b, 4, 34.5, 'door', away, 'top');
            else standard(a, b, 4, 34.5, 6, 'top', away);
          } else standard(x0, x1, 4, 34.5, 6, 'top');
          counterTop(p);
          if (p.kind !== 'dead' && p.kind !== 'filler') tag(p, 18);
          if (p.kind === 'filler' && p.w >= 1) labels.push({ x: x0 + p.w / 2, y: y(0) + 4, code: fmtIn(p.w) + '"', small: true });
          break;
        }
        case 'pantry': {
          const th = Rall.tallH || top;
          toeKick(p);
          o.push(rect(x0, y(th), p.w, th - 4, gapFill));
          const mid = 50;
          const two = p.w >= 24;
          const doors = (h0, h1, at) => {
            if (two) { front(x0, (x0 + x1) / 2, h0, h1, 'door', 'right', at); front((x0 + x1) / 2, x1, h0, h1, 'door', 'left', at); }
            else front(x0, x1, h0, h1, 'door', x0 + p.w / 2 < wallMid ? 'right' : 'left', at);
          };
          doors(4, mid, 'top');
          doors(mid, th, 'bottom');
          tag(p, 40);
          break;
        }
        case 'dishwasher': {
          o.push(rect(x0, y(4), p.w, 4, '#1c1d20'));
          o.push(rect(x0 + 0.1, y(34.5), p.w - 0.2, 30.5, apFill, ` stroke="${R.app.ink}" stroke-opacity=".35" stroke-width=".15"`));
          o.push(rect(x0 + 0.1, y(34.5), p.w - 0.2, 3, 'rgba(0,0,0,.08)'));
          o.push(rect(x0 + 3, y(30.5), p.w - 6, 0.7, R.app.ink, ' rx=".35"'));
          counterTop(p);
          tag(p, 18);
          break;
        }
        case 'range': {
          o.push(rect(x0 + 0.1, y(36), p.w - 0.2, 36, apFill, ` stroke="${R.app.ink}" stroke-opacity=".4" stroke-width=".15"`));
          o.push(rect(x0 + 1, y(5), p.w - 2, 4, 'rgba(0,0,0,.06)', ` stroke="${R.app.ink}" stroke-opacity=".35" stroke-width=".12"`));
          o.push(rect(x0 + 1, y(28), p.w - 2, 22, 'rgba(0,0,0,.03)', ` stroke="${R.app.ink}" stroke-opacity=".4" stroke-width=".15"`));
          o.push(rect(x0 + 4, y(24), p.w - 8, 13, '#17191c', ' opacity=".88" rx=".6"'));
          o.push(rect(x0 + 4, y(24), p.w - 8, 3, 'rgba(255,255,255,.08)'));
          o.push(rect(x0 + 3, y(27), p.w - 6, 0.7, R.app.ink, ' rx=".35"'));
          const knobs = 5;
          for (let k = 0; k < knobs; k++) {
            const kx = x0 + 4 + ((p.w - 8) * k) / (knobs - 1);
            o.push(`<circle cx="${r1(kx)}" cy="${r1(y(32))}" r=".95" fill="${R.app.ink}"/>`);
          }
          o.push(rect(x0, y(36.9), p.w, 0.9, '#232427'));
          tag(p, 9);
          break;
        }
        case 'fridge': {
          o.push(rect(x0 + 0.2, y(70), p.w - 0.4, 70, apFill, ` stroke="${R.app.ink}" stroke-opacity=".45" stroke-width=".15" rx=".8"`));
          o.push(rect(x0 + 0.2, y(28.2), p.w - 0.4, 0.35, 'rgba(0,0,0,.45)'));
          o.push(rect(x0 + p.w / 2 - 0.15, y(70), 0.3, 41.8, 'rgba(0,0,0,.45)'));
          o.push(rect(x0 + p.w / 2 - 2.2, y(62), 0.7, 26, R.app.ink, ' rx=".35"'));
          o.push(rect(x0 + p.w / 2 + 1.5, y(62), 0.7, 26, R.app.ink, ' rx=".35"'));
          o.push(rect(x0 + 5, y(25), p.w - 10, 0.7, R.app.ink, ' rx=".35"'));
          o.push(rect(x0, y(0.6), p.w, 0.6, '#1c1d20'));
          tag(p, 44);
          break;
        }
        default:
          break;
      }
    }

    // ----- uppers -----
    for (const p of w.upper) {
      const x0 = p.x, x1 = p.x + p.w;
      if (p.kind === 'gap') continue;
      if (p.kind === 'window') {
        const trim = '#f6f5f0';
        o.push(rect(x0 + 2, y(80), p.w - 4, 38, trim, ` stroke="rgba(0,0,0,.2)" stroke-width=".15"`));
        o.push(rect(x0 + 3.2, y(78.8), p.w - 6.4, 35.6, `url(#${uid}-gl)`));
        o.push(rect(x0 + p.w / 2 - 0.4, y(78.8), 0.8, 35.6, trim));
        o.push(rect(x0 + 3.2, y(61.4), p.w - 6.4, 0.8, trim));
        o.push(rect(x0 + 1, y(42.4), p.w - 2, 1.2, trim, ` stroke="rgba(0,0,0,.2)" stroke-width=".12"`));
        continue;
      }
      if (p.kind === 'hood') {
        const m = p.x + p.w / 2;
        o.push(rect(m - p.w * 0.16, y(top), p.w * 0.32, top - 73.5, apFill, ` stroke="${R.app.ink}" stroke-opacity=".35" stroke-width=".15"`));
        o.push(`<polygon points="${r1(x0)},${y(66)} ${r1(x1)},${y(66)} ${r1(m + p.w * 0.2)},${y(74)} ${r1(m - p.w * 0.2)},${y(74)}" fill="${apFill}" stroke="${R.app.ink}" stroke-opacity=".4" stroke-width=".15"/>`);
        o.push(rect(x0, y(66), p.w, 1.2, 'rgba(0,0,0,.22)'));
        tag(p, 70);
        continue;
      }
      const h = p.h || Rall.H;
      const h0 = top - h;
      o.push(rect(x0, y(top), p.w, h, p.kind === 'filler' ? cabFill : gapFill));
      if (p.kind === 'filler') {
        o.push(rect(x0, y(top), p.w, h, 'rgba(0,0,0,.04)', ` stroke="${edge}" stroke-width=".12"`));
      } else if (p.kind === 'wallcorner') {
        let a = x0, b = x1;
        if (p.side === 'right') { front(b - 12, b, h0, top, 'side'); b -= 12; } else { front(a, a + 12, h0, top, 'side'); a += 12; }
        front(a, b, h0, top, 'door', p.side === 'right' ? 'left' : 'right', 'bottom');
      } else {
        standard(x0, x1, h0, top, 0, 'bottom');
      }
      if (h0 > 54.5 || p.kind === 'filler') { /* over fridge: no shadow on splash */ }
      else o.push(rect(x0, y(54), p.w, 3, `url(#${uid}-sh)`));
      if (p.kind !== 'filler') tag(p, top - h / 2);
    }

    // wall ends, dimension, labels
    o.push(rect(-1.2, y(ceil), 1.2, ceil, 'var(--ink)'));
    o.push(rect(w.length, y(ceil), 1.2, ceil, 'var(--ink)'));
    o.push(`<path class="dim" d="M0,-8 H${r1(w.length)} M0,-10.5 V-5.5 M${r1(w.length)},-10.5 V-5.5"/>`);
    o.push(`<text class="t-dim" x="${r1(w.length / 2)}" y="-10">${fmtFtIn(w.length)} (${fmtIn(w.length)}")</text>`);
    if (S.labels) {
      for (const l of labels) {
        if (!l.small && l.w < 8) continue;
        o.push(`<text class="t-lbl${l.small ? ' sm' : ''}" x="${r1(l.x)}" y="${r1(l.y)}">${esc(l.code)}</text>`);
      }
    }

    return `<svg viewBox="-6 -16 ${r1(L + 12)} ${r1(ceil + 24)}" role="img" aria-label="Front view of Wall ${esc(w.name)}">${defs(uid, R)}${o.join('')}</svg>`;
  }

  // ---------- top-down plan ----------

  function plan(Rall, style) {
    const R = resolve(style);
    const uid = 'pl';
    const ws = Rall.walls;
    const len = (i) => (ws[i] ? Math.max(ws[i].length, ws[i].xEnd) : 0);
    const frames = [{ o: [0, 0], d: [1, 0], n: [0, 1] }];
    if (Rall.layout === 'galley') frames.push({ o: [Math.max(len(0), len(1)), 90], d: [-1, 0], n: [0, -1] });
    if (Rall.layout === 'L' || Rall.layout === 'U') frames.push({ o: [len(0), 0], d: [0, 1], n: [-1, 0] });
    if (Rall.layout === 'U') frames.push({ o: [len(0), len(1)], d: [-1, 0], n: [0, -1] });
    const pt = (f, s, t) => [f.o[0] + f.d[0] * s + f.n[0] * t, f.o[1] + f.d[1] * s + f.n[1] * t];
    const xs = [], ys = [];
    const track = (p) => { xs.push(p[0]); ys.push(p[1]); return p; };
    const poly = (pts, fill, extra) => `<polygon points="${pts.map((q) => q.map(r1).join(',')).join(' ')}" fill="${fill}"${extra || ''}/>`;
    const out = [];
    const txt = [];

    // floor
    const fw = Rall.layout === 'single' ? len(0) : Rall.layout === 'galley' ? Math.max(len(0), len(1)) : len(0);
    const fh = Rall.layout === 'single' ? 66 : Rall.layout === 'galley' ? 90 : len(1);
    out.push(rect(0, 0, fw, fh, R.floor, ' opacity=".3"'));

    ws.forEach((w, i) => {
      const f = frames[i];
      if (!f) return;
      const vertical = f.d[0] === 0;
      for (const p of w.base) {
        if (p.kind === 'dead') continue;
        const dep = p.kind === 'fridge' ? 30 : 24;
        const pts = [pt(f, p.x, 0), pt(f, p.x + p.w, 0), pt(f, p.x + p.w, dep), pt(f, p.x, dep)].map(track);
        const stroke = ' stroke="rgba(0,0,0,.35)" stroke-width=".3"';
        if (p.kind === 'fridge') out.push(poly(pts, `url(#${uid}-ap)`, stroke));
        else if (p.kind === 'pantry') out.push(poly(pts, R.cab.wood ? `url(#${uid}-cab)` : R.cab.hex, stroke));
        else if (p.kind === 'range') {
          out.push(poly(pts, '#2a2b2e', stroke));
          const q = p.w / 4;
          [[q, 7], [3 * q, 7], [q, 17], [3 * q, 17]].forEach(([s, t]) => {
            const c = pt(f, p.x + s, t);
            out.push(`<circle cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r1(Math.min(4, q * 0.8))}" fill="none" stroke="#7a7d82" stroke-width=".5"/>`);
          });
        } else {
          out.push(poly(pts, `url(#${uid}-ct)`, stroke));
          if (p.kind === 'sink') {
            const a = pt(f, p.x + 4, 5), b = pt(f, p.x + p.w - 4, 19);
            out.push(rect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), '#c7cbcf', ' stroke="#8d9297" stroke-width=".4" rx="2"'));
          }
        }
        if (p.w >= 12 && p.code) {
          const c = pt(f, p.x + p.w / 2, dep / 2 + (p.kind === 'sink' ? 9 : 0));
          txt.push(`<text class="t-lbl" x="${r1(c[0])}" y="${r1(c[1])}"${vertical ? ` transform="rotate(90 ${r1(c[0])} ${r1(c[1])})"` : ''}>${esc(p.code)}</text>`);
        }
      }
      const a = track(pt(f, 0, 0)), b = track(pt(f, len(i), 0));
      out.push(`<line class="wallline" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`);
      const lp = track(pt(f, len(i) / 2, -8));
      out.push(`<text class="t-wall" x="${r1(lp[0])}" y="${r1(lp[1])}">Wall ${esc(w.name)}</text>`);
    });

    const minX = Math.min(...xs, 0) - 8, maxX = Math.max(...xs, fw) + 8, minY = Math.min(...ys, 0) - 8, maxY = Math.max(...ys, fh) + 8;
    return `<svg viewBox="${r1(minX)} ${r1(minY)} ${r1(maxX - minX)} ${r1(maxY - minY)}" role="img" aria-label="Floor plan of base cabinets">${defs(uid, R)}${out.join('')}${R.S.labels ? txt.join('') : ''}</svg>`;
  }

  window.CabRender = {
    elevation, plan, resolve, DEFAULT_STYLE,
    CAB_COLORS, WALL_COLORS, DOORS, HARDWARE, HW_FINISH, COUNTERS, SPLASHES, FLOORS, APPLIANCES,
  };
})();
