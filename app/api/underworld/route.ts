import { NextRequest, NextResponse } from "next/server";
import type { PlayerSave, OperativeCard, EquippedItems, Rarity } from "../../underworld/types";
import { resolveSessionWallet } from "../../underworld/session";
import { loadSave, writeSave, sweep } from "../../underworld/save";
import {
  DISTRICTS,
  JOBS,
  RACKETS,
  PRODUCT_TIERS,
  ITEMS,
  RECRUIT_COST,
  SUPPORT_XP_SHARE,
  SUPPORT_HEAT_SHARE,
  computeProductPrice,
  rollRarity,
  rollRole,
  rollTraits,
  traitLevel,
  rollStats,
  rollName,
  rollPortraitIndex,
  levelForXp,
  effectiveStats,
  PROMOTIONS,
  meetsPromotionRequirement,
  MAX_TRAINABLE_STAT,
  SKILL_POINTS_PER_CLAIM,
  SKILL_POINTS_CYCLE_MS,
  RARITIES,
  EQUIPMENT_RECIPES,
  FORGE_TIERS,
  RARITY_ORDER,
  craftedItemId,
  STARTER_BENCH_COUNT,
  MAX_BENCH_COUNT,
  BENCH_UNLOCK_COSTS,
  STORE_PACKS,
  rollFaction,
} from "../../underworld/data";
import type { Stats } from "../../underworld/types";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function buildMarket(now: number) {
  const market: Record<string, Record<string, number>> = {};
  for (const d of DISTRICTS) {
    market[d.id] = {};
    for (const t of PRODUCT_TIERS) {
      market[d.id][t.id] = computeProductPrice(d.id, t.id, now);
    }
  }
  return market;
}

function itemQty(save: PlayerSave, itemId: string): number {
  return save.items.find((i) => i.itemId === itemId)?.quantity || 0;
}

