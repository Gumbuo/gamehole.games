import { NextRequest, NextResponse } from "next/server";
import type { BountyState } from "../../../underworld/types";
import { getRedis, resolveSessionWallet } from "../../../underworld/session";
import { loadSave, writeSave, sweep } from "../../../underworld/save";
import {
  BOUNTY_MIN_CONTRIBUTION,
  BOUNTY_DURATION_MS,
  BOUNTY_HUNT_COOLDOWN_MS,
  BOUNTY_DEFEND_COOLDOWN_MS,
  BOUNTY_MAX_HUNT_CREW,
  BOUNTY_DEFENDER_COUNT,
  garrisonPower,
  withVariance,
  effectiveStats,
} from "../../../underworld/data";

// Bounty Board is shared/global PvP state, same reasoning as Territory: any
// signed-in player's request can read or write another wallet's bounty (and
// a successful hunt writes to both the attacker's and the target's own
// PlayerSave in one request). Bounties target arbitrary wallets rather than
// a fixed set of tiles, so — unlike Territory's TERRITORY_TILES constant —
// we track which wallets currently have an open bounty in a Redis SET, so
// the board can be enumerated without scanning every possible wallet.

const BOUNTY_KEY = (wallet: string) => `underworld:bounty:${wallet}`;
const ACTIVE_SET_KEY = "underworld:bounty:active";

async function loadBounty(wallet: string): Promise<BountyState | null> {
  return (await getRedis().get<BountyState>(BOUNTY_KEY(wallet))) || null;
}

async function writeBounty(bounty: BountyState) {
  await getRedis().set(BOUNTY_KEY(bounty.targetWallet), bounty);
  await getRedis().sadd(ACTIVE_SET_KEY, bounty.targetWallet);
}

async function clearBounty(wallet: string) {
  await getRedis().del(BOUNTY_KEY(wallet));
  await getRedis().srem(ACTIVE_SET_KEY, wallet);
}

// Enumerates the board, lazily pruning anything expired. Expiry is checked
// here rather than via a cron job — the next person to list/contribute/hunt
// simply never sees a stale bounty, and it gets cleaned out of the set.
async function listActiveBounties(now: number): Promise<BountyState[]> {
  const wallets = await getRedis().smembers(ACTIVE_SET_KEY);
  if (wallets.length === 0) return [];
  const states = await getRedis().mget<(BountyState | null)[]>(...wallets.map(BOUNTY_KEY));
  const live: BountyState[] = [];
  const expired: string[] = [];
  wallets.forEach((wallet, i) => {
    const state = states[i];
    if (!state) {
      expired.push(wallet);
    } else if (state.expiresAt <= now) {
      expired.push(wallet);
    } else {
      live.push(state);
    }
  });
  if (expired.length > 0) {
    await Promise.all(expired.map((w) => clearBounty(w)));
  }
  return live;
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

    if (action === "listBounties") {
      const bounties = await listActiveBounties(now);
      return NextResponse.json({ success: true, bounties, now });
    }

    if (action === "contribute") {
      const { targetWallet, amount } = body;
      const contribution = Math.floor(Number(amount));
      if (!targetWallet || typeof targetWallet !== "string") {
        return NextResponse.json({ success: false, error: "Unknown target" }, { status: 400 });
      }
      if (targetWallet === userId) {
        return NextResponse.json({ success: false, error: "You can't put a bounty on yourself" }, { status: 400 });
      }
      if (!contribution || contribution < BOUNTY_MIN_CONTRIBUTION) {
        return NextResponse.json({ success: false, error: `Minimum contribution is $${BOUNTY_MIN_CONTRIBUTION}` }, { status: 400 });
      }

      const save = await loadSave(userId, now);
      sweep(save, now);
      if (save.cash < contribution) {
        return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
      }
      save.cash -= contribution;
      await writeSave(userId, save, now);

      const existing = await loadBounty(targetWallet);
      const bounty: BountyState =
        existing && existing.expiresAt > now
          ? { ...existing, pool: existing.pool + contribution, contributorCount: existing.contributorCount + 1 }
          : { targetWallet, pool: contribution, contributorCount: 1, placedAt: now, expiresAt: now + BOUNTY_DURATION_MS };
      await writeBounty(bounty);

      return NextResponse.json({ success: true, bounty, save });
    }

    if (action === "hunt") {
      const { targetWallet } = body;
      const rawIds = body.operativeIds;
      const operativeIds: string[] = Array.isArray(rawIds) ? rawIds : [];
      if (operativeIds.length < 1 || operativeIds.length > BOUNTY_MAX_HUNT_CREW) {
        return NextResponse.json({ success: false, error: `Hunt needs 1-${BOUNTY_MAX_HUNT_CREW} operatives` }, { status: 400 });
      }
      if (targetWallet === userId) {
        return NextResponse.json({ success: false, error: "You can't hunt your own bounty" }, { status: 400 });
      }
      const bounty = await loadBounty(targetWallet);
      if (!bounty || bounty.expiresAt <= now) {
        return NextResponse.json({ success: false, error: "No open bounty on that target" }, { status: 400 });
      }

      const attackerSave = await loadSave(userId, now);
      sweep(attackerSave, now);
      const crew = operativeIds.map((id) => attackerSave.operatives.find((o) => o.id === id));
      if (crew.some((o) => !o || o.status !== "idle") || new Set(operativeIds).size !== operativeIds.length) {
        return NextResponse.json({ success: false, error: "Every hunter must be idle" }, { status: 400 });
      }
      const attackers = crew as NonNullable<(typeof crew)[number]>[];

      const targetSave = await loadSave(targetWallet, now);
      sweep(targetSave, now);
      const defenders = [...targetSave.operatives]
        .sort((a, b) => effectiveStats(b).power - effectiveStats(a).power)
        .slice(0, BOUNTY_DEFENDER_COUNT);

      const attackerFinal = withVariance(garrisonPower(attackers));
      const defenderFinal = withVariance(garrisonPower(defenders));
      const won = attackerFinal > defenderFinal;

      if (won) {
        for (const op of attackers) {
          op.status = "injured";
          op.injuredUntil = now + BOUNTY_HUNT_COOLDOWN_MS;
        }
        attackerSave.cash += bounty.pool;
        attackerSave.heat = Math.min(100, attackerSave.heat + 8);
        await writeSave(userId, attackerSave, now);

        for (const op of targetSave.operatives) {
          if (defenders.some((d) => d.id === op.id)) {
            op.status = "injured";
            op.injuredUntil = now + BOUNTY_DEFEND_COOLDOWN_MS;
          }
        }
        await writeSave(targetWallet, targetSave, now);

        await clearBounty(targetWallet);
        return NextResponse.json({ success: true, won: true, collected: bounty.pool, save: attackerSave });
      } else {
        for (const op of attackers) {
          op.status = "injured";
          op.injuredUntil = now + BOUNTY_HUNT_COOLDOWN_MS;
        }
        await writeSave(userId, attackerSave, now);
        return NextResponse.json({ success: true, won: false, save: attackerSave });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Underworld bounty API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
