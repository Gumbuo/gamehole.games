import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { ArmorySaveState, StationId } from "../../../components/armory/types";
import { STATIONS, getUpgradeCost, isStationUnlocked } from "../../../components/armory/data/stations";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/upgrade - Upgrade a station with Gold
export async function POST(request: NextRequest) {
  try {
    const { wallet, stationId } = await request.json();

    if (!wallet || !stationId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate station ID
    if (!(stationId in STATIONS)) {
      return NextResponse.json(
        { success: false, error: "Invalid station" },
        { status: 400 }
      );
    }

    const typedStationId = stationId as StationId;
    const saveKey = getSaveKey(wallet);
    const saveState = await kv.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json(
        { success: false, error: "Armory save not found" },
        { status: 404 }
      );
    }

    const station = STATIONS[typedStationId];
    const currentLevel = saveState.stationLevels[typedStationId];

    // Check if station is unlocked
    if (currentLevel === 0) {
      // Check if player level is high enough to unlock
      if (!isStationUnlocked(typedStationId, saveState.progress.level)) {
        return NextResponse.json({
          success: false,
          error: `Station unlocks at level ${station.unlockLevel}`,
        });
      }
      // If player level is high enough but station is still 0, auto-unlock
      saveState.stationLevels[typedStationId] = 1;
      saveState.lastUpdated = Date.now();
      await kv.set(saveKey, saveState);

      return NextResponse.json({
        success: true,
        data: {
          stationId: typedStationId,
          newLevel: 1,
          stationLevels: saveState.stationLevels,
          message: "Station unlocked!",
        },
      });
    }

    // Check if already max level
    if (currentLevel >= station.maxLevel) {
      return NextResponse.json({
        success: false,
        error: "Station is already max level",
      });
    }

    // Get upgrade cost
    const upgradeCost = getUpgradeCost(typedStationId, currentLevel);
    if (upgradeCost === null) {
      return NextResponse.json({
        success: false,
        error: "Cannot upgrade further",
      });
    }

    // Check gold balance
    if ((saveState.gold || 0) < upgradeCost) {
      return NextResponse.json({
        success: false,
        error: `Insufficient Gold. Need ${upgradeCost}G, have ${saveState.gold || 0}G`,
      });
    }

    // Deduct gold
    saveState.gold = (saveState.gold || 0) - upgradeCost;

    // Upgrade station
    saveState.stationLevels[typedStationId] = currentLevel + 1;
    saveState.progress.totalGoldSpent = (saveState.progress.totalGoldSpent || 0) + upgradeCost;
    saveState.lastUpdated = Date.now();

    await kv.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        stationId: typedStationId,
        newLevel: currentLevel + 1,
        goldSpent: upgradeCost,
        newGoldBalance: saveState.gold,
        stationLevels: saveState.stationLevels,
      },
    });
  } catch (error) {
    console.error("Error upgrading station:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upgrade station", details: String(error) },
      { status: 500 }
    );
  }
}
