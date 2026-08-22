import { NextRequest, NextResponse } from "next/server";
import type { TerritoryTileState } from "../../../underworld/types";
import { getRedis, resolveSessionWallet } from "../../../underworld/session";
import { loadSave, writeSave, sweep } from "../../../underworld/save";
import {
  TERRITORY_TILES,
  TERRITORY_SHIELD_MS,
  TERRITORY_ATTACK_COOLDOWN_MS,
  TERRITORY_DEFEND_COOLDOWN_MS,
  TERRITORY_MAX_GARRISON,
  DISTRICTS,
  garrisonPower,
  withVariance,
} from "../../../underworld/data";

// Territory is shared/global PvP state — a tile's record can be read or
// written by ANY signed-in player's request (that's the whole point:
// attacking someone else's tile means resolving combat and writing to
// BOTH the attacker's and the defender's own PlayerSave in one request).

const TILE_KEY = (id: string) => `underworld:territory:${id}`;

function defaultTile(id: string, now: number): TerritoryTileState {
  return { id, controlledBy: null, garrisonOperativeIds: [], garrisonPower: 0, shieldUntil: 0, lastCollectedAt: now };
}

async function loadTile(id: string, now: number): Promise<TerritoryTileState> {
  const data = await getRedis().get<TerritoryTileState>(TILE_KEY(id));
  return data || defaultTile(id, now);
}

async function writeTile(tile: TerritoryTileState) {
  await getRedis().set(TILE_KEY(tile.id), tile);
}

