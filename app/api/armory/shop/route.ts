import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { ArmorySaveState, RawResourceKey } from "../../../components/armory/types";
import { MATERIAL_COSTS } from "../../../components/armory/constants";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/shop - Purchase raw materials with Gold
export async function POST(request: NextRequest) {
  try {
    const { wallet, resourceId, quantity } = await request.json();

    if (!wallet || !resourceId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate resource type
    if (!(resourceId in MATERIAL_COSTS)) {
      return NextResponse.json(
        { success: false, error: "Invalid resource type" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);
    const saveState = await kv.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found. Start the game first." },
        { status: 404 }
      );
    }

    const unitCost = MATERIAL_COSTS[resourceId as RawResourceKey];
    const totalCost = unitCost * quantity;

    // Check gold balance
    if ((saveState.gold || 0) < totalCost) {
      return NextResponse.json({
        success: false,
        error: `Insufficient Gold. Need ${totalCost}G, have ${saveState.gold || 0}G`,
      });
    }

    // Deduct gold and add resources
    saveState.gold = (saveState.gold || 0) - totalCost;
    const typedResourceId = resourceId as RawResourceKey;
    saveState.resources[typedResourceId] =
      (saveState.resources[typedResourceId] || 0) + quantity;
    saveState.progress.totalGoldSpent = (saveState.progress.totalGoldSpent || 0) + totalCost;
    saveState.lastUpdated = Date.now();

    await kv.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        resources: saveState.resources,
        goldSpent: totalCost,
        newGoldBalance: saveState.gold,
        purchased: { resourceId, quantity },
      },
    });
  } catch (error) {
    console.error("Error in armory shop:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process purchase", details: String(error) },
      { status: 500 }
    );
  }
}
