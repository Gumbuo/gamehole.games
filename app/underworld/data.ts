import type { Rarity, Role, Stats, OperativeCard, Rank, Faction, OperativeTraitInstance } from "./types";

export const THEME = {
  bg: "#160b0b",
  headerGradient: "linear-gradient(to bottom, #2a1010, #160b0b)",
  primary: "#c9302c",
  secondary: "#7a1f1c",
  accent: "#d4af37",
  cardBg: "rgba(42, 16, 16, 0.85)",
  font: "Orbitron, sans-serif",
  bodyFont: "'Share Tech Mono', monospace",
  textMuted: "#d8c9a9",
};

export const RARITIES: Record<
  Rarity,
  { label: string; weight: number; statMult: number; color: string }
> = {
  common: { label: "Common", weight: 50, statMult: 1.0, color: "#9ca3af" },
  uncommon: { label: "Uncommon", weight: 30, statMult: 1.15, color: "#22c55e" },
  rare: { label: "Rare", weight: 13, statMult: 1.35, color: "#3b82f6" },
  epic: { label: "Epic", weight: 5, statMult: 1.6, color: "#a855f7" },
  legendary: { label: "Legendary", weight: 2, statMult: 2.0, color: "#f59e0b" },
};

// Fictional factions, not real organizations or people — 4 pairs (mafia,
// street, biker, cartel) so every "type" of crew has a rival. Each operative
// belongs to one; it's mostly flavor (a small stat bonus, like a trait) so
// it doesn't overshadow Role/Rarity as the main build levers.
export const FACTIONS: Record<Faction, { label: string; description: string; color: string; statBonus: Partial<Stats> }> = {
  outfit: {
    label: "The Outfit",
    description: "Old-money organized crime. Discipline, connections, and a long memory.",
    color: "#d4af37",
    statBonus: { charm: 1 },
  },
  ferrante: {
    label: "The Ferrante Family",
    description: "A rival family running the docks and the unions. Ambitious, patient, always three moves ahead.",
    color: "#9333ea",
    statBonus: { cunning: 1 },
  },
  serpent_row: {
    label: "Floods",
    description: "Street-level crew running the block. Fast, loyal to the corner, vicious when crossed.",
    color: "#ef4444",
    statBonus: { stealth: 1 },
  },
  grips: {
    label: "Grips",
    description: "Rival crew running the west side. Tight-knit, quick to retaliate, never forget a slight.",
    color: "#3b82f6",
    statBonus: { nerve: 1 },
  },
  iron_wolves: {
    label: "Hells Angles MC",
    description: "Outlaw motorcycle club. Muscle on two wheels, brotherhood over everything.",
    color: "#94a3b8",
    statBonus: { power: 1 },
  },
  mongrols: {
    label: "Mongrols MC",
    description: "Rival outlaw club. Rougher, meaner, and always looking for a fight.",
    color: "#ea580c",
    statBonus: { power: 1 },
  },
  simaloa: {
    label: "Simaloa Cartel",
    description: "Cross-border trafficking network. Ruthless efficiency, deep pockets, longer reach than anyone in town.",
    color: "#22c55e",
    statBonus: { cunning: 1 },
  },
  los_zetos: {
    label: "Los Zetos",
    description: "Ex-military enforcers turned cartel muscle. Disciplined, brutal, feared even by the other crews.",
    color: "#06b6d4",
    statBonus: { nerve: 1 },
  },
};

export function rollFaction(): Faction {
  const factions = Object.keys(FACTIONS) as Faction[];
  return factions[Math.floor(Math.random() * factions.length)];
}

export const ROLES: Record<
  Role,
  { label: string; description: string; base: Stats }
> = {
  muscle: {
    label: "Muscle",
    description: "Enforcer — muscle for the Family.",
    base: { power: 8, cunning: 2, charm: 2, stealth: 3, nerve: 4 },
  },
  driver: {
    label: "Driver",
    description: "Wheelman — nobody outruns him.",
    base: { power: 4, cunning: 8, charm: 2, stealth: 4, nerve: 3 },
  },
  fixer: {
    label: "Fixer",
    description: "Greases palms, buries problems.",
    base: { power: 2, cunning: 4, charm: 8, stealth: 2, nerve: 3 },
  },
  runner: {
    label: "Runner",
    description: "Moves product, knows every back alley.",
    base: { power: 3, cunning: 4, charm: 2, stealth: 8, nerve: 3 },
  },
  consigliere: {
    label: "Consigliere",
    description: "The Family's quiet advisor.",
    base: { power: 2, cunning: 5, charm: 5, stealth: 2, nerve: 8 },
  },
};

// Name pools split by faction TYPE and gender — trimmed to exactly 3 names
// per (type, gender), one per portrait in PORTRAIT_POOL below, so every
// name maps to its own dedicated, never-shared portrait. An earlier version
// had many more names than portraits (e.g. 18 mafia male names against only
// 3 portraits), so different names were mathematically guaranteed to share
// art (pigeonhole principle) no matter how the index was picked — random or
// hashed, collisions were inevitable once names outnumbered portraits. The
// fix is this 1:1 sizing, not a smarter index picker.
export const NAME_POOLS: Record<FactionType, { m: string[]; f: string[] }> = {
  mafia: { m: ["Vinny", "Tony", "Carmine"], f: ["Rosa", "Gia", "Cristina"] },
  street: { m: ["Dutch", "Lucky", "Cutter"], f: ["Angie", "Peaches", "Nova"] },
  biker: { m: ["Diesel", "Preacher", "Bones"], f: ["Raven", "Widow", "Harley"] },
  cartel: { m: ["Chuy", "Nacho", "Tigre"], f: ["Lola", "Reyna", "Chula"] },
};

// Faction-aware portrait system (v2) — the original pool used one shared
// "1950s mafia" look for every faction, which looked wrong once the roster
// grew to 4 faction TYPES (mafia/street/biker/cartel): a Grips or Mongrols
// operative shouldn't render in a pinstripe suit. Portraits now key off
// (faction type, gender) instead of name, so the same name can render
// differently depending which faction it rolled into. Also higher native
// resolution (160x270 vs the old 100x168) per the earlier blur complaint —
// same `object-fit: cover` display code in page.tsx, just a sharper source.
export type FactionType = "mafia" | "street" | "biker" | "cartel";

export const FACTION_TYPE: Record<Faction, FactionType> = {
  outfit: "mafia",
  ferrante: "mafia",
  serpent_row: "street",
  grips: "street",
  iron_wolves: "biker",
  mongrols: "biker",
  simaloa: "cartel",
  los_zetos: "cartel",
};

