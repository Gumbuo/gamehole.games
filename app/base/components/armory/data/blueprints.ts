import { RawResourceKey, StationId } from '../types';

export type BuildCell = RawResourceKey | null;
export type BuildGrid = [BuildCell, BuildCell, BuildCell, BuildCell][];

export interface StationBlueprint {
  stationId: StationId;
  description: string;
  grid: BuildGrid;
}

export const BLUEPRINTS: Record<StationId, StationBlueprint> = {
  plasmaRefinery: {
    stationId: 'plasmaRefinery',
    description: 'Channel plasma ore into the ring formation to ignite the refinery.',
    grid: [
      [null,        'plasmaOre', 'plasmaOre', null       ],
      ['plasmaOre', null,        null,        'plasmaOre'],
      ['plasmaOre', null,        null,        'plasmaOre'],
      [null,        'plasmaOre', 'plasmaOre', null       ],
    ],
  },
  assemblyBay: {
    stationId: 'assemblyBay',
    description: 'Fuse plasma, bio-metal and nebula essence to forge the assembly platform.',
    grid: [
      [null,       'plasmaOre',     'plasmaOre',     null      ],
      ['bioMetal', 'nebulaEssence', 'nebulaEssence', 'bioMetal'],
      ['bioMetal', 'nebulaEssence', 'nebulaEssence', 'bioMetal'],
      [null,       'plasmaOre',     'plasmaOre',     null      ],
    ],
  },
  voidForge: {
    stationId: 'voidForge',
    description: 'Embed void crystals in the dimensional X pattern to open the forge.',
    grid: [
      ['voidCrystal', null,          null,          'voidCrystal'],
      [null,          'voidCrystal', 'voidCrystal', null         ],
      [null,          'voidCrystal', 'voidCrystal', null         ],
      ['voidCrystal', null,          null,          'voidCrystal'],
    ],
  },
  bioLab: {
    stationId: 'bioLab',
    description: 'Line the containment frame with bio-metal to grow the laboratory.',
    grid: [
      ['bioMetal', 'bioMetal', 'bioMetal', 'bioMetal'],
      ['bioMetal', null,       null,       'bioMetal'],
      ['bioMetal', null,       null,       'bioMetal'],
      ['bioMetal', 'bioMetal', 'bioMetal', 'bioMetal'],
    ],
  },
  quantumChamber: {
    stationId: 'quantumChamber',
    description: 'Fill the quantum lattice with quantum dust to stabilize the chamber.',
    grid: [
      ['quantumDust', 'quantumDust', 'quantumDust', 'quantumDust'],
      ['quantumDust', null,          null,           'quantumDust'],
      ['quantumDust', null,          null,           'quantumDust'],
      ['quantumDust', 'quantumDust', 'quantumDust', 'quantumDust'],
    ],
  },
};

export function countRequiredSlots(blueprint: StationBlueprint): number {
  return blueprint.grid.flat().filter(cell => cell !== null).length;
}

export function countFilledSlots(blueprint: StationBlueprint, filled: boolean[][]): number {
  let count = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (blueprint.grid[r][c] !== null && filled[r]?.[c]) count++;
    }
  }
  return count;
}

export function isBuildComplete(blueprint: StationBlueprint, filled: boolean[][]): boolean {
  return countFilledSlots(blueprint, filled) === countRequiredSlots(blueprint);
}

export function makeEmptyBuildGrid(): boolean[][] {
  return Array(4).fill(null).map(() => Array(4).fill(false));
}
