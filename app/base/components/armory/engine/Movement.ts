import { FacingDirection, InputState, Vec2 } from './types';

const SPEED = 180; // pixels per second

export interface MovementResult {
  x: number;
  y: number;
  facing: FacingDirection;
  moved: boolean;
}

export function updateMovement(
  px: number,
  py: number,
  facing: FacingDirection,
  input: InputState,
  dt: number,
  canMoveTo: (x: number, y: number) => boolean
): MovementResult {
  let dx = 0;
  let dy = 0;

  if (input.keys.has('w') || input.keys.has('arrowup'))    dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown'))  dy += 1;
  if (input.keys.has('a') || input.keys.has('arrowleft'))  dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;

  if (dx === 0 && dy === 0) {
    return { x: px, y: py, facing, moved: false };
  }

  // Normalize diagonal movement
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  const moveX = dx * SPEED * dt;
  const moveY = dy * SPEED * dt;

  let newX = px;
  let newY = py;

  // Try X and Y separately for wall sliding
  if (canMoveTo(px + moveX, py)) {
    newX = px + moveX;
  }
  if (canMoveTo(newX, py + moveY)) {
    newY = py + moveY;
  }

  // Determine facing direction
  let newFacing = facing;
  if (Math.abs(dx) > Math.abs(dy)) {
    newFacing = dx > 0 ? 'east' : 'west';
  } else if (dy !== 0) {
    newFacing = dy > 0 ? 'south' : 'north';
  }

  const moved = newX !== px || newY !== py;

  return { x: newX, y: newY, facing: newFacing, moved };
}