const PORTRAIT_POOL: Record<FactionType, { m: string[]; f: string[] }> = {
  mafia: {
    m: ["/underworld/characters/mafia_m1.png", "/underworld/characters/mafia_m2.png", "/underworld/characters/mafia_m3.png"],
    f: ["/underworld/characters/mafia_f1.png", "/underworld/characters/mafia_f2.png", "/underworld/characters/mafia_f3.png"],
  },
  street: {
    m: ["/underworld/characters/street_m1.png", "/underworld/characters/street_m2.png", "/underworld/characters/street_m3.png"],
    f: ["/underworld/characters/street_f1.png", "/underworld/characters/street_f2.png", "/underworld/characters/street_f3.png"],
  },
  biker: {
    m: ["/underworld/characters/biker_m1.png", "/underworld/characters/biker_m2.png", "/underworld/characters/biker_m3.png"],
    f: ["/underworld/characters/biker_f1.png", "/underworld/characters/biker_f2.png", "/underworld/characters/biker_f3.png"],
  },
  cartel: {
    m: ["/underworld/characters/cartel_m1.png", "/underworld/characters/cartel_m2.png", "/underworld/characters/cartel_m3.png"],
    f: ["/underworld/characters/cartel_f1.png", "/underworld/characters/cartel_f2.png", "/underworld/characters/cartel_f3.png"],
  },
};

// Gender lookup must cover every female name this project has EVER used,
// not just the current NAME_POOLS — trimming a name out of the rollable
// pool (as happened going from 38 names down to 24) doesn't erase it from
// existing operatives' saves. Deriving this set from NAME_POOLS alone
// caused a real regression: "Bianca" (an original mafia name, since
// trimmed) fell through to "m", both mis-gendering her portrait and
// colliding her with male legacy names in the hash fallback. Kept as an
// explicit superset — current pool names plus every retired one — rather
// than derived, specifically so future trims can't silently break this
// again.
const FEMALE_NAMES = new Set([
  ...(Object.keys(NAME_POOLS) as FactionType[]).flatMap((t) => NAME_POOLS[t].f),
  // Retired names (cut from NAME_POOLS, but may still exist on live saves):
  "Bianca", "Maria", "Ruckus", "Nena",
]);

function genderOf(name: string): "m" | "f" {
  return FEMALE_NAMES.has(name) ? "f" : "m";
}

