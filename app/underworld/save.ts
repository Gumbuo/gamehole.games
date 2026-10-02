import type { PlayerSave, OperativeCard } from "./types";
import { getRedis } from "./session";
import { DISTRICTS, STARTER_CASH, STARTER_BENCH_COUNT, SKILL_POINTS_CYCLE_MS, rollStats, rollFaction, rollName, rollPortraitIndex, normalizeOperativeName, rollTraits, TRAITS_PER_OPERATIVE } from "./data";
import type { TraitId } from "./data";

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
  const faction = rollFaction();
  const name = rollName(faction);
  return {
    id: crypto.randomUUID(),
    templateId: `${role}_${rarity}`,
    rarity,
    role,
    faction,
    name,
    portraitIndex: rollPortraitIndex(name, faction),
    traits: rollTraits(rarity),
    level: 1,
    xp: 0,
    stats: rollStats(role, rarity),
    status: "idle",
    rank: "soldier",
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
    skillPoints: 0,
    skillPointsClaimedAt: 0,
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
  if (save.skillPoints === undefined) save.skillPoints = 0;
  if (save.skillPointsClaimedAt === undefined) save.skillPointsClaimedAt = 0;
  // Unspent skill points don't carry over — this IS the "log in daily or
  // lose them" mechanic, not an edge case. Once a full cycle has elapsed
  // since the last claim, whatever's left is forfeited; the player becomes
  // claim-eligible again at exactly the same moment (claimSkillPoints in
  // route.ts checks this same `now - skillPointsClaimedAt >= cycle` gate).
  if (now - save.skillPointsClaimedAt >= SKILL_POINTS_CYCLE_MS) {
    save.skillPoints = 0;
  }
  for (const op of save.operatives) {
    if (op.status === "injured" && op.injuredUntil && op.injuredUntil <= now) {
      op.status = "idle";
      op.injuredUntil = undefined;
    }
    if (!op.rank) op.rank = "soldier";
    if (!op.faction) op.faction = rollFaction();
    // Legacy names (from before NAME_POOLS was trimmed to 3-per-slot) get
    // folded into the current pool here — same guarantee new recruits get,
    // per explicit user direction to rename rather than leave old operatives
    // as a permanent exception. rollPortraitIndex is fully deterministic
    // (name/faction position lookup, no randomness) — safe, and necessary,
    // to recompute every load rather than only backfilling when missing,
    // so a stale index from before either of these fixes gets corrected.
    op.name = normalizeOperativeName(op.name, op.faction);
    op.portraitIndex = rollPortraitIndex(op.name, op.faction);
    if (!op.milestones) {
      op.milestones = { wonTerritoryAttack: false, completedCrewJob: false, garrisonMsAccrued: 0 };
    }
    if (!op.traits || op.traits.length === 0) {
      // Migrate the old single boolean `trait` field (pre multi-trait rework)
      // into the new array — keep it as a level-3 (mid) instance rather than
      // discarding it, then fill remaining slots fresh.
      const legacyTrait = (op as unknown as { trait?: TraitId }).trait;
      const rolled = rollTraits(op.rarity);
      op.traits = legacyTrait
        ? [{ id: legacyTrait, level: 3 }, ...rolled.filter((t) => t.id !== legacyTrait)].slice(0, TRAITS_PER_OPERATIVE)
        : rolled;
    }
  }
}