function addItemQty(save: PlayerSave, itemId: string, delta: number) {
  const stack = save.items.find((i) => i.itemId === itemId);
  if (stack) {
    stack.quantity += delta;
    if (stack.quantity <= 0) save.items = save.items.filter((i) => i.itemId !== itemId);
  } else if (delta > 0) {
    save.items.push({ itemId, quantity: delta });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveSessionWallet(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }
    const body = await request.json();
    const { action } = body;

    const now = Date.now();
    const save = await loadSave(userId, now);
    sweep(save, now);

    switch (action) {
      case "getState": {
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "recruit": {
        if (save.cash < RECRUIT_COST) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        const rarity = rollRarity();
        const role = rollRole();
        const traits = rollTraits(rarity);
        const recruitFaction = rollFaction();
        const recruitName = rollName(recruitFaction);
        const card: OperativeCard = {
          id: crypto.randomUUID(),
          templateId: `${role}_${rarity}`,
          rarity,
          role,
          faction: recruitFaction,
          name: recruitName,
          portraitIndex: rollPortraitIndex(recruitName, recruitFaction),
          traits,
          level: 1,
          xp: 0,
          stats: rollStats(role, rarity),
          status: "idle",
          rank: "soldier",
          milestones: { wonTerritoryAttack: false, completedCrewJob: false, garrisonMsAccrued: 0 },
        };
        save.cash -= RECRUIT_COST;
        save.operatives.push(card);
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, recruited: card, market: buildMarket(now), now });
      }

      case "buyPack": {
        const { packId } = body;
        const pack = STORE_PACKS.find((p) => p.id === packId);
        if (!pack) {
          return NextResponse.json({ success: false, error: "Unknown pack" }, { status: 400 });
        }
        if (save.cash < pack.cost) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        const rarity = rollRarity(pack.rarityWeights);
        const role = rollRole();
        const traits = rollTraits(rarity);
        const packName = rollName(pack.faction);
        const card: OperativeCard = {
          id: crypto.randomUUID(),
          templateId: `${role}_${rarity}`,
          rarity,
          role,
          faction: pack.faction,
          name: packName,
          portraitIndex: rollPortraitIndex(packName, pack.faction),
          traits,
          level: 1,
          xp: 0,
          stats: rollStats(role, rarity),
          status: "idle",
          rank: "soldier",
          milestones: { wonTerritoryAttack: false, completedCrewJob: false, garrisonMsAccrued: 0 },
        };
        save.cash -= pack.cost;
        save.scrap += pack.bonusScrap;
        save.bullion += pack.bonusBullion;
        save.operatives.push(card);
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, recruited: card, market: buildMarket(now), now });
      }

      case "startJob": {
        const rawIds: unknown = body.operativeIds ?? (body.operativeId ? [body.operativeId] : []);
        const operativeIds: string[] = Array.isArray(rawIds) ? rawIds : [];
        const { jobId } = body;
        const job = JOBS.find((j) => j.id === jobId);
        if (!job) {
          return NextResponse.json({ success: false, error: "Unknown job" }, { status: 400 });
        }
        if (operativeIds.length !== job.crewSize || new Set(operativeIds).size !== operativeIds.length) {
          return NextResponse.json({ success: false, error: `This job needs ${job.crewSize} operative(s)` }, { status: 400 });
        }
        const crew = operativeIds.map((id) => save.operatives.find((o) => o.id === id));
        if (crew.some((o) => !o || o.status !== "idle")) {
          return NextResponse.json({ success: false, error: "Every crew member must be idle" }, { status: 400 });
        }
        const district = DISTRICTS.find((d) => d.id === job.districtId)!;
        if (save.reputation < district.repRequired) {
          return NextResponse.json({ success: false, error: "District not unlocked" }, { status: 400 });
        }

        const members = crew as OperativeCard[];
        const statBonuses = members.map((op) => (effectiveStats(op)[job.stat] - job.statReq) * 0.02);
        const bestStatBonus = Math.max(...statBonuses);
        const roleBonus = members.some((op) => op.role === job.roleBonus) ? 0.1 : 0;
        const crewSynergy = job.crewSize === 2 ? 0.05 : 0;
        const traitChanceDelta = members.reduce((sum, op) => {
          return sum + traitLevel(op, "quick_hands") * 0.02 - traitLevel(op, "cautious") * 0.02;
        }, 0);
        const chance = clamp(
          job.baseSuccessChance + bestStatBonus + roleBonus + crewSynergy + traitChanceDelta,
          0.05,
          0.97
        );
        const success = Math.random() < chance;

        members.forEach((op, idx) => {
          const isLeader = idx === 0;
          const share = isLeader ? 1 : SUPPORT_XP_SHARE;
          const heatShare = isLeader ? 1 : SUPPORT_HEAT_SHARE;

          const cashMult = success ? 1 + traitLevel(op, "night_owl") * 0.03 : 1;
          const cashMult2 = success ? 1 + traitLevel(op, "greedy") * 0.05 : 1;
          const repMult = success ? 1 + traitLevel(op, "silver_tongue") * 0.03 : 1;
          const xpMult = 1 + traitLevel(op, "fast_learner") * 0.04;
          let heatMult = 1;
          if (!success) heatMult *= 1 - traitLevel(op, "loyal") * 0.1;
          heatMult *= 1 - traitLevel(op, "ice_cold") * 0.04;
          heatMult *= 1 - traitLevel(op, "cautious") * 0.04;
          heatMult *= 1 + traitLevel(op, "greedy") * 0.05;

          op.status = "on_job";
          op.jobId = job.id;
          op.jobEndsAt = now + job.durationMs;
          op.isJobLeader = isLeader;
          op.pendingReward = success
            ? {
                success: true,
                cash: isLeader ? Math.round(job.cashReward * cashMult * cashMult2) : 0,
                xp: Math.round(job.xpReward * share * xpMult),
                reputation: isLeader ? Math.round(job.repReward * repMult) : 0,
                heatDelta: Math.round(job.heatGain * heatShare * heatMult),
              }
            : {
                success: false,
                cash: 0,
                xp: Math.round(job.xpReward * 0.25 * share * xpMult),
                reputation: 0,
                heatDelta: Math.round(job.failHeatGain * heatShare * heatMult),
              };
        });

        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "collectJob": {
        const { operativeId } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        if (!op || op.status !== "on_job" || !op.pendingReward || !op.jobEndsAt) {
          return NextResponse.json({ success: false, error: "No job to collect" }, { status: 400 });
        }
        if (now < op.jobEndsAt) {
          return NextResponse.json({ success: false, error: "Job still in progress" }, { status: 400 });
        }
        const job = JOBS.find((j) => j.id === op.jobId);
        const reward = op.pendingReward;
        save.cash += reward.cash;
        save.reputation += reward.reputation;
        save.heat = clamp(save.heat + reward.heatDelta, 0, 100);
        if (reward.success && reward.cash > 0) {
          save.scrap += Math.max(1, Math.round(reward.cash / 40));
        }
        op.xp += reward.xp;
        op.level = levelForXp(op.xp);

        const avoidsInjury = Math.random() < traitLevel(op, "iron_will") * 0.2;
        if (reward.success || avoidsInjury) {
          op.status = "idle";
        } else {
          op.status = "injured";
          op.injuredUntil = now + (job ? job.durationMs : 60_000);
        }
        if (reward.success && job && job.crewSize === 2) {
          op.milestones.completedCrewJob = true;
        }
        op.jobId = undefined;
        op.jobEndsAt = undefined;
        op.pendingReward = undefined;
        op.isJobLeader = undefined;

        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, reward, market: buildMarket(now), now });
      }

      case "collectAllJobs": {
        let totalCash = 0;
        let totalRep = 0;
        let collectedCount = 0;
        for (const op of save.operatives) {
          if (op.status !== "on_job" || !op.pendingReward || !op.jobEndsAt || now < op.jobEndsAt) continue;
          const job = JOBS.find((j) => j.id === op.jobId);
          const reward = op.pendingReward;
          save.cash += reward.cash;
          save.reputation += reward.reputation;
          save.heat = clamp(save.heat + reward.heatDelta, 0, 100);
          if (reward.success && reward.cash > 0) {
            save.scrap += Math.max(1, Math.round(reward.cash / 40));
          }
          totalCash += reward.cash;
          totalRep += reward.reputation;
          op.xp += reward.xp;
          op.level = levelForXp(op.xp);
          const avoidsInjury = Math.random() < traitLevel(op, "iron_will") * 0.2;
          if (reward.success || avoidsInjury) {
            op.status = "idle";
          } else {
            op.status = "injured";
            op.injuredUntil = now + (job ? job.durationMs : 60_000);
          }
          if (reward.success && job && job.crewSize === 2) {
            op.milestones.completedCrewJob = true;
          }
          op.jobId = undefined;
          op.jobEndsAt = undefined;
          op.pendingReward = undefined;
          op.isJobLeader = undefined;
          collectedCount++;
        }
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, collectedCount, totalCash, totalRep, market: buildMarket(now), now });
      }

      case "trade": {
        const { districtId, tierId, side, qty } = body;
        const district = DISTRICTS.find((d) => d.id === districtId);
        const tier = PRODUCT_TIERS.find((t) => t.id === tierId);
        const quantity = Math.floor(Number(qty));
        if (!district || !tier || !quantity || quantity <= 0) {
          return NextResponse.json({ success: false, error: "Invalid trade" }, { status: 400 });
        }
        if (save.reputation < district.repRequired) {
          return NextResponse.json({ success: false, error: "District not unlocked" }, { status: 400 });
        }
        const price = computeProductPrice(districtId, tierId, now);
        const held = save.product[tierId] || 0;

        if (side === "buy") {
          const cost = price * quantity;
          if (save.cash < cost) {
            return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
          }
          save.cash -= cost;
          save.product[tierId] = held + quantity;
          save.heat = clamp(save.heat + Math.max(1, Math.round(quantity / 10)), 0, 100);
        } else if (side === "sell") {
          if (held < quantity) {
            return NextResponse.json({ success: false, error: "Not enough product" }, { status: 400 });
          }
          save.cash += price * quantity;
          save.product[tierId] = held - quantity;
          save.heat = clamp(save.heat + Math.max(1, Math.round(quantity / 8)), 0, 100);
        } else {
          return NextResponse.json({ success: false, error: "Invalid side" }, { status: 400 });
        }

        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "buyRacket": {
        const { racketId } = body;
        const def = RACKETS.find((r) => r.id === racketId);
        if (!def) {
          return NextResponse.json({ success: false, error: "Unknown racket" }, { status: 400 });
        }
        if (save.rackets.some((r) => r.id === racketId)) {
          return NextResponse.json({ success: false, error: "Already owned" }, { status: 400 });
        }
        const district = DISTRICTS.find((d) => d.id === def.districtId)!;
        if (save.reputation < district.repRequired || save.reputation < def.repRequired) {
          return NextResponse.json({ success: false, error: "Reputation too low" }, { status: 400 });
        }
        if (save.cash < def.baseCost) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        save.cash -= def.baseCost;
        save.rackets.push({ id: racketId, level: 1, lastCollectedAt: now });
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "collectRacket": {
        const { racketId } = body;
        const state = save.rackets.find((r) => r.id === racketId);
        const def = RACKETS.find((r) => r.id === racketId);
        if (!state || !def) {
          return NextResponse.json({ success: false, error: "Racket not owned" }, { status: 400 });
        }
        const elapsedHours = Math.min(24, (now - state.lastCollectedAt) / 3_600_000);
        const rate = def.baseRatePerHour * Math.pow(1.5, state.level - 1);
        const income = Math.round(rate * elapsedHours);
        save.cash += income;
        state.lastCollectedAt = now;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, collected: income, market: buildMarket(now), now });
      }

      case "upgradeRacket": {
        const { racketId } = body;
        const state = save.rackets.find((r) => r.id === racketId);
        const def = RACKETS.find((r) => r.id === racketId);
        if (!state || !def) {
          return NextResponse.json({ success: false, error: "Racket not owned" }, { status: 400 });
        }
        const cost = Math.round(def.baseCost * Math.pow(2, state.level));
        if (save.cash < cost) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        save.cash -= cost;
        state.level += 1;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "startCraft": {
        const { benchId, recipeId, tier } = body;
        const bench = save.craftingBenches.find((b) => b.id === benchId);
        const recipe = EQUIPMENT_RECIPES.find((r) => r.id === recipeId);
        const ft = FORGE_TIERS[tier as Rarity];
        if (!bench || !recipe || !ft) {
          return NextResponse.json({ success: false, error: "Unknown bench, recipe, or tier" }, { status: 400 });
        }
        if (bench.job) {
          return NextResponse.json({ success: false, error: "Bench is already working" }, { status: 400 });
        }
        if (save.cash < ft.cashCost || save.scrap < ft.scrapCost || save.bullion < ft.bullionCost) {
          return NextResponse.json({ success: false, error: "Not enough resources" }, { status: 400 });
        }
        if (ft.prereqTier) {
          const prereqId = craftedItemId(recipeId, ft.prereqTier);
          if (itemQty(save, prereqId) < ft.prereqQty) {
            return NextResponse.json({ success: false, error: `Need ${ft.prereqQty}x ${RARITIES[ft.prereqTier].label} ${recipe.name}` }, { status: 400 });
          }
          addItemQty(save, prereqId, -ft.prereqQty);
        }
        save.cash -= ft.cashCost;
        save.scrap -= ft.scrapCost;
        save.bullion -= ft.bullionCost;
        bench.job = { recipeId, tier, startedAt: now, endsAt: now + ft.benchMs };
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "collectCraft": {
        const { benchId } = body;
        const bench = save.craftingBenches.find((b) => b.id === benchId);
        if (!bench || !bench.job) {
          return NextResponse.json({ success: false, error: "Nothing to collect" }, { status: 400 });
        }
        if (now < bench.job.endsAt) {
          return NextResponse.json({ success: false, error: "Still on the bench" }, { status: 400 });
        }
        const { recipeId, tier } = bench.job;
        const ft = FORGE_TIERS[tier];
        let finalTier = tier;
        const tierIdx = RARITY_ORDER.indexOf(tier);
        if (ft.bonusUpgradeChance > 0 && tierIdx < RARITY_ORDER.length - 1 && Math.random() < ft.bonusUpgradeChance) {
          finalTier = RARITY_ORDER[tierIdx + 1];
        }
        const itemId = craftedItemId(recipeId, finalTier);
        addItemQty(save, itemId, 1);
        bench.job = null;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, crafted: { itemId, tier: finalTier, upgraded: finalTier !== tier }, market: buildMarket(now), now });
      }

      case "unlockBench": {
        const nextIndex = save.craftingBenches.length;
        const costIdx = nextIndex - STARTER_BENCH_COUNT;
        if (nextIndex >= MAX_BENCH_COUNT || costIdx < 0 || costIdx >= BENCH_UNLOCK_COSTS.length) {
          return NextResponse.json({ success: false, error: "All benches unlocked" }, { status: 400 });
        }
        const cost = BENCH_UNLOCK_COSTS[costIdx];
        if (save.cash < cost) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        save.cash -= cost;
        save.craftingBenches.push({ id: `bench_${nextIndex + 1}`, job: null });
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "equipItem": {
        const { operativeId, itemId } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        const def = ITEMS.find((i) => i.id === itemId);
        if (!op || !def) {
          return NextResponse.json({ success: false, error: "Unknown operative or item" }, { status: 400 });
        }
        if (itemQty(save, itemId) < 1) {
          return NextResponse.json({ success: false, error: "You don't own that item" }, { status: 400 });
        }
        op.equipped = op.equipped || {};
        const slot = def.kind as keyof EquippedItems;
        const previous = op.equipped[slot];
        if (previous) addItemQty(save, previous, 1);
        op.equipped[slot] = itemId;
        addItemQty(save, itemId, -1);
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "unequipItem": {
        const { operativeId, slot } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        if (!op || !op.equipped) {
          return NextResponse.json({ success: false, error: "Nothing equipped" }, { status: 400 });
        }
        const key = slot as keyof EquippedItems;
        const current = op.equipped[key];
        if (!current) {
          return NextResponse.json({ success: false, error: "Nothing equipped in that slot" }, { status: 400 });
        }
        addItemQty(save, current, 1);
        op.equipped[key] = undefined;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "claimSkillPoints": {
        if (now - save.skillPointsClaimedAt < SKILL_POINTS_CYCLE_MS) {
          const msLeft = SKILL_POINTS_CYCLE_MS - (now - save.skillPointsClaimedAt);
          return NextResponse.json({ success: false, error: "Already claimed — come back later", msUntilNextClaim: msLeft }, { status: 400 });
        }
        save.skillPoints = SKILL_POINTS_PER_CLAIM;
        save.skillPointsClaimedAt = now;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "trainStat": {
        const { operativeId, stat } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        const validStats: (keyof Stats)[] = ["power", "cunning", "charm", "stealth", "nerve"];
        if (!op || !validStats.includes(stat)) {
          return NextResponse.json({ success: false, error: "Unknown operative or stat" }, { status: 400 });
        }
        if (op.status !== "idle") {
          return NextResponse.json({ success: false, error: "Operative must be idle to train" }, { status: 400 });
        }
        const key = stat as keyof Stats;
        const current = op.stats[key];
        if (current >= MAX_TRAINABLE_STAT) {
          return NextResponse.json({ success: false, error: "Stat is already maxed" }, { status: 400 });
        }
        if (save.skillPoints < 1) {
          return NextResponse.json({ success: false, error: "No skill points — claim your daily batch first" }, { status: 400 });
        }
        save.skillPoints -= 1;
        op.stats[key] = current + 1;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "promote": {
        const { operativeId } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        if (!op) {
          return NextResponse.json({ success: false, error: "Unknown operative" }, { status: 400 });
        }
        const promo = PROMOTIONS[op.rank];
        if (!promo.next) {
          return NextResponse.json({ success: false, error: "Already at the top rank" }, { status: 400 });
        }
        if (!meetsPromotionRequirement(op)) {
          return NextResponse.json({ success: false, error: `Requirement not met: ${promo.requirement}` }, { status: 400 });
        }
        if (save.cash < promo.fee) {
          return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
        }
        save.cash -= promo.fee;
        op.rank = promo.next;
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      case "setFieldNote": {
        const { operativeId, note } = body;
        const op = save.operatives.find((o) => o.id === operativeId);
        if (!op) {
          return NextResponse.json({ success: false, error: "Unknown operative" }, { status: 400 });
        }
        op.fieldNote = String(note ?? "").slice(0, 200);
        await writeSave(userId, save, now);
        return NextResponse.json({ success: true, save, market: buildMarket(now), now });
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Underworld API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
