import { NextRequest, NextResponse } from "next/server";
import { ArmorySaveState, StationId } from "../../../base/components/armory/types";
import { STATIONS } from "../../../base/components/armory/data/stations";
import { BLUEPRINTS, isBuildComplete, makeEmptyBuildGrid } from "../../../base/components/armory/data/blueprints";
import { getRedis } from "../../lib/points";

const SAVE_KEY_PREFIX = "armory:save:";

function getSaveKey(wallet: string): string {
  return `${SAVE_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// POST /api/armory/build — place a resource into a station build slot
export async function POST(request: NextRequest) {
  try {
    const { wallet, stationId, row, col } = await request.json();

    if (!wallet || !stationId || row === undefined || col === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!(stationId in STATIONS)) {
      return NextResponse.json({ success: false, error: "Invalid station" }, { status: 400 });
    }

    const typedStationId = stationId as StationId;
    const blueprint = BLUEPRINTS[typedStationId];

    // Validate row/col
    if (row < 0 || row > 3 || col < 0 || col > 3) {
      return NextResponse.json({ success: false, error: "Invalid slot position" }, { status: 400 });
    }

    const requiredResource = blueprint.grid[row][col];
    if (!requiredResource) {
      return NextResponse.json({ success: false, error: "This slot is not part of the blueprint" }, { status: 400 });
    }

    const redis = getRedis();
    const saveKey = getSaveKey(wallet);
    const saveState = await redis.get<ArmorySaveState>(saveKey);

    if (!saveState) {
      return NextResponse.json({ success: false, error: "Armory save not found" }, { status: 404 });
    }

    // Station must be unbuilt (level 0)
    if (saveState.stationLevels[typedStationId] > 0) {
      return NextResponse.json({ success: false, error: "Station is already built" }, { status: 400 });
    }

    // Ensure stationBuilds exists (migration for old saves)
    if (!saveState.stationBuilds) {
      saveState.stationBuilds = {
        plasmaRefinery: makeEmptyBuildGrid(),
        voidForge: makeEmptyBuildGrid(),
        bioLab: makeEmptyBuildGrid(),
        quantumChamber: makeEmptyBuildGrid(),
        assemblyBay: makeEmptyBuildGrid(),
      };
    }
    if (!saveState.stationBuilds[typedStationId]) {
      saveState.stationBuilds[typedStationId] = makeEmptyBuildGrid();
    }

    const buildGrid = saveState.stationBuilds[typedStationId];

    // Check slot not already filled
    if (buildGrid[row]?.[col]) {
      return NextResponse.json({ success: false, error: "Slot already filled" }, { status: 400 });
    }

    // Check player has the required resource
    const resourceAmount = saveState.resources[requiredResource as keyof typeof saveState.resources] as number;
    if (resourceAmount < 1) {
      return NextResponse.json({
        success: false,
        error: `You need 1x ${requiredResource} to place in this slot`,
      });
    }

    // Consume resource
    (saveState.resources as Record<string, number>)[requiredResource] = resourceAmount - 1;

    // Fill slot
    if (!buildGrid[row]) buildGrid[row] = Array(4).fill(false);
    buildGrid[row][col] = true;

    // Check if build is complete
    const complete = isBuildComplete(blueprint, buildGrid);
    if (complete) {
      saveState.stationLevels[typedStationId] = 1;
    }

    saveState.lastUpdated = Date.now();
    await redis.set(saveKey, saveState);

    return NextResponse.json({
      success: true,
      data: {
        stationId: typedStationId,
        row,
        col,
        resourcePlaced: requiredResource,
        buildComplete: complete,
        stationBuilds: saveState.stationBuilds,
        stationLevels: saveState.stationLevels,
        resources: saveState.resources,
      },
    });
  } catch (error) {
    console.error("Error placing build resource:", error);
    return NextResponse.json(
      { success: false, error: "Failed to place resource", details: String(error) },
      { status: 500 }
    );
  }
}
