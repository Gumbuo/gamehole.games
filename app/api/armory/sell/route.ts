import { NextRequest, NextResponse } from "next/server";
import { ArmorySaveState } from "../../../base/components/armory/types";
import { getItem } from "../../../base/components/armory/data/items";
import { getRedis, addUserPoints } from "../../lib/points";
import { addPlayerXP } from "../../lib/playerLevel";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/sell - Sell items for AP
export async function POST(request: NextRequest) {
  try {
    const { wallet, itemId, quantity } = await request.json();

    if (!wallet || !itemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const normalizedWallet = wallet.toLowerCase();
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    // Find item in inventory
    const inventorySlot = saveState.inventory.find(
      (slot) => slot.itemId === itemId
    );

    if (!inventorySlot || inventorySlot.quantity < quantity) {
      return NextResponse.json({
        success: false,
        error: `Insufficient items. Have ${inventorySlot?.quantity || 0}, need ${quantity}`,
      });
    }

    // Get item definition for sell value
    const item = getItem(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Invalid item" },
        { status: 400 }
      );
    }

    const totalAPEarned = item.sellValue * quantity;

    // Remove items from inventory
    inventorySlot.quantity -= quantity;
    if (inventorySlot.quantity <= 0) {
      saveState.inventory = saveState.inventory.filter(
        (slot) => slot.itemId !== itemId
      );
    }

    // Add AP to user balance (individual key)
    const newBalance = await addUserPoints(normalizedWallet, totalAPEarned);

    // Update progress
    saveState.progress.totalAPEarned += totalAPEarned;
    saveState.lastUpdated = Date.now();

    await redis.set(saveKey, saveState);

    // Award player XP for selling (3 XP per item sold)
    const playerXP = quantity * 3;
    const playerXPResult = await addPlayerXP(wallet, playerXP, "sell");

    return NextResponse.json({
      success: true,
      data: {
        sold: { itemId, itemName: item.name, quantity },
        apEarned: totalAPEarned,
        newAPBalance: newBalance,
        inventory: saveState.inventory,
        playerLevel: {
          level: playerXPResult.levelData.level,
          xp: playerXPResult.levelData.xp,
          xpAdded: playerXPResult.xpAdded,
          levelsGained: playerXPResult.levelsGained,
          apRewarded: playerXPResult.apRewarded,
        },
      },
    });
  } catch (error) {
    console.error("Error selling item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sell item", details: String(error) },
      { status: 500 }
    );
  }
}