// LEGACY NAMES: names created before NAME_POOLS was trimmed down to 3-per-
// slot (e.g. "Tommy Two-Times", "Pauly Walnuts", "Frankie" — real, still-
// existing operatives on live saves) aren't in the current pool at all, and
// there are more retired names than slots, so no fallback scheme can give
// them the same hard zero-collision guarantee current names get (pigeonhole
// principle — confirmed by user request to fold them into the current
// system instead of chasing better and better fallbacks). This renames a
// legacy operative to one of its (faction, gender)'s 3 current names,
// picked deterministically from the OLD name so a given operative always
// lands on the same replacement — not randomly reassigned every load —
// giving it the exact same guarantee new recruits get. Explicitly first-
// names only (matches every current pool entry already being a single
// first name) per the user's direction: no compound/nickname suffixes like
// "Two-Times" reappearing in a renamed result.
export function normalizeOperativeName(name: string, faction: Faction): string {
  const gender = genderOf(name);
  const pool = NAME_POOLS[FACTION_TYPE[faction]][gender];
  if (pool.includes(name)) return name;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

// portraitIndex is a DIRECT, deterministic lookup — a name's position in its
// NAME_POOLS[type][gender] array. Since NAME_POOLS is sized 1:1 with
// PORTRAIT_POOL (3 names, 3 portraits, per slot), and `name` has already
// been run through `normalizeOperativeName` by the time this is called
// (sweep.ts does this before rolling the portrait), every name reaching
// here is guaranteed to be found — no fallback needed. (Two operatives with
// the SAME name still share a portrait — expected, not a bug.)
export function rollPortraitIndex(name: string, faction: Faction): number {
  const gender = genderOf(name);
  const pool = NAME_POOLS[FACTION_TYPE[faction]][gender];
  const idx = pool.indexOf(name);
  if (idx >= 0) return idx;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % pool.length;
}

export function getPortrait(name: string, faction: Faction, portraitIndex: number): string {
  const pool = PORTRAIT_POOL[FACTION_TYPE[faction]][genderOf(name)];
  return pool[portraitIndex % pool.length];
}

export type TraitId =
  | "night_owl" | "loyal" | "silver_tongue" | "quick_hands"
  | "ice_cold" | "fast_learner" | "greedy" | "cautious" | "iron_will";

// Every operative rolls TRAITS_PER_OPERATIVE distinct traits, each at a
// level 1-MAX_TRAIT_LEVEL — descriptions below are the PER-LEVEL magnitude,
// so a level-5 trait matches this project's original fixed-bonus values
// (e.g. Night Owl was a flat +15% cash; at 3%/level, level 5 = +15%).
export const TRAITS: Record<TraitId, { label: string; description: string; icon: string }> = {
  night_owl: { label: "Night Owl", description: "+3% cash on completed Jobs, per level.", icon: "🌙" },
  loyal: { label: "Loyal", description: "Heat gain from failed Jobs cut 10% per level.", icon: "♥" },
  silver_tongue: { label: "Silver Tongue", description: "+3% Reputation from Jobs, per level.", icon: "💬" },
  quick_hands: { label: "Quick Hands", description: "+2% Job success chance, per level.", icon: "⚡" },
  ice_cold: { label: "Ice Cold", description: "4% less Heat from every Job per level, win or lose.", icon: "❄" },
  fast_learner: { label: "Fast Learner", description: "+4% XP from Jobs, per level.", icon: "📈" },
  greedy: { label: "Greedy", description: "+5% cash from Jobs per level — but +5% Heat too.", icon: "💰" },
  cautious: { label: "Cautious", description: "4% less Heat from Jobs per level — but -2% success chance.", icon: "👁" },
  iron_will: { label: "Iron Will", description: "20% chance per level to avoid Injury on a failed Job.", icon: "🛡" },
};

export const MAX_TRAIT_LEVEL = 5;
export const TRAITS_PER_OPERATIVE = 3;

export interface DistrictDef {
  id: string;
  name: string;
  description: string;
  repRequired: number;
  priceMultiplier: number;
}

export const DISTRICTS: DistrictDef[] = [
  { id: "southside", name: "Southside",
    description: "Where the Family started. Cheap product, small-time jobs.",
    repRequired: 0, priceMultiplier: 0.85 },
  { id: "littleitaly", name: "Little Italy",
    description: "Old money, older grudges. Everybody owes somebody.",
    repRequired: 20, priceMultiplier: 0.95 },
  { id: "docks", name: "The Docks",
    description: "Shipping containers and short tempers.",
    repRequired: 60, priceMultiplier: 1.05 },
  { id: "chinatown", name: "Chinatown",
    description: "Contested turf — three Families work these blocks.",
    repRequired: 130, priceMultiplier: 1.15 },
  { id: "uptown", name: "Uptown",
    description: "Where the real money — and the real heat — lives.",
    repRequired: 250, priceMultiplier: 1.3 },
  { id: "heights", name: "The Heights",
    description: "Penthouses and boardrooms. The top of the food chain.",
    repRequired: 450, priceMultiplier: 1.5 },
];

export interface JobDef {
  id: string;
  districtId: string;
  name: string;
  description: string;
  durationMs: number;
  stat: keyof Stats;
  statReq: number;
  roleBonus: Role;
  crewSize: 1 | 2;
  baseSuccessChance: number;
  cashReward: number;
  repReward: number;
  xpReward: number;
  heatGain: number;
  failHeatGain: number;
}

export const JOBS: JobDef[] = [
  // --- Southside (tier 0) ---
  { id: "shakedown_bookie", districtId: "southside", name: "Shake Down a Bookie",
    description: "Collect what's owed, politely.", durationMs: 2 * 60_000,
    stat: "power", statReq: 4, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.8,
    cashReward: 40, repReward: 2, xpReward: 15, heatGain: 3, failHeatGain: 5 },
  { id: "boost_van", districtId: "southside", name: "Boost a Delivery Van",
    description: "In and out before the driver's back with his coffee.", durationMs: 5 * 60_000,
    stat: "cunning", statReq: 5, roleBonus: "driver", crewSize: 1, baseSuccessChance: 0.75,
    cashReward: 90, repReward: 4, xpReward: 25, heatGain: 5, failHeatGain: 8 },
  { id: "lean_shop", districtId: "southside", name: "Lean on a Shop Owner",
    description: "Protection money doesn't collect itself.", durationMs: 3 * 60_000,
    stat: "charm", statReq: 4, roleBonus: "fixer", crewSize: 1, baseSuccessChance: 0.8,
    cashReward: 55, repReward: 3, xpReward: 18, heatGain: 4, failHeatGain: 6 },
  { id: "move_dime_bags", districtId: "southside", name: "Move a Few Dime Bags",
    description: "Small-time, but it adds up.", durationMs: 4 * 60_000,
    stat: "stealth", statReq: 5, roleBonus: "runner", crewSize: 1, baseSuccessChance: 0.8,
    cashReward: 70, repReward: 3, xpReward: 20, heatGain: 4, failHeatGain: 6 },
  { id: "hit_the_corner_bank", districtId: "southside", name: "Hit the Corner Bank",
    description: "Two of you, five minutes, one exit. Simple.", durationMs: 8 * 60_000,
    stat: "power", statReq: 9, roleBonus: "muscle", crewSize: 2, baseSuccessChance: 0.6,
    cashReward: 260, repReward: 12, xpReward: 55, heatGain: 12, failHeatGain: 18 },

  // --- Little Italy (tier 1) ---
  { id: "collect_dues", districtId: "littleitaly", name: "Collect the Weekly Dues",
    description: "Every shop on the block pays. Every week.", durationMs: 5 * 60_000,
    stat: "charm", statReq: 8, roleBonus: "fixer", crewSize: 1, baseSuccessChance: 0.78,
    cashReward: 120, repReward: 6, xpReward: 30, heatGain: 6, failHeatGain: 9 },
  { id: "tail_a_rat", districtId: "littleitaly", name: "Tail a Suspected Rat",
    description: "Follow him. Find out who he's talking to.", durationMs: 7 * 60_000,
    stat: "cunning", statReq: 9, roleBonus: "driver", crewSize: 1, baseSuccessChance: 0.72,
    cashReward: 140, repReward: 7, xpReward: 35, heatGain: 5, failHeatGain: 8 },
  { id: "settle_a_dispute", districtId: "littleitaly", name: "Settle a Dispute",
    description: "Two capos, one territory. Somebody's gotta mediate.", durationMs: 6 * 60_000,
    stat: "nerve", statReq: 10, roleBonus: "consigliere", crewSize: 1, baseSuccessChance: 0.7,
    cashReward: 160, repReward: 10, xpReward: 38, heatGain: 4, failHeatGain: 7 },
  { id: "break_some_kneecaps", districtId: "littleitaly", name: "Break Some Kneecaps",
    description: "A reminder that debts get paid.", durationMs: 5 * 60_000,
    stat: "power", statReq: 9, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.75,
    cashReward: 130, repReward: 6, xpReward: 32, heatGain: 8, failHeatGain: 12 },
  { id: "torch_the_restaurant", districtId: "littleitaly", name: "Torch a Rival's Restaurant",
    description: "Insurance fraud, Family style. Needs two sets of hands.", durationMs: 10 * 60_000,
    stat: "stealth", statReq: 12, roleBonus: "runner", crewSize: 2, baseSuccessChance: 0.6,
    cashReward: 380, repReward: 18, xpReward: 70, heatGain: 14, failHeatGain: 20 },

  // --- The Docks (tier 2) ---
  { id: "offload_container", districtId: "docks", name: "Offload a Hot Container",
    description: "It fell off a ship. Move it before questions get asked.", durationMs: 10 * 60_000,
    stat: "stealth", statReq: 13, roleBonus: "runner", crewSize: 1, baseSuccessChance: 0.65,
    cashReward: 220, repReward: 10, xpReward: 50, heatGain: 10, failHeatGain: 15 },
  { id: "chase_scouts", districtId: "docks", name: "Chase Off Rival Scouts",
    description: "Someone else's crew is sniffing around the yard.", durationMs: 8 * 60_000,
    stat: "power", statReq: 13, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.7,
    cashReward: 180, repReward: 8, xpReward: 45, heatGain: 9, failHeatGain: 14 },
  { id: "bribe_harbormaster", districtId: "docks", name: "Bribe the Harbor Master",
    description: "A little cash buys a lot of blind eyes.", durationMs: 6 * 60_000,
    stat: "charm", statReq: 12, roleBonus: "fixer", crewSize: 1, baseSuccessChance: 0.75,
    cashReward: 150, repReward: 9, xpReward: 40, heatGain: 6, failHeatGain: 10 },
  { id: "sink_a_rival_shipment", districtId: "docks", name: "Sink a Rival's Shipment",
    description: "Poetic, if a little wet.", durationMs: 9 * 60_000,
    stat: "cunning", statReq: 14, roleBonus: "driver", crewSize: 1, baseSuccessChance: 0.68,
    cashReward: 240, repReward: 12, xpReward: 55, heatGain: 11, failHeatGain: 16 },
  { id: "hijack_the_freighter", districtId: "docks", name: "Hijack a Freighter",
    description: "The whole boat. You'll need backup.", durationMs: 15 * 60_000,
    stat: "power", statReq: 16, roleBonus: "muscle", crewSize: 2, baseSuccessChance: 0.55,
    cashReward: 520, repReward: 24, xpReward: 90, heatGain: 16, failHeatGain: 24 },

  // --- Chinatown (tier 3) ---
  { id: "broker_a_truce", districtId: "chinatown", name: "Broker a Truce",
    description: "Three Families, one street. Somebody has to talk sense.", durationMs: 12 * 60_000,
    stat: "nerve", statReq: 16, roleBonus: "consigliere", crewSize: 1, baseSuccessChance: 0.62,
    cashReward: 300, repReward: 18, xpReward: 65, heatGain: 8, failHeatGain: 12 },
  { id: "raid_a_counting_house", districtId: "chinatown", name: "Raid a Counting House",
    description: "Somebody else's cash, now yours.", durationMs: 11 * 60_000,
    stat: "power", statReq: 17, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.6,
    cashReward: 340, repReward: 16, xpReward: 68, heatGain: 13, failHeatGain: 19 },
  { id: "smuggle_through_the_market", districtId: "chinatown", name: "Smuggle Through the Market",
    description: "Hide it in plain sight, between the fish stalls.", durationMs: 9 * 60_000,
    stat: "stealth", statReq: 16, roleBonus: "runner", crewSize: 1, baseSuccessChance: 0.65,
    cashReward: 280, repReward: 14, xpReward: 60, heatGain: 10, failHeatGain: 15 },
  { id: "turn_a_lieutenant", districtId: "chinatown", name: "Turn a Rival Lieutenant",
    description: "Everyone's loyal until the price is right.", durationMs: 14 * 60_000,
    stat: "charm", statReq: 17, roleBonus: "fixer", crewSize: 1, baseSuccessChance: 0.58,
    cashReward: 360, repReward: 20, xpReward: 75, heatGain: 9, failHeatGain: 14 },
  { id: "take_the_whole_block", districtId: "chinatown", name: "Take the Whole Block",
    description: "Not a job. A statement. Bring friends.", durationMs: 18 * 60_000,
    stat: "power", statReq: 20, roleBonus: "muscle", crewSize: 2, baseSuccessChance: 0.5,
    cashReward: 700, repReward: 32, xpReward: 120, heatGain: 20, failHeatGain: 28 },

  // --- Uptown (tier 4) ---
  { id: "blackmail_councilman", districtId: "uptown", name: "Blackmail a City Councilman",
    description: "Everybody's got a price, and everybody's got a secret.", durationMs: 20 * 60_000,
    stat: "nerve", statReq: 20, roleBonus: "consigliere", crewSize: 1, baseSuccessChance: 0.6,
    cashReward: 500, repReward: 25, xpReward: 100, heatGain: 15, failHeatGain: 22 },
  { id: "heist_gala", districtId: "uptown", name: "Heist the Charity Gala",
    description: "Half the city's jewelry, one room, one night.", durationMs: 25 * 60_000,
    stat: "cunning", statReq: 20, roleBonus: "driver", crewSize: 1, baseSuccessChance: 0.55,
    cashReward: 650, repReward: 30, xpReward: 120, heatGain: 18, failHeatGain: 26 },
  { id: "whack_snitch", districtId: "uptown", name: "Whack a Snitch",
    description: "Loose lips sink Families. This one's talked enough.", durationMs: 30 * 60_000,
    stat: "power", statReq: 22, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.6,
    cashReward: 800, repReward: 20, xpReward: 140, heatGain: 25, failHeatGain: 35 },
  { id: "launder_through_the_gallery", districtId: "uptown", name: "Launder Through the Gallery",
    description: "Fine art, finer margins.", durationMs: 22 * 60_000,
    stat: "stealth", statReq: 21, roleBonus: "runner", crewSize: 1, baseSuccessChance: 0.58,
    cashReward: 700, repReward: 28, xpReward: 130, heatGain: 12, failHeatGain: 18 },
  { id: "rob_the_penthouse_gala", districtId: "uptown", name: "Rob the Penthouse Gala",
    description: "Every made man in the city, under one roof. Needs a full crew.", durationMs: 35 * 60_000,
    stat: "charm", statReq: 24, roleBonus: "fixer", crewSize: 2, baseSuccessChance: 0.5,
    cashReward: 1400, repReward: 45, xpReward: 220, heatGain: 22, failHeatGain: 30 },

  // --- The Heights (tier 5) ---
  { id: "buy_a_judge", districtId: "heights", name: "Buy a Judge",
    description: "The right verdict, the right price.", durationMs: 28 * 60_000,
    stat: "nerve", statReq: 26, roleBonus: "consigliere", crewSize: 1, baseSuccessChance: 0.55,
    cashReward: 1100, repReward: 40, xpReward: 180, heatGain: 14, failHeatGain: 20 },
  { id: "hostile_takeover", districtId: "heights", name: "Hostile Takeover",
    description: "A boardroom coup, Family-financed.", durationMs: 32 * 60_000,
    stat: "stealth", statReq: 27, roleBonus: "runner", crewSize: 1, baseSuccessChance: 0.52,
    cashReward: 1300, repReward: 45, xpReward: 200, heatGain: 16, failHeatGain: 23 },
  { id: "eliminate_the_dons_rival", districtId: "heights", name: "Eliminate the Don's Rival",
    description: "The last obstacle. Permanently.", durationMs: 40 * 60_000,
    stat: "power", statReq: 30, roleBonus: "muscle", crewSize: 1, baseSuccessChance: 0.5,
    cashReward: 1600, repReward: 35, xpReward: 240, heatGain: 30, failHeatGain: 42 },
  { id: "rig_the_election", districtId: "heights", name: "Rig the Election",
    description: "Democracy, with a Family thumb on the scale.", durationMs: 38 * 60_000,
    stat: "charm", statReq: 28, roleBonus: "fixer", crewSize: 1, baseSuccessChance: 0.5,
    cashReward: 1500, repReward: 55, xpReward: 220, heatGain: 18, failHeatGain: 26 },
  { id: "take_the_whole_city", districtId: "heights", name: "Take the Whole City",
    description: "Every Family answers to you now. If you pull this off.", durationMs: 50 * 60_000,
    stat: "power", statReq: 32, roleBonus: "muscle", crewSize: 2, baseSuccessChance: 0.45,
    cashReward: 3000, repReward: 80, xpReward: 400, heatGain: 28, failHeatGain: 38 },
];

export interface RacketDef {
  id: string;
  districtId: string;
  name: string;
  description: string;
  baseCost: number;
  baseRatePerHour: number;
  repRequired: number;
}

export const RACKETS: RacketDef[] = [
  { id: "chop_shop", districtId: "southside", name: "Chop Shop",
    description: "Stolen cars in, clean parts out.", baseCost: 300,
    baseRatePerHour: 30, repRequired: 0 },
  { id: "laundromat", districtId: "littleitaly", name: "The Laundromat",
    description: "Dirty money goes in clean. Family classic.", baseCost: 550,
    baseRatePerHour: 55, repRequired: 20 },
  { id: "fence", districtId: "docks", name: "The Fence",
    description: "Anything hot moves through here eventually.", baseCost: 900,
    baseRatePerHour: 95, repRequired: 60 },
  { id: "import_warehouse", districtId: "chinatown", name: "Import Warehouse",
    description: "Paperwork says textiles. It's never textiles.", baseCost: 1600,
    baseRatePerHour: 170, repRequired: 130 },
  { id: "investment_office", districtId: "uptown", name: "Investment Office",
    description: "A legitimate front for a very illegitimate business.", baseCost: 2800,
    baseRatePerHour: 300, repRequired: 250 },
  { id: "private_casino", districtId: "heights", name: "Private Casino",
    description: "The house always wins. Especially this house.", baseCost: 5500,
    baseRatePerHour: 620, repRequired: 450 },
];

export interface ProductTierDef {
  id: string;
  name: string;
  basePrice: number;
  volatility: number;
  image?: string;
}

export const PRODUCT_TIERS: ProductTierDef[] = [
  { id: "weed", name: "Weed", basePrice: 10, volatility: 0.3, image: "/underworld/products/weed.png" },
  { id: "pills", name: "Pills", basePrice: 45, volatility: 0.35, image: "/underworld/products/pills.png" },
  { id: "cocaine", name: "Cocaine", basePrice: 80, volatility: 0.4, image: "/underworld/products/cocaine.png" },
  { id: "meth", name: "Meth", basePrice: 140, volatility: 0.45, image: "/underworld/products/meth.png" },
  { id: "heroin", name: "Heroin", basePrice: 220, volatility: 0.5, image: "/underworld/products/heroin.png" },
];

// Equipment/crafting system — modeled on a reference game's "Workshop":
// pick a category, pick a recipe within it, forge it up through rarity
// tiers by feeding in cash + Scrap/Bullion + copies of the previous tier,
// each craft taking real time on one of a limited number of benches.
export type ItemKind = "headwear" | "torso" | "hands" | "footwear";

export interface ItemDef {
  id: string;
  name: string;
  kind: ItemKind;
  description: string;
  statBonus: Partial<Stats>;
  recipeId: string;
  tier: Rarity;
  image: string;
}

export interface EquipmentRecipe {
  id: string;
  name: string;
  kind: ItemKind;
  stat: keyof Stats;
  description: string;
  image: string;
}

export const EQUIPMENT_RECIPES: EquipmentRecipe[] = [
  { id: "fedora", name: "Fedora", kind: "headwear", stat: "charm", description: "Eyes on the prize.", image: "/underworld/items/fedora.png" },
  { id: "ski_mask", name: "Ski Mask", kind: "headwear", stat: "stealth", description: "Nobody's getting a good look at you.", image: "/underworld/items/ski_mask.png" },
  { id: "pinstripe_vest", name: "Pinstripe Vest", kind: "torso", stat: "charm", description: "Tailored to intimidate.", image: "/underworld/items/pinstripe_vest.png" },
  { id: "kevlar_vest", name: "Kevlar Vest", kind: "torso", stat: "power", description: "Insurance you can wear.", image: "/underworld/items/kevlar_vest.png" },
  { id: "brass_knux", name: "Brass Knuckles", kind: "hands", stat: "power", description: "Old-school persuasion.", image: "/underworld/items/brass_knux.png" },
  { id: "leather_gloves", name: "Leather Gloves", kind: "hands", stat: "cunning", description: "No prints, no problem.", image: "/underworld/items/leather_gloves.png" },
  { id: "wingtips", name: "Wingtips", kind: "footwear", stat: "charm", description: "Walks into any room like he owns it.", image: "/underworld/items/wingtips.png" },
  { id: "getaway_boots", name: "Getaway Boots", kind: "footwear", stat: "stealth", description: "Built for a quick exit.", image: "/underworld/items/getaway_boots.png" },
];

export interface ForgeTierDef {
  tier: Rarity;
  benchMs: number;
  cashCost: number;
  scrapCost: number;
  bullionCost: number;
  prereqTier: Rarity | null;
  prereqQty: number;
  statBonus: number;
  bonusUpgradeChance: number;
}

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export const FORGE_TIERS: Record<Rarity, ForgeTierDef> = {
  common: { tier: "common", benchMs: 10 * 60_000, cashCost: 150, scrapCost: 10, bullionCost: 0, prereqTier: null, prereqQty: 0, statBonus: 3, bonusUpgradeChance: 0.05 },
  uncommon: { tier: "uncommon", benchMs: 30 * 60_000, cashCost: 500, scrapCost: 25, bullionCost: 0, prereqTier: "common", prereqQty: 2, statBonus: 5, bonusUpgradeChance: 0.05 },
  rare: { tier: "rare", benchMs: 2 * 3_600_000, cashCost: 1500, scrapCost: 50, bullionCost: 2, prereqTier: "uncommon", prereqQty: 1, statBonus: 8, bonusUpgradeChance: 0.04 },
  epic: { tier: "epic", benchMs: 6 * 3_600_000, cashCost: 4000, scrapCost: 100, bullionCost: 5, prereqTier: "rare", prereqQty: 1, statBonus: 12, bonusUpgradeChance: 0.03 },
  legendary: { tier: "legendary", benchMs: 18 * 3_600_000, cashCost: 10_000, scrapCost: 200, bullionCost: 12, prereqTier: "epic", prereqQty: 1, statBonus: 18, bonusUpgradeChance: 0 },
};

export function craftedItemId(recipeId: string, tier: Rarity): string {
  return `${recipeId}_${tier}`;
}

export const ITEMS: ItemDef[] = EQUIPMENT_RECIPES.flatMap((r) =>
  RARITY_ORDER.map((tier) => {
    const ft = FORGE_TIERS[tier];
    return {
      id: craftedItemId(r.id, tier),
      name: `${RARITIES[tier].label} ${r.name}`,
      kind: r.kind,
      description: r.description,
      statBonus: { [r.stat]: ft.statBonus } as Partial<Stats>,
      recipeId: r.id,
      tier,
      image: r.image,
    };
  })
);

export const STARTER_BENCH_COUNT = 2;
export const MAX_BENCH_COUNT = 6;
// Cost to unlock the 3rd, 4th, 5th, and 6th bench, in that order.
export const BENCH_UNLOCK_COSTS = [5000, 20_000, 75_000, 250_000];

// --- Territory: shared PvP hex map ---
// Axial (pointy-top) coordinates. 6 district "hub" tiles at ring-1, 12
// district "outer" tiles at ring-2 (2 per district, angularly paired with
// their district's hub), plus 1 special "City Hall" tile at the center —
// 19 tiles total, filling a clean radius-2 hex grid.
export interface TerritoryTileDef {
  id: string;
  districtId: string | null; // null for the City Hall center tile
  name: string;
  description: string;
  q: number;
  r: number;
  repRequired: number;
  baseRatePerHour: number;
  image?: string; // PixelLab-generated tile art; falls back to a flat fill when absent
}

export const TERRITORY_TILES: TerritoryTileDef[] = [
  { id: "city_hall", districtId: null, name: "City Hall",
    description: "Whoever holds this holds the city. Everyone's watching.",
    q: 0, r: 0, repRequired: 150, baseRatePerHour: 500, image: "/underworld/tiles/city_hall.png" },

  { id: "southside_corner", districtId: "southside", name: "The Corner",
    description: "Every Family's first piece of turf.", q: -1, r: 1, repRequired: 0, baseRatePerHour: 25,
    image: "/underworld/tiles/southside_corner.png" },
  { id: "southside_warehouse", districtId: "southside", name: "Warehouse Row",
    description: "Empty by day, busy by night.", q: -2, r: 2, repRequired: 0, baseRatePerHour: 20,
    image: "/underworld/tiles/southside_warehouse.png" },
  { id: "southside_backstreet", districtId: "southside", name: "Backstreet Market",
    description: "You can buy anything here if you know who to ask.", q: -1, r: 2, repRequired: 0, baseRatePerHour: 20,
    image: "/underworld/tiles/southside_backstreet.png" },

  { id: "littleitaly_piazza", districtId: "littleitaly", name: "The Piazza",
    description: "Where the old men sit and decide everything.", q: 0, r: 1, repRequired: 20, baseRatePerHour: 45,
    image: "/underworld/tiles/littleitaly_piazza.png" },
  { id: "littleitaly_alley", districtId: "littleitaly", name: "Old Town Alley",
    description: "Narrow, dark, and exactly where you'd expect trouble.", q: 0, r: 2, repRequired: 20, baseRatePerHour: 35,
    image: "/underworld/tiles/littleitaly_alley.png" },
  { id: "littleitaly_social", districtId: "littleitaly", name: "The Social Club",
    description: "No sign on the door. You already know if you belong.", q: 1, r: 1, repRequired: 20, baseRatePerHour: 35,
    image: "/underworld/tiles/littleitaly_social.png" },

  { id: "docks_pier9", districtId: "docks", name: "Pier 9",
    description: "The busiest — and most watched — pier in the harbor.", q: 1, r: 0, repRequired: 60, baseRatePerHour: 80,
    image: "/underworld/tiles/docks_pier9.png" },
  { id: "docks_containers", districtId: "docks", name: "Container Yard",
    description: "A thousand boxes. Nobody checks all of them.", q: 2, r: 0, repRequired: 60, baseRatePerHour: 65,
    image: "/underworld/tiles/docks_containers.png" },
  { id: "docks_wharf", districtId: "docks", name: "Smuggler's Wharf",
    description: "Built for exactly what it sounds like.", q: 2, r: -1, repRequired: 60, baseRatePerHour: 65,
    image: "/underworld/tiles/docks_wharf.png" },

  { id: "chinatown_market", districtId: "chinatown", name: "Night Market",
    description: "Three Families' turf overlaps here. Always contested.", q: 1, r: -1, repRequired: 130, baseRatePerHour: 150,
    image: "/underworld/tiles/chinatown_market.png" },
  { id: "chinatown_row", districtId: "chinatown", name: "Herbal Row",
    description: "Old-world shopfronts, new-world business in the back.", q: 2, r: -2, repRequired: 130, baseRatePerHour: 120,
    image: "/underworld/tiles/chinatown_row.png" },
  { id: "chinatown_underpass", districtId: "chinatown", name: "The Underpass",
    description: "Out of sight of every camera in the district.", q: 1, r: -2, repRequired: 130, baseRatePerHour: 120,
    image: "/underworld/tiles/chinatown_underpass.png" },

  { id: "uptown_gallery", districtId: "uptown", name: "Gallery District",
    description: "Money laundered through canvas and marble.", q: 0, r: -1, repRequired: 250, baseRatePerHour: 260,
    image: "/underworld/tiles/uptown_gallery.png" },
  { id: "uptown_penthouse", districtId: "uptown", name: "Penthouse Row",
    description: "Every window looks down on someone.", q: 0, r: -2, repRequired: 250, baseRatePerHour: 210,
    image: "/underworld/tiles/uptown_penthouse.png" },
  { id: "uptown_exchange", districtId: "uptown", name: "The Exchange",
    description: "Where dirty money learns to talk clean.", q: -1, r: -1, repRequired: 250, baseRatePerHour: 210,
    image: "/underworld/tiles/uptown_exchange.png" },

  { id: "heights_skyline", districtId: "heights", name: "Skyline Plaza",
    description: "The view from the top of the food chain.", q: -1, r: 0, repRequired: 450, baseRatePerHour: 450,
    image: "/underworld/tiles/heights_skyline.png" },
  { id: "heights_club", districtId: "heights", name: "Private Club",
    description: "Membership by bloodline or by fear.", q: -2, r: 0, repRequired: 450, baseRatePerHour: 380,
    image: "/underworld/tiles/heights_club.png" },
  { id: "heights_boardroom", districtId: "heights", name: "The Boardroom",
    description: "Legitimate on paper. Nowhere else.", q: -2, r: 1, repRequired: 450, baseRatePerHour: 380,
    image: "/underworld/tiles/heights_boardroom.png" },
];

export const TERRITORY_SHIELD_MS = 10 * 60_000;
export const TERRITORY_ATTACK_COOLDOWN_MS = 5 * 60_000;
export const TERRITORY_DEFEND_COOLDOWN_MS = 10 * 60_000;
export const TERRITORY_MAX_GARRISON = 3;

// Bounty Board — place cash on a rival player's head, anyone can add to the
// pool, anyone can hunt it. The target doesn't "defend" by choice (unlike
// Territory garrisons) — their top operatives by Power auto-stand in, same
// combat math as Territory (garrisonPower + variance) so the two PvP systems
// feel consistent instead of inventing a second combat model.
export const BOUNTY_MIN_CONTRIBUTION = 100;
export const BOUNTY_DURATION_MS = 5 * 24 * 60 * 60 * 1000;
export const BOUNTY_HUNT_COOLDOWN_MS = 10 * 60_000;
export const BOUNTY_DEFEND_COOLDOWN_MS = 15 * 60_000;
export const BOUNTY_MAX_HUNT_CREW = 3;
export const BOUNTY_DEFENDER_COUNT = 3;

// Player-to-player Marketplace — operatives only (per the user's call: gear
// stays crafted-only for now), listed and sold in Cash, never real money.
export const MARKET_MIN_PRICE = 50;

// Pointy-top axial -> pixel center, for SVG hex rendering.
export function axialToPixel(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: size * (1.5 * r),
  };
}

