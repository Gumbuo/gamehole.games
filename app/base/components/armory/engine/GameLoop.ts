export type UpdateFn = (dt: number) => void;

export class GameLoop {
  private rafId: number | null = null;
  private lastTime = 0;
  private running = false;
  private updateFn: UpdateFn;

  constructor(updateFn: UpdateFn) {
    this.updateFn = updateFn;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // cap at 100ms
    this.lastTime = now;
    this.updateFn(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
