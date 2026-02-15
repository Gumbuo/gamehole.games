import { InputState, Vec2 } from './types';

const GAME_KEYS = new Set([
  'w', 'a', 's', 'd',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
  'e', ' ',
]);

export class InputHandler {
  state: InputState = {
    keys: new Set(),
    clickTarget: null,
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
    this.state.clickTarget = this.screenToWorld(sx, sy);
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
}