// Total combat power of a garrison/attack crew — Power stat is primary,
// Muscle role gets a bonus since this is physical turf control.
export function garrisonPower(operatives: OperativeCard[]): number {
  return operatives.reduce((sum, op) => {
    const mult = op.role === "muscle" ? 1.15 : 1;
    return sum + effectiveStats(op).power * mult;
  }, 0);
}

// Randomized +/-15% swing applied at PvP resolution time (Territory attacks,
// Bounty hunts) so combat isn't pure stat-stacking — stats matter most, but
// it's not deterministic.
export function withVariance(power: number): number {
  return power * (0.85 + Math.random() * 0.3);
}

// In-game Store — tiered "packs" (a reference game sells these for real
// money; per the user's call, ours are cash-only, no payment processor,
// staying consistent with the "earned, never sold" design already settled
// for Product/Items). Each pack overrides the default recruit odds and can
// throw in a Scrap/Bullion bonus, which is what makes the pricier tiers feel
// distinct from just recruiting repeatedly.
export interface StorePackDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
  faction: Faction;
  rarityWeights: Partial<Record<Rarity, number>>;
  bonusScrap: number;
  bonusBullion: number;
}

// Same 3-tier cost/odds curve reused across all three factions — only the
// theming (name/description/art) changes per faction, so buying up through
// a faction's packs feels consistent regardless of which one you're into.
const PACK_TIER_ODDS: { rarityWeights: Partial<Record<Rarity, number>>; cost: number; bonusScrap: number; bonusBullion: number }[] = [
  { cost: 200, rarityWeights: { common: 45, uncommon: 32, rare: 15, epic: 6, legendary: 2 }, bonusScrap: 0, bonusBullion: 0 },
  { cost: 600, rarityWeights: { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 }, bonusScrap: 25, bonusBullion: 0 },
  { cost: 1500, rarityWeights: { rare: 45, epic: 40, legendary: 15 }, bonusScrap: 60, bonusBullion: 3 },
];

