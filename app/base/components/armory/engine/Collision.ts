import { ZoneDef, ZoneStation, ZoneExit } from './types';
import { StationId } from '../types';

const PLAYER_RADIUS = 12;

export function canMoveTo(x: number, y: number, zone: ZoneDef): boolean {
  const ts = zone.tileSize;
  // Check 4 corners of player bounding box
  const offsets = [
    { x: -PLAYER_RADIUS, y: -PLAYER_RADIUS },
    { x: PLAYER_RADIUS, y: -PLAYER_RADIUS },
    { x: -PLAYER_RADIUS, y: PLAYER_RADIUS },
    { x: PLAYER_RADIUS, y: PLAYER_RADIUS },
  ];

  for (const off of offsets) {
    const tx = Math.floor((x + off.x) / ts);
    const ty = Math.floor((y + off.y) / ts);

    // Out of bounds = wall
    if (tx < 0 || ty < 0 || ty >= zone.collisionGrid.length || tx >= zone.collisionGrid[0].length) {
      return false;
    }

    if (zone.collisionGrid[ty][tx] === 1) {
      return false;
    }
  }

  return true;
}

export function getNearStation(
  px: number,
  py: number,
  stations: ZoneStation[]
): StationId | null {
  for (const s of stations) {
    const dx = px - s.x;
    const dy = py - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= s.interactionRadius) {
      return s.stationId;
    }
  }
  return null;
}

export function getNearExit(
  px: number,
  py: number,
  exits: ZoneExit[]
): ZoneExit | null {
  for (const e of exits) {
    if (
      px >= e.x &&
      px <= e.x + e.width &&
      py >= e.y &&
      py <= e.y + e.height
    ) {
      return e;
    }
  }
  return null;
}