function tileRepRequirement(tileId: string): number {
  const def = TERRITORY_TILES.find((t) => t.id === tileId);
  if (!def) return Infinity;
  if (def.districtId === null) return def.repRequired;
  const district = DISTRICTS.find((d) => d.id === def.districtId);
  return Math.max(def.repRequired, district?.repRequired ?? 0);
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

    if (action === "getTerritory") {
      const keys = TERRITORY_TILES.map((t) => TILE_KEY(t.id));
      const results = await getRedis().mget<(TerritoryTileState | null)[]>(...keys);
      const tiles = TERRITORY_TILES.map((def, i) => results[i] || defaultTile(def.id, now));
      return NextResponse.json({ success: true, tiles, now });
    }

    const { tileId } = body;
    const tileDef = TERRITORY_TILES.find((t) => t.id === tileId);
    if (!tileDef) {
      return NextResponse.json({ success: false, error: "Unknown tile" }, { status: 400 });
    }

    if (action === "garrison") {
      const rawIds = body.operativeIds;
      const operativeIds: string[] = Array.isArray(rawIds) ? rawIds : [];
      if (operativeIds.length < 1 || operativeIds.length > TERRITORY_MAX_GARRISON) {
        return NextResponse.json({ success: false, error: `Garrison needs 1-${TERRITORY_MAX_GARRISON} operatives` }, { status: 400 });
      }

      const save = await loadSave(userId, now);
      sweep(save, now);
      if (save.reputation < tileRepRequirement(tileId)) {
        return NextResponse.json({ success: false, error: "Reputation too low for this tile" }, { status: 400 });
      }

      const tile = await loadTile(tileId, now);
      if (tile.controlledBy && tile.controlledBy !== userId) {
        return NextResponse.json({ success: false, error: "Someone else controls this tile — attack instead" }, { status: 400 });
      }

      const crew = operativeIds.map((id) => save.operatives.find((o) => o.id === id));
      if (crew.some((o) => !o || o.status !== "idle") || new Set(operativeIds).size !== operativeIds.length) {
        return NextResponse.json({ success: false, error: "Every operative must be idle" }, { status: 400 });
      }

      // Free up any previous garrison of this SAME tile by this SAME player
      // (re-garrisoning replaces your crew rather than stacking).
      for (const op of save.operatives) {
        if (op.garrisonTileId === tileId) {
          op.status = "idle";
          op.garrisonTileId = undefined;
        }
      }

      const wasUnclaimed = !tile.controlledBy;
      for (const op of crew as NonNullable<(typeof crew)[number]>[]) {
        op.status = "garrisoned";
        op.garrisonTileId = tileId;
      }

      tile.controlledBy = userId;
      tile.garrisonOperativeIds = operativeIds;
      tile.garrisonPower = garrisonPower(crew as NonNullable<(typeof crew)[number]>[]);
      tile.shieldUntil = now + TERRITORY_SHIELD_MS;
      if (wasUnclaimed) tile.lastCollectedAt = now;

      await writeSave(userId, save, now);
      await writeTile(tile);
      return NextResponse.json({ success: true, tile, save });
    }

    if (action === "attack") {
      const rawIds = body.operativeIds;
      const operativeIds: string[] = Array.isArray(rawIds) ? rawIds : [];
      if (operativeIds.length < 1 || operativeIds.length > TERRITORY_MAX_GARRISON) {
        return NextResponse.json({ success: false, error: `Attack needs 1-${TERRITORY_MAX_GARRISON} operatives` }, { status: 400 });
      }

      const attackerSave = await loadSave(userId, now);
      sweep(attackerSave, now);
      if (attackerSave.reputation < tileRepRequirement(tileId)) {
        return NextResponse.json({ success: false, error: "Reputation too low for this tile" }, { status: 400 });
      }

      const tile = await loadTile(tileId, now);
      if (!tile.controlledBy) {
        return NextResponse.json({ success: false, error: "Tile is unclaimed — garrison it instead" }, { status: 400 });
      }
      if (tile.controlledBy === userId) {
        return NextResponse.json({ success: false, error: "You already control this tile" }, { status: 400 });
      }
      if (now < tile.shieldUntil) {
        return NextResponse.json({ success: false, error: "This tile is shielded — try again later" }, { status: 400 });
      }

      const crew = operativeIds.map((id) => attackerSave.operatives.find((o) => o.id === id));
      if (crew.some((o) => !o || o.status !== "idle") || new Set(operativeIds).size !== operativeIds.length) {
        return NextResponse.json({ success: false, error: "Every attacker must be idle" }, { status: 400 });
      }
      const attackers = crew as NonNullable<(typeof crew)[number]>[];
      const attackerBasePower = garrisonPower(attackers);
      const attackerFinal = withVariance(attackerBasePower);
      const defenderFinal = withVariance(tile.garrisonPower);
      const won = attackerFinal > defenderFinal;

      if (won) {
        const defenderId = tile.controlledBy;
        const defenderSave = await loadSave(defenderId, now);
        sweep(defenderSave, now);
        for (const op of defenderSave.operatives) {
          if (tile.garrisonOperativeIds.includes(op.id)) {
            op.milestones.garrisonMsAccrued += now - tile.lastCollectedAt;
            op.status = "injured";
            op.injuredUntil = now + TERRITORY_DEFEND_COOLDOWN_MS;
            op.garrisonTileId = undefined;
          }
        }
        await writeSave(defenderId, defenderSave, now);

        for (const op of attackers) {
          op.status = "garrisoned";
          op.garrisonTileId = tileId;
          op.milestones.wonTerritoryAttack = true;
        }
        await writeSave(userId, attackerSave, now);

        tile.controlledBy = userId;
        tile.garrisonOperativeIds = operativeIds;
        tile.garrisonPower = attackerBasePower;
        tile.shieldUntil = now + TERRITORY_SHIELD_MS;
        tile.lastCollectedAt = now;
        await writeTile(tile);

        return NextResponse.json({ success: true, won: true, tile, save: attackerSave });
      } else {
        for (const op of attackers) {
          op.status = "injured";
          op.injuredUntil = now + TERRITORY_ATTACK_COOLDOWN_MS;
        }
        await writeSave(userId, attackerSave, now);
        return NextResponse.json({ success: true, won: false, tile, save: attackerSave });
      }
    }

    if (action === "recall") {
      const tile = await loadTile(tileId, now);
      if (tile.controlledBy !== userId) {
        return NextResponse.json({ success: false, error: "You don't control this tile" }, { status: 400 });
      }
      const save = await loadSave(userId, now);
      sweep(save, now);
      for (const op of save.operatives) {
        if (op.garrisonTileId === tileId) {
          op.milestones.garrisonMsAccrued += now - tile.lastCollectedAt;
          op.status = "idle";
          op.garrisonTileId = undefined;
        }
      }
      await writeSave(userId, save, now);

      tile.controlledBy = null;
      tile.garrisonOperativeIds = [];
      tile.garrisonPower = 0;
      tile.shieldUntil = 0;
      await writeTile(tile);
      return NextResponse.json({ success: true, tile, save });
    }

    if (action === "collectTerritory") {
      const tile = await loadTile(tileId, now);
      if (tile.controlledBy !== userId) {
        return NextResponse.json({ success: false, error: "You don't control this tile" }, { status: 400 });
      }
      const elapsedHours = Math.min(24, (now - tile.lastCollectedAt) / 3_600_000);
      const income = Math.round(tileDef.baseRatePerHour * elapsedHours);

      const save = await loadSave(userId, now);
      sweep(save, now);
      save.cash += income;
      let bullionGained = 0;
      if (Math.random() < 0.2) {
        bullionGained = 1;
        save.bullion += bullionGained;
      }
      for (const op of save.operatives) {
        if (tile.garrisonOperativeIds.includes(op.id)) {
          op.milestones.garrisonMsAccrued += now - tile.lastCollectedAt;
        }
      }
      await writeSave(userId, save, now);

      tile.lastCollectedAt = now;
      await writeTile(tile);
      return NextResponse.json({ success: true, collected: income, bullionGained, tile, save });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Underworld territory API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