export const STORE_PACKS: StorePackDef[] = [
  {
    id: "rookie_pack",
    name: "Rookie Pack",
    image: "/underworld/packs/rookie_pack.png",
    description: "A cheap way to pad out the roster. Odds skew common. Guaranteed Outfit.",
    faction: "outfit",
    ...PACK_TIER_ODDS[0],
  },
  {
    id: "made_man_pack",
    name: "Made-Man Pack",
    image: "/underworld/packs/made_man_pack.png",
    description: "Better odds, a real shot at Epic — plus a handful of Scrap. Guaranteed Outfit.",
    faction: "outfit",
    ...PACK_TIER_ODDS[1],
  },
  {
    id: "racket_pack",
    name: "Racket Pack",
    image: "/underworld/packs/racket_pack.png",
    description: "No common, no uncommon — guaranteed Rare or better, plus Scrap and Bullion. Guaranteed Outfit.",
    faction: "outfit",
    ...PACK_TIER_ODDS[2],
  },
  {
    id: "corner_pack",
    name: "Corner Pack",
    image: "/underworld/packs/corner_pack.png",
    description: "A cheap way to pad out the roster. Odds skew common. Guaranteed Serpent Row.",
    faction: "serpent_row",
    ...PACK_TIER_ODDS[0],
  },
  {
    id: "block_pack",
    name: "Block Pack",
    image: "/underworld/packs/block_pack.png",
    description: "Better odds, a real shot at Epic — plus a handful of Scrap. Guaranteed Serpent Row.",
    faction: "serpent_row",
    ...PACK_TIER_ODDS[1],
  },
  {
    id: "kingpin_pack",
    name: "Kingpin Pack",
    image: "/underworld/packs/kingpin_pack.png",
    description: "No common, no uncommon — guaranteed Rare or better, plus Scrap and Bullion. Guaranteed Serpent Row.",
    faction: "serpent_row",
    ...PACK_TIER_ODDS[2],
  },
  {
    id: "prospect_pack",
    name: "Prospect Pack",
    image: "/underworld/packs/prospect_pack.png",
    description: "A cheap way to pad out the roster. Odds skew common. Guaranteed Iron Wolves.",
    faction: "iron_wolves",
    ...PACK_TIER_ODDS[0],
  },
  {
    id: "patch_pack",
    name: "Patch Pack",
    image: "/underworld/packs/patch_pack.png",
    description: "Better odds, a real shot at Epic — plus a handful of Scrap. Guaranteed Iron Wolves.",
    faction: "iron_wolves",
    ...PACK_TIER_ODDS[1],
  },
  {
    id: "road_captain_pack",
    name: "Road Captain Pack",
    image: "/underworld/packs/road_captain_pack.png",
    description: "No common, no uncommon — guaranteed Rare or better, plus Scrap and Bullion. Guaranteed Iron Wolves.",
    faction: "iron_wolves",
    ...PACK_TIER_ODDS[2],
  },
];

