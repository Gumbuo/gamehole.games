"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  ACTIVE:   { bg: "rgba(0,255,65,0.15)",  text: "#00ff41", border: "#00ff41" },
  UPCOMING: { bg: "rgba(255,215,0,0.15)", text: "#ffd700", border: "#ffd700" },
  ENDED:    { bg: "rgba(255,71,87,0.15)", text: "#ff4757", border: "#ff4757" },
} as const;

const TC = [
  { color: "#00ff41", border: "#00ff41", bg: "rgba(0,255,65,0.08)" },   // A
  { color: "#00d9ff", border: "#00d9ff", bg: "rgba(0,217,255,0.08)" },  // B
  { color: "#b44dff", border: "#b44dff", bg: "rgba(180,77,255,0.08)" }, // C
  { color: "#ffd700", border: "#ffd700", bg: "rgba(255,215,0,0.08)" },  // D
  { color: "#ff6b35", border: "#ff6b35", bg: "rgba(255,107,53,0.08)" }, // E
];

// ─── Player progress tracking (Event 2) ──────────────────────────────────────
// tiers: array of { label, colorIdx (0=A … 4=E), items: [{ name, current, cap }] }
// cap: 0 means TBD — displays "X / TBD" with no progress bar
// All players show all 4 tiers so uncompleted items are visible too.
// Gallard is an exception — he crafts unique items, shown in his relevant tiers only.

const BLANK_A = () => ({ label: "Tier A — Basic Items", colorIdx: 0, items: [
  { name: "Cotton",        current: 0, cap: 2000 },
  { name: "Potatoes",      current: 0, cap: 2000 },
  { name: "Red Flower",    current: 0, cap: 2000 },
  { name: "Blue Flower",   current: 0, cap: 2000 },
  { name: "Yellow Flower", current: 0, cap: 2000 },
]});
const BLANK_B = () => ({ label: "Tier B — Crafted Items", colorIdx: 1, items: [
  { name: "Wrapped Potato", current: 0, cap: 1300 },
  { name: "Fries",          current: 0, cap: 1300 },
  { name: "Veggie Salad",   current: 0, cap: 1300 },
  { name: "Soil",           current: 0, cap: 500  },
]});
const BLANK_C = () => ({ label: "Tier C — High-Tier Items", colorIdx: 2, items: [
  { name: "Golden Potato Cake",      current: 0, cap: 3 },
  { name: "Pumpkin Spice Cake",      current: 0, cap: 3 },
  { name: "Carrot Cake",             current: 0, cap: 3 },
  { name: "Grape Tart Cake",         current: 0, cap: 3 },
  { name: "Upside-Down Tomato Cake", current: 0, cap: 3 },
]});
const BLANK_D = () => ({ label: "Tier D — Tools & Materials", colorIdx: 3, items: [
  { name: "Wheat Flour", current: 0, cap: 1000 },
  { name: "Wood",        current: 0, cap: 5000 },
  { name: "Stone",       current: 0, cap: 5000 },
]});

