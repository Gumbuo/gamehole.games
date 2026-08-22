import type { Rarity, Role, Stats, OperativeCard, Rank, Faction } from "./types";

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

// Original fictional factions — not real organizations. Each operative
// belongs to one; it's mostly flavor (a small stat bonus, like a trait) so
// it doesn't overshadow Role/Rarity as the main build levers.
export const FACTIONS: Record<Faction, { label: string; description: string; color: string; statBonus: Partial<Stats> }> = {
  outfit: {
    label: "The Outfit",
    description: "Old-money organized crime. Discipline, connections, and a long memory.",
    color: "#d4af37",
    statBonus: { charm: 1 },
  },
  serpent_row: {
    label: "Serpent Row",
    description: "Street-level crew running the block. Fast, loyal to the corner, vicious when crossed.",
    color: "#ef4444",
    statBonus: { stealth: 1 },
  },
  iron_wolves: {
    label: "Iron Wolves MC",
    description: "Outlaw motorcycle club. Muscle on two wheels, brotherhood over everything.",
    color: "#60a5fa",
    statBonus: { power: 1 },
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

export const NAME_POOL = [
  "Vinny", "Sal", "Tony", "Frankie", "Nicky", "Joey", "Dutch", "Sammy",
  "Lucky", "Mickey", "Rosa", "Gia", "Bianca", "Carmine", "Enzo",
  "Tommy Two-Times", "Fat Paulie", "Slick Rick", "Doc", "Cutter",
  "Angie", "Rico", "Big Al", "Lefty", "Marco", "Sonny", "Benny",
  "Little Nicky", "Fingers", "Ziti", "Maria", "Donnie", "Jimmy Legs",
  "Tuxedo Sam", "Cristina", "Whistler", "Knuckles", "Pauly Walnuts",
];

// PixelLab portraits — every NAME_POOL entry now has one; falls back to a
// plain rarity-colored placeholder in the UI for any name not in here.
export const CHARACTER_PORTRAITS: Record<string, string> = {
  "Vinny": "/underworld/characters/vinny.png",
  "Sal": "/underworld/characters/sal.png",
  "Tony": "/underworld/characters/tony.png",
  "Frankie": "/underworld/characters/frankie.png",
  "Nicky": "/underworld/characters/nicky.png",
  "Joey": "/underworld/characters/joey.png",
  "Dutch": "/underworld/characters/dutch.png",
  "Sammy": "/underworld/characters/sammy.png",
  "Lucky": "/underworld/characters/lucky.png",
  "Mickey": "/underworld/characters/mickey.png",
  "Rosa": "/underworld/characters/rosa.png",
  "Gia": "/underworld/characters/gia.png",
  "Bianca": "/underworld/characters/bianca.png",
  "Carmine": "/underworld/characters/carmine.png",
  "Enzo": "/underworld/characters/enzo.png",
  "Tommy Two-Times": "/underworld/characters/tommy_two_times.png",
  "Fat Paulie": "/underworld/characters/fat_paulie.png",
  "Slick Rick": "/underworld/characters/slick_rick.png",
  "Doc": "/underworld/characters/doc.png",
  "Cutter": "/underworld/characters/cutter.png",
  "Angie": "/underworld/characters/angie.png",
  "Rico": "/underworld/characters/rico.png",
  "Big Al": "/underworld/characters/big_al.png",
  "Lefty": "/underworld/characters/lefty.png",
  "Marco": "/underworld/characters/marco.png",
  "Sonny": "/underworld/characters/sonny.png",
  "Benny": "/underworld/characters/benny.png",
  "Little Nicky": "/underworld/characters/little_nicky.png",
  "Fingers": "/underworld/characters/fingers.png",
  "Ziti": "/underworld/characters/ziti.png",
  "Maria": "/underworld/characters/maria.png",
  "Donnie": "/underworld/characters/donnie.png",
  "Jimmy Legs": "/underworld/characters/jimmy_legs.png",
  "Tuxedo Sam": "/underworld/characters/tuxedo_sam.png",
  "Cristina": "/underworld/characters/cristina.png",
  "Whistler": "/underworld/characters/whistler.png",
  "Knuckles": "/underworld/characters/knuckles.png",
  "Pauly Walnuts": "/underworld/characters/pauly_walnuts.png",
};

export type TraitId =
  | "night_owl" | "loyal" | "silver_tongue" | "quick_hands"
  | "ice_cold" | "fast_learner" | "greedy" | "cautious" | "iron_will";

export const TRAITS: Record<TraitId, { label: string; description: string }> = {
  night_owl: { label: "Night Owl", description: "+15% cash on completed Jobs." },
  loyal: { label: "Loyal", description: "Heat gain from failed Jobs cut in half." },
  silver_tongue: { label: "Silver Tongue", description: "+15% Reputation from Jobs." },
  quick_hands: { label: "Quick Hands", description: "+10% Job success chance." },
  ice_cold: { label: "Ice Cold", description: "20% less Heat from every Job, win or lose." },
  fast_learner: { label: "Fast Learner", description: "+20% XP from Jobs." },
  greedy: { label: "Greedy", description: "+25% cash from Jobs — but +25% Heat too." },
  cautious: { label: "Cautious", description: "20% less Heat from Jobs — but -10% success chance." },
  iron_will: { label: "Iron Will", description: "Never gets Injured on a failed Job." },
};

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
}

export interface EquipmentRecipe {
  id: string;
  name: string;
  kind: ItemKind;
  stat: keyof Stats;
  description: string;
}

export const EQUIPMENT_RECIPES: EquipmentRecipe[] = [
  { id: "fedora", name: "Fedora", kind: "headwear", stat: "charm", description: "Eyes on the prize." },
  { id: "ski_mask", name: "Ski Mask", kind: "headwear", stat: "stealth", description: "Nobody's getting a good look at you." },
  { id: "pinstripe_vest", name: "Pinstripe Vest", kind: "torso", stat: "charm", description: "Tailored to intimidate." },
  { id: "kevlar_vest", name: "Kevlar Vest", kind: "torso", stat: "power", description: "Insurance you can wear." },
  { id: "brass_knux", name: "Brass Knuckles", kind: "hands", stat: "power", description: "Old-school persuasion." },
  { id: "leather_gloves", name: "Leather Gloves", kind: "hands", stat: "cunning", description: "No prints, no problem." },
  { id: "wingtips", name: "Wingtips", kind: "footwear", stat: "charm", description: "Walks into any room like he owns it." },
  { id: "getaway_boots", name: "Getaway Boots", kind: "footwear", stat: "stealth", description: "Built for a quick exit." },
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
  const entries = (Object.keys(RARITIES) as Rarity[]).map((id) => [id, weights?.[id] ?? RARITIES[id].weight] as const);
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

export function rollTrait(): TraitId | undefined {
  if (Math.random() > 0.35) return undefined;
  const traits = Object.keys(TRAITS) as TraitId[];
  return traits[Math.floor(Math.random() * traits.length)];
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

export function rollName(): string {
  return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)];
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

// Training Ledger — spend cash to permanently raise a base stat, capped and
// rate-limited so it's a meaningful sink, not a free grind.
export const MAX_TRAINABLE_STAT = 20;
export const DAILY_TRAIN_LIMIT = 18;
export const TRAIN_RESET_MS = 24 * 60 * 60 * 1000;

export function trainCost(currentValue: number): number {
  return 40 + currentValue * 12;
}

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