export const RECRUIT_COST = 150;
export const STARTER_CASH = 300;
export const PRICE_TICK_MS = 5 * 60_000;
export const SUPPORT_XP_SHARE = 0.6;
export const SUPPORT_HEAT_SHARE = 0.5;

// Deterministic pseudo-random in [0,1) from a string seed — used so every
// request in the same price tick gets the same market price without storing
// price state anywhere.
export function seededRandom(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function computeProductPrice(districtId: string, tierId: string, now: number): number {
  const district = DISTRICTS.find((d) => d.id === districtId);
  const tier = PRODUCT_TIERS.find((t) => t.id === tierId);
  if (!district || !tier) return 0;
  const tick = Math.floor(now / PRICE_TICK_MS);
  const r = seededRandom(`${districtId}:${tierId}:${tick}`);
  const swing = 1 + tier.volatility * (r * 2 - 1);
  return Math.max(1, Math.round(tier.basePrice * district.priceMultiplier * swing));
}

export function rollRarity(weights?: Partial<Record<Rarity, number>>): Rarity {
  // When an override is given, a rarity it omits is excluded (weight 0), not
  // defaulted back in — that's the whole point of a pack like Kingpin/Racket
  // advertising "no common, no uncommon." Only fall back to the full default
  // spread when no override object is passed at all (a plain recruit roll).
  const entries = (Object.keys(RARITIES) as Rarity[]).map(
    (id) => [id, weights ? weights[id] ?? 0 : RARITIES[id].weight] as const
  );
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [id, w] of entries) {
    if (roll < w) return id;
    roll -= w;
  }
  return "common";
}

