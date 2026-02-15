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
      // Swamp pools (impassable water areas)
      else if (row >= 4 && row <= 7 && col >= 3 && col <= 7) {
        line.push(1);
      } else if (row >= 16 && row <= 19 && col >= 20 && col <= 26) {
        line.push(1);
      }
      // Raised platform area for bio-lab (central elevated section)
      else if (row === 10 && col >= 11 && col <= 19) {
        // Platform border - only the edge row is wall
        if (col === 11 || col === 19) line.push(1);
        else line.push(0);
      } else if (row === 15 && col >= 11 && col <= 19) {
        if (col === 11 || col === 19) line.push(1);
        else line.push(0);
      } else if (col === 11 && row >= 10 && row <= 15) {
        line.push(1);
      } else if (col === 19 && row >= 10 && row <= 15) {
        line.push(1);
      }
      // Vine/root obstacles
      else if (row === 8 && col >= 22 && col <= 26) {
        line.push(1);
      }
      else {
        line.push(0);
      }
    }
    grid.push(line);
  }

  // Openings in platform walls (entrances)
  // South entrance (row 15, col 14-16)
  grid[15][14] = 0;
  grid[15][15] = 0;
  grid[15][16] = 0;
  // North entrance (row 10, col 14-16)
  grid[10][14] = 0;
  grid[10][15] = 0;
  grid[10][16] = 0;

  // North exit opening (top border, cols 14-17)
  grid[0][14] = 0;
  grid[0][15] = 0;
  grid[0][16] = 0;
  grid[0][17] = 0;

  return grid;
}

export const bioSwamp: ZoneDef = {
  id: 'bioSwamp',
  name: 'BIO SWAMP',
  width: W * 32,
  height: H * 32,
  tileSize: 32,
  colors: {
    floor: '#0a140a',
    floorAlt: '#0c180c',
    wall: '#1a2818',
    accent: '#4ade80',
    ambient: '#060e06',
  },
  collisionGrid: makeGrid(),
  stations: [
    {
      stationId: 'bioLab',
      x: 15 * 32 + 16,  // Center of raised platform
      y: 12 * 32 + 16,
      interactionRadius: 48,
    },
  ],
  exits: [
    {
      id: 'north-to-homeBase',
      targetZone: 'homeBase',
      targetSpawnId: 'from-bioSwamp',
      x: 14 * 32,
      y: 0,
      width: 4 * 32,
      height: 32,
      label: 'Home Base',
      requiredLevel: 1,
    },
  ],
  decorations: [
    // Swamp pools (visual overlay on collision areas)
    { type: 'pool', x: 3 * 32, y: 4 * 32, width: 5 * 32, height: 4 * 32, color: 'rgba(74, 222, 128, 0.15)' },
    { type: 'pool', x: 20 * 32, y: 16 * 32, width: 7 * 32, height: 4 * 32, color: 'rgba(74, 222, 128, 0.12)' },

    // Bio-luminescent plants
    { type: 'plant', x: 2 * 32, y: 2 * 32, width: 18, height: 18, color: '#22c55e', glow: 'rgb(34, 197, 94)', glowRadius: 25 },
    { type: 'plant', x: 9 * 32, y: 6 * 32, width: 14, height: 14, color: '#4ade80', glow: 'rgb(74, 222, 128)', glowRadius: 20 },
    { type: 'plant', x: 25 * 32, y: 4 * 32, width: 16, height: 16, color: '#22c55e', glow: 'rgb(34, 197, 94)', glowRadius: 22 },
    { type: 'plant', x: 6 * 32, y: 18 * 32, width: 20, height: 20, color: '#86efac', glow: 'rgb(134, 239, 172)', glowRadius: 28 },
    { type: 'plant', x: 28 * 32, y: 12 * 32, width: 12, height: 12, color: '#4ade80', glow: 'rgb(74, 222, 128)', glowRadius: 18 },
    { type: 'plant', x: 3 * 32, y: 22 * 32, width: 16, height: 16, color: '#22c55e', glow: 'rgb(34, 197, 94)', glowRadius: 24 },

    // Rocks/roots
    { type: 'rock', x: 10 * 32, y: 20 * 32, width: 28, height: 20, color: '#1a2818' },
    { type: 'rock', x: 24 * 32, y: 10 * 32, width: 22, height: 16, color: '#1a2818' },
    { type: 'rock', x: 2 * 32, y: 14 * 32, width: 20, height: 18, color: '#1a2818' },

    // Platform structure highlight
    { type: 'structure', x: 12 * 32, y: 11 * 32, width: 6 * 32, height: 3 * 32, color: 'rgba(74, 222, 128, 0.05)' },

    // Ambient lights
    { type: 'light', x: 15 * 32, y: 12 * 32, width: 16, height: 16, color: 'rgba(74, 222, 128, 0.3)' },
    { type: 'light', x: 5 * 32, y: 10 * 32, width: 12, height: 12, color: 'rgba(34, 197, 94, 0.2)' },
    { type: 'light', x: 25 * 32, y: 22 * 32, width: 12, height: 12, color: 'rgba(74, 222, 128, 0.2)' },
  ],
  spawns: [
    { id: 'default', x: 15 * 32, y: 22 * 32 },
    { id: 'from-homeBase', x: 15 * 32, y: 2 * 32 },
  ],
  requiredLevel: 3,
};
