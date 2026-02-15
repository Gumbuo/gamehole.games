import { CameraState, Vec2 } from './types';

export class Camera {
  x = 0;
  y = 0;
  viewportWidth: number;
  viewportHeight: number;
  private lerpFactor = 0.08;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  follow(targetX: number, targetY: number, worldWidth: number, worldHeight: number) {
    const idealX = targetX - this.viewportWidth / 2;
    const idealY = targetY - this.viewportHeight / 2;

    this.x += (idealX - this.x) * this.lerpFactor;
    this.y += (idealY - this.y) * this.lerpFactor;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(worldWidth - this.viewportWidth, this.x));
    this.y = Math.max(0, Math.min(worldHeight - this.viewportHeight, this.y));
  }

  snapTo(targetX: number, targetY: number, worldWidth: number, worldHeight: number) {
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;
    this.x = Math.max(0, Math.min(worldWidth - this.viewportWidth, this.x));
    this.y = Math.max(0, Math.min(worldHeight - this.viewportHeight, this.y));
  }

  worldToScreen(wx: number, wy: number): Vec2 {
    return { x: wx - this.x, y: wy - this.y };
  }

  screenToWorld(sx: number, sy: number): Vec2 {
    return { x: sx + this.x, y: sy + this.y };
  }

  resize(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  getState(): CameraState {
    return {
      x: this.x,
      y: this.y,
      viewportWidth: this.viewportWidth,
      viewportHeight: this.viewportHeight,
    };
  }
}