export function rollRole(): Role {
  const roles = Object.keys(ROLES) as Role[];
  return roles[Math.floor(Math.random() * roles.length)];
}

// Rarity nudges the level roll up (not the trait selection — every operative
// draws from the same pool regardless of rarity) so higher-rarity pulls feel
// stronger without needing rarity-locked traits.
const TRAIT_RARITY_LEVEL_BONUS: Record<Rarity, number> = { common: 0, uncommon: 0, rare: 1, epic: 1, legendary: 2 };

export function rollTraits(rarity: Rarity): OperativeTraitInstance[] {
  const pool = (Object.keys(TRAITS) as TraitId[]).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const bonus = TRAIT_RARITY_LEVEL_BONUS[rarity];
  return pool.slice(0, TRAITS_PER_OPERATIVE).map((id) => ({
    id,
    level: Math.min(MAX_TRAIT_LEVEL, 1 + Math.floor(Math.random() * 3) + bonus),
  }));
}

export function traitLevel(op: OperativeCard, id: TraitId): number {
  return op.traits.find((t) => t.id === id)?.level ?? 0;
}

export function rollStats(role: Role, rarity: Rarity): Stats {
  const base = ROLES[role].base;
  const mult = RARITIES[rarity].statMult;
  const jitter = () => 0.9 + Math.random() * 0.2;
  return {
    power: Math.round(base.power * mult * jitter()),
    cunning: Math.round(base.cunning * mult * jitter()),
    charm: Math.round(base.charm * mult * jitter()),
    stealth: Math.round(base.stealth * mult * jitter()),
    nerve: Math.round(base.nerve * mult * jitter()),
  };
}

