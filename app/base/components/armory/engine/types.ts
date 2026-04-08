import { StationId, ZoneId } from '../types';

export type { ZoneId };

export interface Vec2 {
  x: number;
  y: number;
}

export type FacingDirection = 'east' | 'west' | 'north' | 'south';

export interface ZoneStation {
  stationId: StationId;
  x: number;
  y: number;
  interactionRadius: number;
}

export interface ZoneExit {
  id: string;
  targetZone: ZoneId;
  targetSpawnId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  requiredLevel: number;
}

export interface ZoneDecoration {
  type: 'rock' | 'crystal' | 'plant' | 'structure' | 'light' | 'pool' | 'pipe';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  glow?: string;
  glowRadius?: number;
}

export interface ZoneSpawn {
  id: string;
  x: number;
  y: number;
}

export interface ZoneDef {
  id: ZoneId;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  colors: {
    floor: string;
    floorAlt: string;
    wall: string;
    accent: string;
    ambient: string;
  };
  collisionGrid: number[][]; // 0=floor, 1=wall
  stations: ZoneStation[];
  exits: ZoneExit[];
  decorations: ZoneDecoration[];
  spawns: ZoneSpawn[];
  requiredLevel: number;
}

// ============== ZONE PLAYER POSITION ==============
export interface ZonePositions {
  [zoneId: string]: Vec2;
}

export interface ZonePlayerPosition {
  zoneId: ZoneId;
  x: number;
  y: number;
  currentStation: StationId | null;
  zonePositions?: ZonePositions;
}

// ============== CAMERA STATE ==============
export interface CameraState {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

// ============== INPUT STATE ==============
export interface InputState {
  keys: Set<string>;
  clickTarget: Vec2 | null;
  shootTarget: Vec2 | null;
  interactPressed: boolean;
}

// ============== PROJECTILE ==============
export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number; // seconds remaining
}

// ============== GAME STATE ==============
export interface GameState {
  playerX: number;
  playerY: number;
  facing: FacingDirection;
  isMoving: boolean;
  currentZoneId: ZoneId;
  nearStation: StationId | null;
  nearExit: ZoneExit | null;
  isTransitioning: boolean;
  transitionAlpha: number;
  projectiles: Projectile[];
}