const PLAYERS = [
  {
    name: "steemit",
    lastCounted: "Feb 24, 2026 — batch ending ~2 hrs ago (cotton cut off at end, value unknown)",
    tiers: [
      { label: "Tier A — Basic Items", colorIdx: 0, items: [
        { name: "Cotton",        current: 1044, cap: 2000 },
        { name: "Potatoes",      current: 324,  cap: 2000 },
        { name: "Red Flower",    current: 218,  cap: 2000 },
        { name: "Blue Flower",   current: 643,  cap: 2000 },
        { name: "Yellow Flower", current: 613,  cap: 2000 },
      ]},
      BLANK_B(),
      BLANK_C(),
      BLANK_D(),
    ],
    other: [
      { name: "Wheat — raw, needs processing into Wheat Flour (Tier D)", qty: 42 },
      { name: "Grape Must", qty: 1 },
      { name: "Grapes — raw ingredient for Tier C cakes", qty: 309 },
      { name: "Carrot — raw ingredient for Tier C cakes", qty: 204 },
      { name: "Pumpkin — raw ingredient for Tier C cakes", qty: 77 },
      { name: "Cucumber", qty: 156 },
      { name: "Fern", qty: 279 },
      { name: "Tomato", qty: 27 },
      { name: "Flower Rose Red", qty: 81 },
      { name: "Flower Rose Pink", qty: 18 },
      { name: "Blue Bluegill (fish)",   qty: 8  },
      { name: "Orange Bluegill (fish)", qty: 8  },
      { name: "Yellow Bluegill (fish)", qty: 12 },
      { name: "Crucian Carp (fish)",    qty: 2  },
    ],
  },
  {
    name: "abkhan",
    lastCounted: "—",
    tiers: [ BLANK_A(), BLANK_B(), BLANK_C(), BLANK_D() ],
    other: [],
  },
  {
    name: "Rachelle (KANIN)",
    lastCounted: "—",
    tiers: [
      BLANK_A(),
      BLANK_B(),
      { label: "Tier C — High-Tier Items ✓", colorIdx: 2, items: [
        { name: "Golden Potato Cake",      current: 3, cap: 3 },
        { name: "Pumpkin Spice Cake",      current: 3, cap: 3 },
        { name: "Carrot Cake",             current: 3, cap: 3 },
        { name: "Grape Tart Cake",         current: 3, cap: 3 },
        { name: "Upside-Down Tomato Cake", current: 3, cap: 3 },
      ]},
      { label: "Tier D — Tools & Materials ✓", colorIdx: 3, items: [
        { name: "Wheat Flour", current: 1000, cap: 1000 },
        { name: "Wood",        current: 5000, cap: 5000 },
        { name: "Stone",       current: 5000, cap: 5000 },
      ]},
    ],
    other: [],
  },
  {
    name: "DevilFirst",
    lastCounted: "—",
    tiers: [
      BLANK_A(),
      BLANK_B(),
      { label: "Tier C — High-Tier Items ✓", colorIdx: 2, items: [
        { name: "Golden Potato Cake",      current: 3, cap: 3 },
        { name: "Pumpkin Spice Cake",      current: 3, cap: 3 },
        { name: "Carrot Cake",             current: 3, cap: 3 },
        { name: "Grape Tart Cake",         current: 3, cap: 3 },
        { name: "Upside-Down Tomato Cake", current: 3, cap: 3 },
      ]},
      { label: "Tier D — Tools & Materials ✓", colorIdx: 3, items: [
        { name: "Wheat Flour", current: 1000, cap: 1000 },
        { name: "Wood",        current: 5000, cap: 5000 },
        { name: "Stone",       current: 5000, cap: 5000 },
      ]},
    ],
    other: [],
  },
  {
    name: "Gallard",
    lastCounted: "Feb 23, 2026 — batch ending ~1 hr ago",
    tiers: [
      { label: "Tier B — Crafted Items", colorIdx: 1, items: [
        { name: "Fries", current: 13, cap: 1300 },
      ]},
      { label: "Tier D — Tools & Materials", colorIdx: 3, items: [
        { name: "Cotton Thread",        current: 6, cap: 0 },
        { name: "Cotton Thread Yellow", current: 1, cap: 0 },
        { name: "Cotton Thread Green",  current: 1, cap: 0 },
        { name: "Cotton Thread Red",    current: 1, cap: 0 },
        { name: "Grape Must",           current: 1, cap: 0 },
      ]},
    ],
    other: [],
  },
  {
    name: "xidni_xazz",
    lastCounted: "—",
    tiers: [ BLANK_A(), BLANK_B(), BLANK_C(), BLANK_D() ],
    other: [],
  },
  {
    name: "Ongbak",
    lastCounted: "—",
    tiers: [ BLANK_A(), BLANK_B(), BLANK_C(), BLANK_D() ],
    other: [],
  },
  {
    name: "Alstar",
    lastCounted: "Feb 23, 2026 — batch ending ~41 min ago",
    tiers: [
      { label: "Tier A — Basic Items", colorIdx: 0, items: [
        { name: "Cotton",        current: 0,  cap: 2000 },
        { name: "Potatoes",      current: 0,  cap: 2000 },
        { name: "Red Flower",    current: 0,  cap: 2000 },
        { name: "Blue Flower",   current: 12, cap: 2000 },
        { name: "Yellow Flower", current: 6,  cap: 2000 },
      ]},
      BLANK_B(),
      BLANK_C(),
      BLANK_D(),
    ],
    other: [],
  },
  {
    name: "Axolotoi",
    lastCounted: "—",
    tiers: [ BLANK_A(), BLANK_B(), BLANK_C(), BLANK_D() ],
    other: [],
  },
];

