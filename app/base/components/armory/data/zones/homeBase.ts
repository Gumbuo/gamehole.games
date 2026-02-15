import { ZoneDef } from '../../engine/types';

// 37 tiles wide x 28 tiles tall at 32px = 1184x896
const W = 37;
const H = 28;

// Build collision grid
// 0 = floor, 1 = wall
function makeGrid(): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < H; row++) {
    const line: number[] = [];
    for (let col = 0; col < W; col++) {
      // Border walls
      if (row === 0 || row === H - 1 || col === 0 || col === W - 1) {
        line.push(1);
      }
      // Interior wall structures - central partition with opening
      else if (row === 14 && col >= 8 && col <= 14) {
        line.push(1);
      } else if (row === 14 && col >= 20 && col <= 28) {
        line.push(1);
      }
      // Upper left room walls
      else if (col === 8 && row >= 1 && row <= 10) {
        line.push(1);
      } else if (row === 10 && col >= 1 && col <= 5) {
        line.push(1);
      }
      // Storage alcove (bottom left)
      else if (row === 20 && col >= 1 && col <= 6) {
        line.push(1);
      } else if (col === 6 && row >= 20 && row <= 24) {
        line.push(1);
      }
      // Right side structure
      else if (col === 30 && row >= 4 && row <= 12) {
        line.push(1);
      } else if (row === 4 && col >= 30 && col <= 35) {
        line.push(1);
      }
      else {
        line.push(0);
      }
    }
    grid.push(line);
  }

  // Open doorways
  // Door in upper-left room wall (col 8, row 6-7)
  grid[6][8] = 0;
  grid[7][8] = 0;
  // Door in central partition (row 14, col 16-18)
  grid[14][16] = 0;
  grid[14][17] = 0;
  grid[14][18] = 0;
  // Door in storage alcove (row 20, col 3-4)
  grid[20][3] = 0;
  grid[20][4] = 0;
  // Door in right structure (col 30, row 8-9)
  grid[8][30] = 0;
  grid[9][30] = 0;

  // East exit opening (right border, rows 12-15)
  grid[12][W - 1] = 0;
  grid[13][W - 1] = 0;
  grid[14][W - 1] = 0;
  grid[15][W - 1] = 0;

  // South exit opening (bottom border, cols 16-19)
  grid[H - 1][16] = 0;
  grid[H - 1][17] = 0;
  grid[H - 1][18] = 0;
  grid[H - 1][19] = 0;

  return grid;
}

export const homeBase: ZoneDef = {
  id: 'homeBase',
  name: 'HOME BASE',
  width: W * 32,
  height: H * 32,
  tileSize: 32,
  colors: {
    floor: '#12141a',
    floorAlt: '#141620',
    wall: '#1c2030',
    accent: '#66fcf1',
    ambient: '#0a0a0f',
  },
  collisionGrid: makeGrid(),
  stations: [
    {
      stationId: 'plasmaRefinery',
      x: 4 * 32 + 16,   // Upper-left room
      y: 5 * 32 + 16,
      interactionRadius: 48,
    },
    {
      stationId: 'assemblyBay',
      x: 22 * 32 + 16,  // Center-right
      y: 8 * 32 + 16,
      interactionRadius: 48,
    },
  ],
  exits: [
    {
      id: 'east-to-caverns',
      targetZone: 'crystalCaverns',
      targetSpawnId: 'from-homeBase',
      x: (W - 1) * 32,
      y: 12 * 32,
      width: 32,
      height: 4 * 32,
      label: 'Crystal Caverns',
      requiredLevel: 1,
    },
    {
      id: 'south-to-swamp',
      targetZone: 'bioSwamp',
      targetSpawnId: 'from-homeBase',
      x: 16 * 32,
      y: (H - 1) * 32,
      width: 4 * 32,
      height: 32,
      label: 'Bio Swamp',
      requiredLevel: 3,
    },
  ],
  decorations: [
    // Pipes along upper wall
    { type: 'pipe', x: 2 * 32, y: 1 * 32, width: 5 * 32, height: 6, color: '#2a3045' },
    { type: 'pipe', x: 10 * 32, y: 1 * 32, width: 8 * 32, height: 6, color: '#2a3045' },
    // Lights in refinery room
    { type: 'light', x: 4 * 32, y: 3 * 32, width: 12, height: 12, color: 'rgba(102, 252, 241, 0.4)' },
    // Lights in main hall
    { type: 'light', x: 18 * 32, y: 8 * 32, width: 14, height: 14, color: 'rgba(102, 252, 241, 0.3)' },
    { type: 'light', x: 12 * 32, y: 20 * 32, width: 14, height: 14, color: 'rgba(69, 162, 158, 0.3)' },
    // Structure blocks (consoles/crates)
    { type: 'structure', x: 2 * 32, y: 22 * 32, width: 28, height: 28, color: '#1a2636' },
    { type: 'structure', x: 3 * 32, y: 22 * 32, width: 28, height: 28, color: '#1a2636' },
    { type: 'structure', x: 32 * 32, y: 6 * 32, width: 48, height: 32, color: '#1a2636' },
    // Rocks near exits
    { type: 'rock', x: 34 * 32, y: 11 * 32, width: 20, height: 16, color: '#2a3040' },
    { type: 'rock', x: 15 * 32, y: 25 * 32, width: 18, height: 14, color: '#2a3040' },
  ],
  spawns: [
    { id: 'default', x: 15 * 32, y: 10 * 32 },
    { id: 'from-crystalCaverns', x: 34 * 32, y: 13 * 32 },
    { id: 'from-bioSwamp', x: 17 * 32, y: 25 * 32 },
  ],
  requiredLevel: 1,
};
