import { NextRequest, NextResponse } from "next/server";
import { ArmorySaveState, RawResourceKey } from "../../../base/components/armory/types";
import { getRedis } from "../../lib/points";
import { makeEmptyBuildGrid } from "../../../base/components/armory/data/blueprints";

const SAVE_KEY_PREFIX = "armory:save:";
const VALID_RAW: Set<string> = new Set([
  "plasmaOre", "voidCrystal", "bioMetal", "quantumDust", "nebulaEssence",
]);
// Max drop per call to prevent abuse
const MAX_DROP = 5;

function getSaveKey(wallet: string) {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/drop — add raw resources earned in-game (enemy kills)
export async function POST(request: NextRequest) {
  try {
    const { wallet, resource, quantity } = await request.json();

    if (!wallet || !resource || !quantity) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }
    if (!VALID_RAW.has(resource)) {
      return NextResponse.json({ success: false, error: "Invalid resource" }, { status: 400 });
    }
    const qty = Math.min(Math.max(1, Math.floor(quantity)), MAX_DROP);

    const redis = getRedis();
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json({ success: false, error: "Armory save not found" }, { status: 404 });
    }

    // Ensure stationBuilds exists
    if (!saveState.stationBuilds) {
      saveState.stationBuilds = {
        plasmaRefinery: makeEmptyBuildGrid(),
        voidForge: makeEmptyBuildGrid(),
        bioLab: makeEmptyBuildGrid(),
        quantumChamber: makeEmptyBuildGrid(),
        assemblyBay: makeEmptyBuildGrid(),
      };
    }

    const key = resource as RawResourceKey;
    const current = (saveState.resources[key] as number) || 0;
    (saveState.resources as Record<string, number>)[key] = current + qty;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        resource,
        quantity: qty,
        newTotal: saveState.resources[key],
        resources: saveState.resources,
      },
    });
  } catch (error) {
    console.error("Drop error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add resource", details: String(error) },
      { status: 500 }
    );
  }
}