// ─── Shared tier items used across events ─────────────────────────────────────
const TIER_A_ITEMS_2K = [
  { name: "Cotton",        qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Potatoes",      qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Red Flower",    qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Blue Flower",   qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
  { name: "Yellow Flower", qty: "2k", price: "$0.0005 each", max: "$1.00 max" },
];

const TIER_B_ITEMS = [
  { name: "Wrapped Potato", qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Fries",          qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Veggie Salad",   qty: "1.3k", price: "$0.001 each",  max: "$1.30 max" },
  { name: "Soil",           qty: "x500", price: "$0.0024 each", max: "$1.20 max" },
];

const TIER_C_CAKES = [
  { name: "Golden Potato Cake",      qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Pumpkin Spice Cake",      qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Carrot Cake",             qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Grape Tart Cake",         qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Upside-Down Tomato Cake", qty: "x3", price: "$0.167 each", max: "$0.50 max" },
  { name: "Chicken Feed",            qty: "TBD" },
  { name: "Mushroom Omelette",       qty: "TBD" },
  { name: "Mushroom Soup",           qty: "TBD" },
  { name: "Pumpkin Bread",           qty: "TBD" },
  { name: "Tomato Omelette",         qty: "TBD" },
];

const TIER_D_TBD_ITEMS = [
  { name: "Wood Plank",           qty: "TBD" },
  { name: "Stone Block",          qty: "TBD" },
  { name: "Stone Brick",          qty: "TBD" },
  { name: "Clay Brick",           qty: "TBD" },
  { name: "Metal Bar",            qty: "TBD" },
  { name: "Iron Ingot",           qty: "TBD" },
  { name: "Silver Ingot",         qty: "TBD" },
  { name: "Gold Ingot",           qty: "TBD" },
  { name: "Wool",                 qty: "TBD" },
  { name: "Grape Must",           qty: "TBD" },
  { name: "Cotton Thread",        qty: "TBD" },
  { name: "Cotton Thread Blue",   qty: "TBD" },
  { name: "Cotton Thread Brown",  qty: "TBD" },
  { name: "Cotton Thread Green",  qty: "TBD" },
  { name: "Cotton Thread Orange", qty: "TBD" },
  { name: "Cotton Thread Red",    qty: "TBD" },
  { name: "Cotton Thread Yellow", qty: "TBD" },
  { name: "Fishing Rod",          qty: "TBD" },
  { name: "Iron Axe",             qty: "TBD" },
  { name: "Iron Pickaxe",         qty: "TBD" },
  { name: "Gold Axe",             qty: "TBD" },
  { name: "Gold Pickaxe",         qty: "TBD" },
];

const TIER_E_ITEMS = [
  { name: "Box",         qty: "TBD" },
  { name: "Bench",       qty: "TBD" },
  { name: "Big Bench",   qty: "TBD" },
  { name: "Bonfire",     qty: "TBD" },
  { name: "Dropbox",     qty: "TBD" },
  { name: "Fence",       qty: "TBD" },
  { name: "Gate",        qty: "TBD" },
  { name: "Well",        qty: "TBD" },
  { name: "Wood Plank",  qty: "TBD" },
  { name: "Stone Block", qty: "TBD" },
  { name: "Metal Bar",   qty: "TBD" },
  { name: "Wool",        qty: "TBD" },
];

// ─── Event 2 (ACTIVE) ─────────────────────────────────────────────────────────
const EVENT2 = {
  title: "NomStead Guild Item Exchange — Event 2",
  dateRange: "Mar 1 – Mar 31, 2026",
  description:
    "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below. Now includes Tier D — Tools & Materials!",
  status: "ACTIVE" as const,
  registeredPlayers: [
    "xidni_xazz", "DevilFirst", "Rachelle (KANIN)", "steemit",
    "abkhan", "Ongbak", "Alstar", "Axolotoi", "Gallard",
  ],
  tiers: [
    {
      name: "Tier A", subtitle: "Basic Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[0],
      priceRange: "$0.0005", playerCap: "$5 max per player", totalCap: "10,000 items",
      items: TIER_A_ITEMS_2K,
    },
    {
      name: "Tier B", subtitle: "Mid-Tier Crafted Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[1],
      priceRange: "$0.001", playerCap: "$5.10 max per player", totalCap: "4,400 items",
      items: TIER_B_ITEMS,
    },
    {
      name: "Tier C", subtitle: "High-Tier Items",
      eligibility: "OG Players Only",
      ...TC[2],
      priceRange: "$0.167 / cake", playerCap: "$2.50 max per player", totalCap: "15 cakes",
      items: TIER_C_CAKES,
    },
    {
      name: "Tier D", subtitle: "Tools & Materials",
      eligibility: "OG Players Only",
      ...TC[3],
      priceRange: "$0.00125–$0.001375", playerCap: "$15 max per player", totalCap: "11,000 items",
      items: [
        { name: "Wheat Flour", qty: "1k", price: "$0.00125 each",  max: "$1.25 max" },
        { name: "Wood",        qty: "5k", price: "$0.001375 each", max: "$6.88 max" },
        { name: "Stone",       qty: "5k", price: "$0.001375 each", max: "$6.88 max" },
        ...TIER_D_TBD_ITEMS,
      ],
    },
  ],
  rules: [
    { text: "Each player can earn up to $27.60 total ($5 from A + $5.10 from B + $2.50 from C + $15 from D)." },
    { text: "Max event pool: $220.80 (8 players)." },
    { text: "PM FoxHole on Discord before dropping items in the dropbox to make sure activities are acknowledged and paid for." },
    { text: "Tier D: Wheat Flour 1k × $0.00125, Wood & Stone 5k × $0.001375 each." },
    { text: "Caps are per player — unused budget rolls into the July TGE Launch Event pool." },
    { text: "TIER D REPEATABLE: Each full hand-in (1k Wheat Flour + 5k Wood + 5k Stone) earns more than the last — 1st: $15.00 · 2nd: $18.75 (1.25×) · 3rd: $22.50 (1.50×) · 4th: $26.25 (1.75×). Multiplier resets at the start of each new event month. Tier D participants only." },
    { text: "GOLD RETURN — After FoxHole receives your items, please return the gold by buying 1 Wood from FoxHole's dropbox. The Wood is priced high but will cost less than the gold you earned from the drop — so you keep the difference.", warn: true },
  ],
  loyaltyNote:
    "Tier D is repeatable every event month — and each full hand-in earns more than the last. Complete 1k Wheat Flour + 5k Wood + 5k Stone to claim your payout, then do it again for a bigger reward. 1st: $15.00 · 2nd: $18.75 (1.25×) · 3rd: $22.50 (1.50×) · 4th: $26.25 (1.75×). Multiplier resets at the start of each new event.",
  faqs: [
    {
      q: "How does this work?",
      a: "You gather in-game items from NomStead and sell them to FoxHole's dropbox. PM FoxHole on Discord first to set up payment and arrange your drop-off. Pick any tier you want — you can participate in all four.",
    },
    {
      q: "How much can I earn?",
      a: "Up to $27.60 per player across all tiers: $5 from Tier A, $5.10 from Tier B, $2.50 from Tier C, and $15 from Tier D. You don't have to max every tier — earn as much or as little as you want.",
    },
    {
      q: "What are the tiers?",
      a: "Each tier has different items at different price points. Tier A is basic crops and flowers (cheap but high quantity). Tier B is crafted food items (higher value per item). Tier C is rare cakes. Tier D is wheat flour, wood, and stone — the biggest earner.",
    },
    {
      q: "What does 'per player cap' mean?",
      a: "It's the max dollar amount you can earn from a single tier. Tier D is the biggest earner at $15. This ensures the pool is shared fairly across all players.",
    },
    {
      q: "What if I can't fill a whole tier?",
      a: "No problem! You get paid per item at the listed price, so every single item counts. Send what you can, even if it's just a few. There's no minimum. Any money left unspent rolls into the July TGE Launch Event pool.",
    },
    {
      q: "How do I get paid?",
      a: "PM FoxHole on Discord to coordinate. Once your items are verified in the dropbox, payment is sent to you. Details are arranged through Discord DMs.",
    },
    {
      q: "Can I do Tier D more than once?",
      a: "Yes — Tier D is repeatable every event month. Each full hand-in (1k Wheat Flour + 5k Wood + 5k Stone) earns more than the last: 1st at $15.00, 2nd at $18.75 (1.25×), 3rd at $22.50 (1.50×), 4th at $26.25 (1.75×). The multiplier resets at the start of each new event month.",
    },
    {
      q: "What's the total pool?",
      a: "$220.80 across 8 players. This is the max FoxHole will pay out. If not everyone maxes every tier, all leftover rolls into the July TGE Launch Event pool.",
    },
  ],
};

// ─── Event 3 (UPCOMING — Apr 1) ───────────────────────────────────────────────
// Wood and Stone price increased to $0.0025 each. Tiers A / B / C carry over
// from Event 2. Tier E pricing TBD.
const EVENT3 = {
  title: "NomStead Guild Item Exchange — Event 3",
  dateRange: "Apr 1 – Apr 30, 2026",
  startDate: new Date("2026-04-01"),
  description:
    "Monthly item exchange with all five tiers. Tiers A–C carry over from Event 2. Tier D increases wood & stone value to $0.0025 each — the biggest single-resource earner yet.",
  status: "UPCOMING" as const,
  tiers: [
    {
      name: "Tier A", subtitle: "Basic Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[0],
      priceRange: "$0.0005", playerCap: "$5 max per player", totalCap: "10,000 items",
      items: TIER_A_ITEMS_2K,
    },
    {
      name: "Tier B", subtitle: "Mid-Tier Crafted Items",
      eligibility: "Active Low-Level Members Only",
      ...TC[1],
      priceRange: "$0.001", playerCap: "$5.10 max per player", totalCap: "4,400 items",
      items: TIER_B_ITEMS,
    },
    {
      name: "Tier C", subtitle: "High-Tier Items",
      eligibility: "OG Players Only",
      ...TC[2],
      priceRange: "$0.167 / cake", playerCap: "$2.50 max per player", totalCap: "15 cakes",
      items: TIER_C_CAKES,
    },
    {
      name: "Tier D", subtitle: "Tools & Materials",
      eligibility: "OG Players Only",
      ...TC[3],
      // Wood & Stone up from $0.001375 → $0.0025 (+81% value)
      priceRange: "$0.00125–$0.0025", playerCap: "$26.25 max per player", totalCap: "11,000 items",
      items: [
        { name: "Wheat Flour", qty: "1k", price: "$0.00125 each", max: "$1.25 max" },
        { name: "Wood",        qty: "5k", price: "$0.0025 each",  max: "$12.50 max" },
        { name: "Stone",       qty: "5k", price: "$0.0025 each",  max: "$12.50 max" },
        ...TIER_D_TBD_ITEMS,
      ],
    },
    {
      name: "Tier E", subtitle: "Crafted Items & Structures",
      eligibility: undefined,
      ...TC[4],
      priceRange: "TBD", playerCap: "TBD", totalCap: "TBD",
      items: TIER_E_ITEMS,
    },
  ],
  rules: [
    { text: "Each player can earn up to $38.85 confirmed ($5 from A + $5.10 from B + $2.50 from C + $26.25 from D) — plus TBD from Tier E." },
    { text: "Wood & Stone price increased to $0.0025 each (up from $0.001375 in Event 2)." },
    { text: "PM FoxHole on Discord before dropping items in the dropbox." },
    { text: "Caps are per player — unused budget rolls into the July TGE Launch Event pool." },
    { text: "TIER D REPEATABLE: Each full hand-in (1k Wheat Flour + 5k Wood + 5k Stone) earns more than the last — 1st: $26.25 · 2nd: $32.81 (1.25×) · 3rd: $39.38 (1.50×) · 4th: $45.94 (1.75×). Multiplier resets at the start of each new event month. Tier D participants only." },
    { text: "GOLD RETURN — After FoxHole receives your items, please return the gold by buying 1 Wood from FoxHole's dropbox. The Wood is priced high but will cost less than the gold you earned from the drop — so you keep the difference.", warn: true },
  ],
  loyaltyNote:
    "Tier D is repeatable every event month — and each full hand-in earns more than the last. With wood & stone at $0.0025 each, completing 1k Wheat Flour + 5k Wood + 5k Stone pays out more every time. 1st: $26.25 · 2nd: $32.81 (1.25×) · 3rd: $39.38 (1.50×) · 4th: $45.94 (1.75×). Multiplier resets at the start of each new event.",
};

// ─── Event 4 (UPCOMING — May 1, simple card) ──────────────────────────────────
const EVENT4 = {
  id: 4,
  title: "NomStead Guild Item Exchange — Event 4",
  dateRange: "May 1 – May 31, 2026",
  startDate: new Date("2026-05-01"),
  description:
    "Monthly item exchange with all five tiers. Pricing and caps will be finalized based on Event 3 results.",
  tiers: ["Tier A", "Tier B", "Tier C", "Tier D", "Tier E"],
  rules: [
    "Pricing and caps will be set based on Event 3 feedback.",
    "PM FoxHole on Discord before dropping items in the dropbox.",
    "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
  ],
};

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
      {[{ label: "DAYS", val: t.d }, { label: "HRS", val: t.h }, { label: "MIN", val: t.m }, { label: "SEC", val: t.s }].map(
        ({ label, val }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "1.8rem", fontWeight: "bold", color: "#ffd700",
              textShadow: "0 0 10px #ffd700", background: "rgba(0,0,0,0.6)",
              border: "2px solid #ffd700", borderRadius: "8px",
              padding: "8px 12px", minWidth: "56px",
            }}>
              {String(val).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.58rem", color: "#c5c6c7", marginTop: "4px", letterSpacing: "1px" }}>
              {label}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────
type Item = { name: string; qty: string; price?: string; max?: string };
type Tier = {
  name: string; subtitle: string; eligibility?: string;
  color: string; border: string; bg: string;
  priceRange: string; playerCap: string; totalCap: string;
  items: Item[];
};

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div style={{
      background: tier.bg, border: `2px solid ${tier.border}`,
      borderRadius: "12px", padding: "20px",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h2 style={{ color: tier.color, fontSize: "1.05rem", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>
            {tier.name}
          </h2>
          {tier.eligibility && (
            <span style={{
              fontSize: "0.58rem", color: tier.color,
              border: `1px solid ${tier.color}`, borderRadius: "4px",
              padding: "2px 6px", flexShrink: 0, marginLeft: "8px",
            }}>
              {tier.eligibility}
            </span>
          )}
        </div>
        <span style={{ color: "#c5c6c7", fontSize: "0.73rem" }}>{tier.subtitle}</span>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "10px 14px",
        fontSize: "0.7rem", color: "#c5c6c7", display: "flex", flexDirection: "column", gap: "4px",
      }}>
        <span>Price: <strong style={{ color: tier.color }}>{tier.priceRange}</strong></span>
        <span>Cap: <strong style={{ color: "#fff" }}>{tier.totalCap}</strong></span>
        <span>Per player: <strong style={{ color: "#ffd700" }}>{tier.playerCap}</strong></span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        {tier.items.map((item) => {
          const tbd = item.qty === "TBD";
          return (
            <li key={item.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 10px",
              background: tbd ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.3)",
              borderRadius: "6px", fontSize: "0.7rem", opacity: tbd ? 0.5 : 1,
            }}>
              <span style={{ color: "#e0e0e0" }}>{item.name}</span>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <span style={{ color: tbd ? "#555" : tier.color, fontWeight: "bold" }}>{item.qty}</span>
                {!tbd && item.price && (
                  <span style={{ color: "#999", fontSize: "0.6rem" }}>{item.price}</span>
                )}
                {!tbd && item.max && (
                  <span style={{
                    color: "#ffd700", fontSize: "0.6rem",
                    background: "rgba(255,215,0,0.12)", padding: "1px 5px", borderRadius: "3px",
                  }}>{item.max}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
function FAQAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid #45a29e",
          borderRadius: "8px", overflow: "hidden",
        }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", background: "none", border: "none",
              color: "#66fcf1", fontFamily: "Orbitron, sans-serif",
              fontSize: "0.75rem", textAlign: "left",
              padding: "12px 16px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span>{faq.q}</span>
            <span style={{ color: "#45a29e", fontSize: "1rem", marginLeft: "8px" }}>
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div style={{ padding: "0 16px 14px", color: "#c5c6c7", fontSize: "0.76rem", lineHeight: "1.65" }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shared section blocks ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: keyof typeof STATUS_COLORS }) {
  const s = STATUS_COLORS[status];
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <span style={{
        display: "inline-block", padding: "4px 18px",
        border: `2px solid ${s.border}`, borderRadius: "20px",
        background: s.bg, color: s.text,
        fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "2px",
      }}>
        {status}
      </span>
    </div>
  );
}

type Rule = { text: string; warn?: boolean };

function RulesBlock({ rules }: { rules: Rule[] }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.6)", border: "2px solid #45a29e",
      borderRadius: "12px", padding: "24px 20px",
    }}>
      <h3 style={{
        color: "#66fcf1", fontSize: "0.88rem", textTransform: "uppercase",
        letterSpacing: "2px", margin: "0 0 16px 0",
      }}>
        Rules &amp; How to Participate
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {rules.map((rule, i) => (
          <li key={i} style={{
            color: rule.warn ? "#ff4757" : "#c5c6c7",
            fontSize: rule.warn ? "0.8rem" : "0.78rem",
            fontWeight: rule.warn ? "bold" : "normal",
            lineHeight: "1.6", paddingLeft: "18px", position: "relative",
            ...(rule.warn && {
              background: "rgba(255,71,87,0.08)",
              border: "1px solid rgba(255,71,87,0.4)",
              borderRadius: "6px",
              padding: "8px 10px 8px 28px",
              marginTop: "4px",
            }),
          }}>
            <span style={{
              position: "absolute", left: rule.warn ? 10 : 0,
              color: rule.warn ? "#ff4757" : "#45a29e", fontWeight: "bold",
            }}>
              {rule.warn ? "⚠" : "•"}
            </span>
            {rule.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoyaltyBlock({ note }: { note: string }) {
  return (
    <div style={{
      background: "rgba(255,215,0,0.06)", border: "2px solid #ffd700",
      borderRadius: "12px", padding: "20px",
    }}>
      <h3 style={{
        color: "#ffd700", fontSize: "0.85rem", letterSpacing: "2px",
        textTransform: "uppercase", margin: "0 0 12px 0",
      }}>
        ★ Loyalty Multiplier — Tier D Exclusive
      </h3>
      <p style={{ color: "#c5c6c7", fontSize: "0.78rem", lineHeight: "1.7", margin: 0 }}>
        {note}
      </p>
    </div>
  );
}

// ─── Simple upcoming card (Event 4+, TBD pricing) ────────────────────────────
type SimpleUpcoming = typeof EVENT4;

function SimpleUpcomingCard({ event }: { event: SimpleUpcoming }) {
  const label = event.title.split("—")[1]?.trim() ?? event.title;
  return (
    <div style={{
      background: "rgba(0,0,0,0.4)", border: "2px solid #45a29e",
      borderRadius: "12px", padding: "24px 20px", marginBottom: "24px",
    }}>
      <p style={{
        textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem",
        letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase",
      }}>
        {label} starts in
      </p>
      <Countdown target={event.startDate} />

      <h2 style={{
        textAlign: "center", color: "#66fcf1", fontSize: "1rem",
        letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px",
      }}>
        {event.title}
      </h2>
      <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.72rem", letterSpacing: "1px", marginBottom: "12px" }}>
        {event.dateRange}
      </p>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <span style={{
          display: "inline-block", padding: "3px 14px",
          border: "2px solid #ffd700", borderRadius: "20px",
          background: "rgba(255,215,0,0.1)", color: "#ffd700",
          fontSize: "0.68rem", letterSpacing: "2px",
        }}>
          UPCOMING
        </span>
      </div>

      <p style={{ color: "#c5c6c7", fontSize: "0.78rem", lineHeight: "1.6", textAlign: "center", marginBottom: "18px" }}>
        {event.description}
      </p>

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px" }}>
        {event.tiers.map((tier, i) => (
          <span key={tier} style={{
            padding: "4px 14px", border: `1px solid ${TC[i].border}`,
            borderRadius: "20px", color: TC[i].color,
            fontSize: "0.68rem", letterSpacing: "1px", background: TC[i].bg,
          }}>
            {tier}
          </span>
        ))}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {event.rules.map((rule, i) => (
          <li key={i} style={{
            color: "#c5c6c7", fontSize: "0.74rem",
            paddingLeft: "16px", position: "relative", lineHeight: "1.55",
          }}>
            <span style={{ position: "absolute", left: 0, color: "#45a29e" }}>•</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Player progress tracker ──────────────────────────────────────────────────
function ProgressBar({ current, cap }: { current: number; cap: number }) {
  const pct = Math.min((current / cap) * 100, 100);
  const color = pct >= 100 ? "#00ff41" : pct >= 50 ? "#ffd700" : "#00d9ff";
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "4px", height: "5px", width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px" }} />
    </div>
  );
}

function PlayerTracker() {
  const [active, setActive] = useState(0);
  const player = PLAYERS[active];
  const hasItems =
    player.tiers.some((t) => t.items.some((i) => i.current > 0)) ||
    player.other.length > 0;

  return (
    <div style={{
      background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
      borderRadius: "12px", padding: "20px", marginBottom: "30px",
    }}>
      <h3 style={{
        color: "#66fcf1", fontSize: "0.82rem", letterSpacing: "2px",
        textTransform: "uppercase", margin: "0 0 16px 0",
      }}>
        Player Progress — Event 2
      </h3>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        {PLAYERS.map((p, i) => (
          <button key={p.name} onClick={() => setActive(i)} style={{
            background: i === active ? "rgba(0,255,65,0.12)" : "rgba(0,0,0,0.4)",
            border: `2px solid ${i === active ? "#00ff41" : "#45a29e"}`,
            color: i === active ? "#00ff41" : "#c5c6c7",
            fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem",
            padding: "6px 16px", borderRadius: "6px", cursor: "pointer",
            letterSpacing: "1px",
          }}>
            {p.name}
          </button>
        ))}
      </div>

      {/* Last counted timestamp */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "20px", padding: "7px 12px",
        background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: "6px",
      }}>
        <span style={{ color: "#ffd700", fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase" }}>
          Counted through:
        </span>
        <span style={{ color: "#c5c6c7", fontSize: "0.68rem" }}>{player.lastCounted}</span>
      </div>

      {/* Tier sections — flexible, works for any player */}
      {player.tiers.map((tier) => {
        const tc = TC[tier.colorIdx];
        return (
          <div key={tier.label} style={{ marginBottom: "20px" }}>
            <p style={{ color: tc.color, fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
              {tier.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tier.items.map((item) => (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ color: "#e0e0e0", fontSize: "0.72rem" }}>{item.name}</span>
                    <span style={{ fontSize: "0.68rem", color: item.current === 0 ? "#555" : "#c5c6c7" }}>
                      {item.current.toLocaleString()} / {item.cap === 0 ? "TBD" : item.cap.toLocaleString()}
                    </span>
                  </div>
                  {item.cap > 0 && <ProgressBar current={item.current} cap={item.cap} />}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Other collected items */}
      {player.other.length > 0 && (
        <>
          <p style={{ color: "#c5c6c7", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
            Other Collected
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {player.other.map((item) => (
              <div key={item.name} style={{
                display: "flex", justifyContent: "space-between",
                background: "rgba(0,0,0,0.3)", borderRadius: "6px", padding: "6px 10px",
              }}>
                <span style={{ color: "#c5c6c7", fontSize: "0.7rem" }}>{item.name}</span>
                <span style={{ color: "#ffd700", fontSize: "0.7rem", fontWeight: "bold" }}>{item.qty}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasItems && (
        <p style={{ color: "#555", fontSize: "0.75rem", textAlign: "center", marginTop: "10px" }}>
          No items recorded yet.
        </p>
      )}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div style={{ position: "relative", textAlign: "center", margin: "50px 0 40px" }}>
      <div style={{ borderTop: "2px solid #45a29e" }} />
      <span style={{
        position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)",
        background: "#0b0c10", padding: "0 20px",
        color: "#45a29e", fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuildEventsPage() {
  return (
    <div style={{
      width: "100%", minHeight: "100vh", backgroundColor: "#0b0c10",
      fontFamily: "Orbitron, sans-serif", color: "#66fcf1",
      overflowX: "hidden", paddingBottom: "80px",
    }}>
      {/* Top bar */}
      <div style={{
        background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          color: "#45a29e", textDecoration: "none",
          fontSize: "0.85rem", fontWeight: "bold", fontFamily: "Orbitron, sans-serif",
        }}>
          &larr; MOTHERSHIP
        </Link>
        <span style={{ fontSize: "0.7rem", color: "#c5c6c7", letterSpacing: "2px", textTransform: "uppercase" }}>
          Guild Events
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "30px 16px" }}>

        {/* ══════════════════ EVENT 2 — ACTIVE ══════════════════ */}
        <h1 style={{
          fontSize: "1.8rem", textAlign: "center",
          textShadow: "0 0 15px #66fcf1", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          {EVENT2.title}
        </h1>
        <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "14px" }}>
          {EVENT2.dateRange}
        </p>
        <StatusBadge status={EVENT2.status} />
        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.85rem",
          lineHeight: "1.7", maxWidth: "680px", margin: "0 auto 34px auto",
        }}>
          {EVENT2.description}
        </p>

        {/* Registered Players */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
          borderRadius: "12px", padding: "20px", marginBottom: "30px",
        }}>
          <h3 style={{
            color: "#66fcf1", fontSize: "0.82rem", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 14px 0",
          }}>
            Registered Players ({EVENT2.registeredPlayers.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {EVENT2.registeredPlayers.map((p) => (
              <span key={p} style={{
                padding: "4px 12px",
                background: "rgba(0,255,65,0.08)", border: "1px solid #00ff41",
                borderRadius: "20px", color: "#00ff41", fontSize: "0.72rem",
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Player Progress */}
        <PlayerTracker />

        {/* Tiers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px", marginBottom: "30px",
        }}>
          {EVENT2.tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "30px" }}>
          <LoyaltyBlock note={EVENT2.loyaltyNote} />
          <RulesBlock rules={EVENT2.rules} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{
            color: "#66fcf1", fontSize: "0.88rem", textTransform: "uppercase",
            letterSpacing: "2px", marginBottom: "16px",
          }}>
            How It Works — FAQ
          </h3>
          <FAQAccordion faqs={EVENT2.faqs} />
        </div>

        {/* ══════════════════ EVENT 3 — UPCOMING ══════════════════ */}
        <Divider label="Upcoming Events" />

        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem",
          letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase",
        }}>
          Event 3 starts in
        </p>
        <Countdown target={EVENT3.startDate} />

        <h2 style={{
          fontSize: "1.5rem", textAlign: "center",
          textShadow: "0 0 10px #ffd700", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px", color: "#ffd700",
        }}>
          {EVENT3.title}
        </h2>
        <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "14px" }}>
          {EVENT3.dateRange}
        </p>
        <StatusBadge status={EVENT3.status} />
        <p style={{
          textAlign: "center", color: "#c5c6c7", fontSize: "0.85rem",
          lineHeight: "1.7", maxWidth: "680px", margin: "0 auto 34px auto",
        }}>
          {EVENT3.description}
        </p>

        {/* Event 3 Tiers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px", marginBottom: "30px",
        }}>
          {EVENT3.tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "50px" }}>
          <LoyaltyBlock note={EVENT3.loyaltyNote} />
          <RulesBlock rules={EVENT3.rules} />
        </div>

        {/* ══════════════════ EVENT 4 — SIMPLE CARD ══════════════════ */}
        <SimpleUpcomingCard event={EVENT4} />

      </div>
    </div>
  );
}
