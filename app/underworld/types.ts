export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type Role = "muscle" | "driver" | "fixer" | "runner" | "consigliere";
export type OperativeStatus = "idle" | "on_job" | "injured" | "garrisoned";
export type Rank = "soldier" | "captain" | "lieutenant" | "underboss" | "boss";
// Original fictional factions (not real-world organizations) covering the
// mafia-family / street-gang / biker-club variety the user wanted.
export type Faction = "outfit" | "serpent_row" | "iron_wolves";

export interface OperativeMilestones {
  wonTerritoryAttack: boolean;
  completedCrewJob: boolean;
  garrisonMsAccrued: number;
}

export interface Stats {
  power: number;
  cunning: number;
  charm: number;
  stealth: number;
  nerve: number;
}

export interface EquippedItems {
  headwear?: string;
  torso?: string;
  hands?: string;
  footwear?: string;
}

export interface CraftingJob {
  recipeId: string;
  tier: Rarity;
  startedAt: number;
  endsAt: number;
}

export interface CraftingBenchState {
  id: string;
  job: CraftingJob | null;
}

export interface OperativeCard {
  id: string;
  templateId: string;
  rarity: Rarity;
  role: Role;
  faction: Faction;
  name: string;
  trait?: string;
  level: number;
  xp: number;
  stats: Stats;
  equipped?: EquippedItems;
  status: OperativeStatus;
  jobId?: string;
  jobEndsAt?: number;
  isJobLeader?: boolean;
  pendingReward?: {
    success: boolean;
    cash: number;
    xp: number;
    reputation: number;
    heatDelta: number;
  };
  injuredUntil?: number;
  garrisonTileId?: string;
  rank: Rank;
  fieldNote?: string;
  trainedToday: number;
  trainedResetAt: number;
  milestones: OperativeMilestones;
}

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface RacketState {
  id: string;
  level: number;
  lastCollectedAt: number;
}

// Shared/global state — NOT part of any single PlayerSave. One record per
// hex tile, read/written by any player's requests (territory is PvP).
export interface TerritoryTileState {
  id: string;
  controlledBy: string | null; // wallet address, or null if unclaimed
  garrisonOperativeIds: string[];
  garrisonPower: number;
  shieldUntil: number;
  lastCollectedAt: number;
}

// Shared/global state — one record per targeted wallet, not part of any
// single PlayerSave (same reasoning as TerritoryTileState: any player's
// request can read/write it, since bounty-hunting is cross-account PvP).
export interface BountyState {
  targetWallet: string;
  pool: number;
  contributorCount: number;
  placedAt: number;
  expiresAt: number;
}

// Shared/global state — one record per active listing. The listed operative
// is a full snapshot removed from the seller's own `operatives` (see the
// market route) rather than referenced by id, so a sale is a clean transfer
// with no risk of the seller using/training/equipping it while listed.
export interface MarketListing {
  id: string;
  sellerWallet: string;
  operative: OperativeCard;
  price: number;
  listedAt: number;
}

export interface PlayerSave {
  userId: string;
  walletAddress: string | null;
  cash: number;
  scrap: number;
  bullion: number;
  reputation: number;
  heat: number;
  operatives: OperativeCard[];
  items: ItemStack[];
  product: Record<string, number>;
  rackets: RacketState[];
  craftingBenches: CraftingBenchState[];
  unlockedDistricts: string[];
  createdAt: number;
  updatedAt: number;
}