export function rollName(faction: Faction): string {
  const names = NAME_POOLS[FACTION_TYPE[faction]];
  const gender = Math.random() < 0.8 ? "m" : "f";
  const pool = names[gender];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Promotion ladder — adapted from a reference game's "Capo Dossier" (which
// tracks bounties/tournaments we don't have) onto systems this game actually
// has: territory combat, crew-of-2 jobs, sustained garrison time, and level.
export const RANK_ORDER: Rank[] = ["soldier", "captain", "lieutenant", "underboss", "boss"];

export const RANK_LABELS: Record<Rank, string> = {
  soldier: "Soldier",
  captain: "Captain",
  lieutenant: "Lieutenant",
  underboss: "Underboss",
  boss: "Boss",
};

export const PROMOTIONS: Record<Rank, { next: Rank | null; fee: number; requirement: string }> = {
  soldier: { next: "captain", fee: 500, requirement: "Win 1 territory attack" },
  captain: { next: "lieutenant", fee: 2000, requirement: "Complete 1 two-operative job" },
  lieutenant: { next: "underboss", fee: 6000, requirement: "Accumulate 3 days garrisoned on territory" },
  underboss: { next: "boss", fee: 15000, requirement: "Reach level 10" },
  boss: { next: null, fee: 0, requirement: "Top rank reached" },
};

export const GARRISON_HOLD_MILESTONE_MS = 3 * 24 * 60 * 60 * 1000;

export function meetsPromotionRequirement(op: OperativeCard): boolean {
  switch (op.rank) {
    case "soldier":
      return op.milestones.wonTerritoryAttack;
    case "captain":
      return op.milestones.completedCrewJob;
    case "lieutenant":
      return op.milestones.garrisonMsAccrued >= GARRISON_HOLD_MILESTONE_MS;
    case "underboss":
      return op.level >= 10;
    default:
      return false;
  }
}

// Training Ledger — free, not cash-based. Once per SKILL_POINTS_CYCLE_MS
// (24h) the player claims a flat batch of skill points and spends them
// however they like across any operative they own. Unspent points are NOT
// banked into the next cycle — sweep() zeroes them out once the cycle
// elapses, which is what makes this a login-progression hook rather than a
// slow-accumulating currency.
export const MAX_TRAINABLE_STAT = 20;
export const SKILL_POINTS_PER_CLAIM = 10;
export const SKILL_POINTS_CYCLE_MS = 24 * 60 * 60 * 1000;

export function levelForXp(xp: number): number {
  return 1 + Math.floor(xp / 100);
}

// Level bonus plus any equipped item's statBonus — item bonuses are derived
// from the equipped itemId at read time rather than baked into stored stats,
// same reasoning as the level bonus: never compound rounding error into the
// saved base stats, and equip/unequip never needs to rewrite `stats`.
export function effectiveStats(card: OperativeCard): Stats {
  const bonus = card.level - 1;
  const stats: Stats = {
    power: card.stats.power + bonus,
    cunning: card.stats.cunning + bonus,
    charm: card.stats.charm + bonus,
    stealth: card.stats.stealth + bonus,
    nerve: card.stats.nerve + bonus,
  };
  if (card.equipped) {
    for (const itemId of Object.values(card.equipped)) {
      if (!itemId) continue;
      const item = ITEMS.find((i) => i.id === itemId);
      if (!item) continue;
      stats.power += item.statBonus.power || 0;
      stats.cunning += item.statBonus.cunning || 0;
      stats.charm += item.statBonus.charm || 0;
      stats.stealth += item.statBonus.stealth || 0;
      stats.nerve += item.statBonus.nerve || 0;
    }
  }
  const factionBonus = FACTIONS[card.faction]?.statBonus;
  if (factionBonus) {
    stats.power += factionBonus.power || 0;
    stats.cunning += factionBonus.cunning || 0;
    stats.charm += factionBonus.charm || 0;
    stats.stealth += factionBonus.stealth || 0;
    stats.nerve += factionBonus.nerve || 0;
  }
  return stats;
}
