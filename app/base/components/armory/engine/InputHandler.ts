import { InputState, Vec2 } from './types';
export type { Vec2 };

const GAME_KEYS = new Set([
  'w', 'a', 's', 'd',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  'e', ' ',
]);

export class InputHandler {
  state: InputState = {
    keys: new Set(),
    clickTarget: null,
    shootTarget: null,
    interactPressed: false,
  };

  private canvas: HTMLCanvasElement;
  private screenToWorld: (sx: number, sy: number) => Vec2;
  private focused = false;

  constructor(
    canvas: HTMLCanvasElement,
    screenToWorld: (sx: number, sy: number) => Vec2
  ) {
    this.canvas = canvas;
    this.screenToWorld = screenToWorld;
    this.attach();
  }

  updateScreenToWorld(fn: (sx: number, sy: number) => Vec2) {
    this.screenToWorld = fn;
  }

  private attach() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('focus', this.onFocus);
    this.canvas.addEventListener('blur', this.onBlur);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Make canvas focusable
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';
  }

  detach() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('focus', this.onFocus);
    this.canvas.removeEventListener('blur', this.onBlur);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onFocus = () => {
    this.focused = true;
  };

  private onBlur = () => {
    this.focused = false;
    this.state.keys.clear();
  };

  private onMouseDown = (e: MouseEvent) => {
    this.canvas.focus();
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const worldPos = this.screenToWorld(sx, sy);
    // Left click = shoot, also store as clickTarget for station interaction check
    this.state.shootTarget = worldPos;
    this.state.clickTarget = worldPos;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.focused) return;
    const key = e.key.toLowerCase();

    if (GAME_KEYS.has(key)) {
      e.preventDefault();
      this.state.keys.add(key);
    }

    if (key === 'e' || key === ' ') {
      this.state.interactPressed = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.state.keys.delete(key);
  };

  consumeInteract(): boolean {
    if (this.state.interactPressed) {
      this.state.interactPressed = false;
      return true;
    }
    return false;
  }

  consumeShoot(): Vec2 | null {
    const t = this.state.shootTarget;
    if (t) {
      this.state.shootTarget = null;
      return t;
    }
    return null;
  }
}
