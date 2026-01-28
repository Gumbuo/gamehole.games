import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { ArmorySaveState } from "../../../components/armory/types";
import { getItem } from "../../../components/armory/data/items";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/sell - Sell items for Gold
export async function POST(request: NextRequest) {
  try {
    const { wallet, itemId, quantity } = await request.json();

    if (!wallet || !itemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const saveKey = getSaveKey(wallet);
    const saveState = await kv.get<ArmorySaveState>(saveKey);

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

    const totalGoldEarned = item.sellValue * quantity;

    // Remove items from inventory
    inventorySlot.quantity -= quantity;
    if (inventorySlot.quantity <= 0) {
      saveState.inventory = saveState.inventory.filter(
        (slot) => slot.itemId !== itemId
      );
    }

    // Add gold to player balance
    saveState.gold = (saveState.gold || 0) + totalGoldEarned;

    // Update progress
    saveState.progress.totalGoldEarned = (saveState.progress.totalGoldEarned || 0) + totalGoldEarned;
    saveState.lastUpdated = Date.now();

    await kv.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        sold: { itemId, itemName: item.name, quantity },
        goldEarned: totalGoldEarned,
        newGoldBalance: saveState.gold,
        inventory: saveState.inventory,
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
