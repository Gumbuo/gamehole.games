import { ZoneDef } from '../../engine/types';

// 31 tiles wide x 25 tiles tall at 32px = 992x800
const W = 31;
const H = 25;

function makeGrid(): number[][] {
  const grid: number[][] = [];
  for (let row = 0; row < H; row++) {
    const line: number[] = [];
    for (let col = 0; col < W; col++) {
      // Border walls
      if (row === 0 || row === H - 1 || col === 0 || col === W - 1) {
        line.push(1);
      }
      // Narrow cave passages - top area walls
      else if (row === 6 && col >= 6 && col <= 12) {
        line.push(1);
      } else if (row === 6 && col >= 18 && col <= 24) {
        line.push(1);
      }
      // Central crystal formation (large rock mass)
      else if (row >= 10 && row <= 14 && col >= 13 && col <= 17) {
        line.push(1);
      }
      // Side cave walls
      else if (col === 6 && row >= 10 && row <= 18) {
        line.push(1);
      } else if (col === 24 && row >= 10 && row <= 18) {
        line.push(1);
      }
      // Bottom passage narrowing
      else if (row === 19 && col >= 10 && col <= 12) {
        line.push(1);
      } else if (row === 19 && col >= 18 && col <= 20) {
        line.push(1);
      }
      else {
        line.push(0);
      }
    }
    grid.push(line);
  }

  // Doorways
  // Opening in left cave wall (col 6, row 13-14)
  grid[13][6] = 0;
  grid[14][6] = 0;
  // Opening in right cave wall (col 24, row 13-14)
  grid[13][24] = 0;
  grid[14][24] = 0;

  // West exit opening (left border, rows 12-15)
  grid[12][0] = 0;
  grid[13][0] = 0;
  grid[14][0] = 0;
  grid[15][0] = 0;

  return grid;
}

export const crystalCaverns: ZoneDef = {
  id: 'crystalCaverns',
  name: 'CRYSTAL CAVERNS',
  width: W * 32,
  height: H * 32,
  tileSize: 32,
  colors: {
    floor: '#0e0a18',
    floorAlt: '#100c1c',
    wall: '#1a1030',
    accent: '#a855f7',
    ambient: '#080510',
  },
  collisionGrid: makeGrid(),
  stations: [
    {
      stationId: 'voidForge',
      x: 15 * 32 + 16,  // Near the central crystal formation
      y: 18 * 32 + 16,
      interactionRadius: 48,
    },
  ],
  exits: [
    {
      id: 'west-to-homeBase',
      targetZone: 'homeBase',
      targetSpawnId: 'from-crystalCaverns',
      x: 0,
      y: 12 * 32,
      width: 32,
      height: 4 * 32,
      label: 'Home Base',
      requiredLevel: 1,
    },
  ],
  decorations: [
    // Crystal formations around the central mass
    { type: 'crystal', x: 12 * 32, y: 9 * 32, width: 20, height: 28, color: '#a855f7', glow: 'rgb(168, 85, 247)', glowRadius: 35 },
    { type: 'crystal', x: 18 * 32, y: 10 * 32, width: 16, height: 24, color: '#c084fc', glow: 'rgb(192, 132, 252)', glowRadius: 30 },
    { type: 'crystal', x: 14 * 32, y: 15 * 32, width: 18, height: 30, color: '#7c3aed', glow: 'rgb(124, 58, 237)', glowRadius: 40 },
    { type: 'crystal', x: 17 * 32, y: 15 * 32, width: 14, height: 22, color: '#a855f7', glow: 'rgb(168, 85, 247)', glowRadius: 25 },

    // Scattered smaller crystals
    { type: 'crystal', x: 3 * 32, y: 4 * 32, width: 12, height: 18, color: '#8b5cf6', glow: 'rgb(139, 92, 246)', glowRadius: 20 },
    { type: 'crystal', x: 26 * 32, y: 5 * 32, width: 14, height: 20, color: '#a855f7', glow: 'rgb(168, 85, 247)', glowRadius: 22 },
    { type: 'crystal', x: 8 * 32, y: 20 * 32, width: 10, height: 16, color: '#c084fc', glow: 'rgb(192, 132, 252)', glowRadius: 18 },
    { type: 'crystal', x: 22 * 32, y: 21 * 32, width: 12, height: 20, color: '#7c3aed', glow: 'rgb(124, 58, 237)', glowRadius: 20 },

    // Rocks
    { type: 'rock', x: 4 * 32, y: 8 * 32, width: 24, height: 18, color: '#201838' },
    { type: 'rock', x: 26 * 32, y: 8 * 32, width: 22, height: 16, color: '#201838' },
    { type: 'rock', x: 10 * 32, y: 22 * 32, width: 28, height: 20, color: '#1a1430' },
    { type: 'rock', x: 20 * 32, y: 3 * 32, width: 20, height: 18, color: '#1a1430' },

    // Ambient lights
    { type: 'light', x: 15 * 32, y: 4 * 32, width: 16, height: 16, color: 'rgba(168, 85, 247, 0.25)' },
    { type: 'light', x: 4 * 32, y: 15 * 32, width: 14, height: 14, color: 'rgba(124, 58, 237, 0.2)' },
    { type: 'light', x: 26 * 32, y: 16 * 32, width: 14, height: 14, color: 'rgba(192, 132, 252, 0.2)' },
  ],
  spawns: [
    { id: 'default', x: 3 * 32, y: 13 * 32 },
    { id: 'from-homeBase', x: 2 * 32, y: 13 * 32 },
  ],
  requiredLevel: 2,
};
