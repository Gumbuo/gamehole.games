import type { PlayerSave, OperativeCard } from "./types";
import { getRedis } from "./session";
import { DISTRICTS, STARTER_CASH, STARTER_BENCH_COUNT, rollStats, rollFaction } from "./data";

// Shared PlayerSave load/write, used by both app/api/underworld/route.ts
// (a player acting on their own save) and app/api/underworld/territory/route.ts
// (which needs to read/write OTHER players' saves too, for PvP combat
// resolution). Not a route file — see session.ts for why this lives here.

const STORAGE_KEY_PREFIX = "gumbuo:game_storage:";
const SAVE_FILE = "underworld_save";

function saveKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}:${SAVE_FILE}`;
}

function makeStarterOperative(): OperativeCard {
  const role = "muscle" as const;
  const rarity = "common" as const;
  return {
    id: crypto.randomUUID(),
    templateId: `${role}_${rarity}`,
    rarity,
    role,
    faction: rollFaction(),
    name: "Vinny",
    level: 1,
    xp: 0,
    stats: rollStats(role, rarity),
    status: "idle",
    rank: "soldier",
    trainedToday: 0,
    trainedResetAt: 0,
    milestones: { wonTerritoryAttack: false, completedCrewJob: false, garrisonMsAccrued: 0 },
  };
}

export function defaultSave(userId: string, now: number): PlayerSave {
  return {
    userId,
    walletAddress: userId,
    cash: STARTER_CASH,
    scrap: 0,
    bullion: 0,
    reputation: 0,
    heat: 0,
    operatives: [makeStarterOperative()],
    items: [],
    product: {},
    rackets: [],
    craftingBenches: Array.from({ length: STARTER_BENCH_COUNT }, (_, i) => ({ id: `bench_${i + 1}`, job: null })),
    unlockedDistricts: ["southside"],
    createdAt: now,
    updatedAt: now,
  };
}

export async function loadSave(userId: string, now: number): Promise<PlayerSave> {
  const data = await getRedis().get<PlayerSave>(saveKey(userId));
  return data || defaultSave(userId, now);
}

export async function writeSave(userId: string, save: PlayerSave, now: number) {
  save.updatedAt = now;
  save.unlockedDistricts = DISTRICTS.filter((d) => save.reputation >= d.repRequired).map((d) => d.id);
  await getRedis().set(saveKey(userId), save);
}

// Clears expired injuries. Does NOT clear garrisoned status — that's only
// ever ended by an explicit recall or a lost defense, both handled in the
// territory route, not by time passing. Also backfills fields added after
// some saves were already written (rank/training/milestones) so the rest of
// the codebase can assume every operative has them.
export function sweep(save: PlayerSave, now: number) {
  if (save.scrap === undefined) save.scrap = 0;
  if (save.bullion === undefined) save.bullion = 0;
  if (!save.craftingBenches) {
    save.craftingBenches = Array.from({ length: STARTER_BENCH_COUNT }, (_, i) => ({ id: `bench_${i + 1}`, job: null }));
  }
  for (const op of save.operatives) {
    if (op.status === "injured" && op.injuredUntil && op.injuredUntil <= now) {
      op.status = "idle";
      op.injuredUntil = undefined;
    }
    if (!op.rank) op.rank = "soldier";
    if (!op.faction) op.faction = rollFaction();
    if (op.trainedToday === undefined) op.trainedToday = 0;
    if (op.trainedResetAt === undefined) op.trainedResetAt = 0;
    if (!op.milestones) {
      op.milestones = { wonTerritoryAttack: false, completedCrewJob: false, garrisonMsAccrued: 0 };
    }
  }
}
