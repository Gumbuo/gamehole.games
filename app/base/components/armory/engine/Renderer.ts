import { CameraState, ZoneDef, ZoneExit, GameState, ZoneDecoration } from './types';
import { StationId, ArmorySaveState } from '../types';
import { STATIONS } from '../data/stations';

interface PlayerSprites {
  east: HTMLImageElement | null;
  west: HTMLImageElement | null;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animTime = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(
    zone: ZoneDef,
    cam: CameraState,
    gameState: GameState,
    sprites: PlayerSprites,
    saveState: ArmorySaveState,
    dt: number
  ) {
    this.animTime += dt;
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = zone.colors.ambient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw floor tiles (only visible ones)
    this.drawFloor(zone, cam);

    // Draw decorations
    this.drawDecorations(zone.decorations, cam);

    // Draw exits
    this.drawExits(zone.exits, cam, gameState, saveState.progress.level);

    // Draw stations
    this.drawStations(zone, cam, gameState, saveState);

    // Draw player
    this.drawPlayer(gameState, cam, sprites, saveState);

    // Draw minimap
    this.drawMinimap(zone, gameState, cam);

    // Draw HUD
    this.drawHUD(zone, gameState, saveState);

    // Draw transition overlay
    if (gameState.isTransitioning) {
      ctx.fillStyle = `rgba(0, 0, 0, ${gameState.transitionAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  private drawFloor(zone: ZoneDef, cam: CameraState) {
    const ctx = this.ctx;
    const ts = zone.tileSize;
    const startCol = Math.max(0, Math.floor(cam.x / ts));
    const startRow = Math.max(0, Math.floor(cam.y / ts));
    const endCol = Math.min(
      zone.collisionGrid[0].length,
      Math.ceil((cam.x + cam.viewportWidth) / ts) + 1
    );
    const endRow = Math.min(
      zone.collisionGrid.length,
      Math.ceil((cam.y + cam.viewportHeight) / ts) + 1
    );

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const sx = col * ts - cam.x;
        const sy = row * ts - cam.y;
        const isWall = zone.collisionGrid[row][col] === 1;

        if (isWall) {
          ctx.fillStyle = zone.colors.wall;
          ctx.fillRect(sx, sy, ts, ts);
          // Wall edge highlight
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(sx, sy, ts, 2);
        } else {
          // Checkerboard floor
          const isAlt = (row + col) % 2 === 0;
          ctx.fillStyle = isAlt ? zone.colors.floor : zone.colors.floorAlt;
          ctx.fillRect(sx, sy, ts, ts);
        }
      }
    }
  }

  private drawDecorations(decorations: ZoneDecoration[], cam: CameraState) {
    const ctx = this.ctx;

    for (const d of decorations) {
      const sx = d.x - cam.x;
      const sy = d.y - cam.y;

      // Skip if offscreen
      if (sx + d.width < 0 || sx > this.width || sy + d.height < 0 || sy > this.height) continue;

      // Draw glow first
      if (d.glow) {
        const radius = d.glowRadius || 40;
        const pulse = 0.6 + Math.sin(this.animTime * 2) * 0.2;
        const grad = ctx.createRadialGradient(
          sx + d.width / 2, sy + d.height / 2, 0,
          sx + d.width / 2, sy + d.height / 2, radius
        );
        grad.addColorStop(0, d.glow.replace(')', `, ${0.3 * pulse})`).replace('rgb', 'rgba'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx - radius, sy - radius, d.width + radius * 2, d.height + radius * 2);
      }

      ctx.fillStyle = d.color;

      switch (d.type) {
        case 'rock':
          ctx.beginPath();
          this.roundRect(ctx, sx, sy, d.width, d.height, 6);
          ctx.fill();
          break;
        case 'crystal':
          ctx.beginPath();
          ctx.moveTo(sx + d.width / 2, sy);
          ctx.lineTo(sx + d.width, sy + d.height * 0.7);
          ctx.lineTo(sx + d.width * 0.7, sy + d.height);
          ctx.lineTo(sx + d.width * 0.3, sy + d.height);
          ctx.lineTo(sx, sy + d.height * 0.7);
          ctx.closePath();
          ctx.fill();
          break;
        case 'plant':
          ctx.beginPath();
          ctx.ellipse(sx + d.width / 2, sy + d.height / 2, d.width / 2, d.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'structure':
          ctx.fillRect(sx, sy, d.width, d.height);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, sy, d.width, d.height);
          break;
        case 'light':
          const lightPulse = 0.5 + Math.sin(this.animTime * 3) * 0.3;
          const lg = ctx.createRadialGradient(
            sx + d.width / 2, sy + d.height / 2, 0,
            sx + d.width / 2, sy + d.height / 2, d.width
          );
          lg.addColorStop(0, d.color);
          lg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.globalAlpha = lightPulse;
          ctx.fillStyle = lg;
          ctx.fillRect(sx - d.width, sy - d.height, d.width * 3, d.height * 3);
          ctx.globalAlpha = 1;
          break;
        case 'pool':
          const poolWave = Math.sin(this.animTime * 1.5) * 2;
          ctx.beginPath();
          ctx.ellipse(sx + d.width / 2, sy + d.height / 2 + poolWave, d.width / 2, d.height / 2, 0, 0, Math.PI * 2);
          ctx.globalAlpha = 0.6;
          ctx.fill();
          ctx.globalAlpha = 1;
          break;
        case 'pipe':
          ctx.fillRect(sx, sy, d.width, d.height);
          // Pipe accent line
          ctx.fillStyle = 'rgba(102, 252, 241, 0.3)';
          if (d.width > d.height) {
            ctx.fillRect(sx, sy + d.height / 2 - 1, d.width, 2);
          } else {
            ctx.fillRect(sx + d.width / 2 - 1, sy, 2, d.height);
          }
          break;
      }
    }
  }

  private drawStations(
    zone: ZoneDef,
    cam: CameraState,
    gameState: GameState,
    saveState: ArmorySaveState
  ) {
    const ctx = this.ctx;

    for (const s of zone.stations) {
      const sx = s.x - cam.x;
      const sy = s.y - cam.y;

      // Skip if offscreen
      if (sx + 40 < 0 || sx - 40 > this.width || sy + 40 < 0 || sy - 40 > this.height) continue;

      const station = STATIONS[s.stationId];
      const stationLevel = saveState.stationLevels[s.stationId];
      const isUnlocked = stationLevel > 0 || saveState.progress.level >= station.unlockLevel;
      const isNear = gameState.nearStation === s.stationId;
      const hasActiveJobs = saveState.craftingQueues[s.stationId]?.length > 0;

      // Station platform (64x64)
      const platSize = 64;
      const px = sx - platSize / 2;
      const py = sy - platSize / 2;

      // Proximity glow
      if (isNear && isUnlocked) {
        const pulse = 0.4 + Math.sin(this.animTime * 4) * 0.2;
        const glow = ctx.createRadialGradient(sx, sy, 10, sx, sy, 60);
        glow.addColorStop(0, `rgba(102, 252, 241, ${pulse})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(px - 30, py - 30, platSize + 60, platSize + 60);
      }

      // Platform
      ctx.fillStyle = isUnlocked ? 'rgba(26, 42, 62, 0.9)' : 'rgba(26, 26, 46, 0.9)';
      ctx.beginPath();
      this.roundRect(ctx, px, py, platSize, platSize, 8);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = !isUnlocked ? '#333'
        : hasActiveJobs ? '#66fcf1'
        : isNear ? '#66fcf1'
        : '#45a29e';
      ctx.lineWidth = isNear ? 3 : 2;
      ctx.beginPath();
      this.roundRect(ctx, px, py, platSize, platSize, 8);
      ctx.stroke();

      // Icon
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!isUnlocked) {
        ctx.fillStyle = '#555';
        ctx.fillText('\uD83D\uDD12', sx, sy); // lock emoji
      } else {
        ctx.fillText(station.icon, sx, sy);
      }

      // Name label
      ctx.font = '10px Orbitron, monospace';
      ctx.fillStyle = isUnlocked ? '#66fcf1' : '#555';
      ctx.fillText(station.name, sx, sy + platSize / 2 + 14);

      // Level
      if (isUnlocked && stationLevel > 0) {
        ctx.font = '8px Orbitron, monospace';
        ctx.fillStyle = '#45a29e';
        ctx.fillText(`Lv.${stationLevel}`, sx, sy + platSize / 2 + 26);
      }

      // Active jobs indicator
      if (hasActiveJobs) {
        ctx.font = '12px Arial';
        ctx.fillStyle = '#66fcf1';
        ctx.fillText(`\u23F3${saveState.craftingQueues[s.stationId].length}`, sx + platSize / 2 + 8, sy - platSize / 2 + 4);
      }

      // "E to interact" prompt
      if (isNear && isUnlocked && stationLevel > 0) {
        const promptY = sy - platSize / 2 - 16;
        ctx.font = '11px Orbitron, monospace';
        ctx.fillStyle = '#66fcf1';
        ctx.textAlign = 'center';

        // Background for prompt
        const textWidth = ctx.measureText('[E] Interact').width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, sx - textWidth / 2 - 6, promptY - 8, textWidth + 12, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#66fcf1';
        ctx.fillText('[E] Interact', sx, promptY);
      }
    }
  }

  private drawExits(
    exits: ZoneExit[],
    cam: CameraState,
    gameState: GameState,
    playerLevel: number
  ) {
    const ctx = this.ctx;

    for (const e of exits) {
      const sx = e.x - cam.x;
      const sy = e.y - cam.y;

      // Skip if offscreen
      if (sx + e.width < 0 || sx > this.width || sy + e.height < 0 || sy > this.height) continue;

      const isLocked = playerLevel < e.requiredLevel;
      const isNear = gameState.nearExit?.id === e.id;

      // Animated dashed border
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = -this.animTime * 30;
      ctx.strokeStyle = isLocked ? '#ff6b6b44' : isNear ? '#66fcf1' : '#66fcf188';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, e.width, e.height);
      ctx.setLineDash([]);

      // Fill
      ctx.fillStyle = isLocked ? 'rgba(255, 107, 107, 0.05)' : 'rgba(102, 252, 241, 0.08)';
      ctx.fillRect(sx, sy, e.width, e.height);

      // Arrow and label
      const cx = sx + e.width / 2;
      const cy = sy + e.height / 2;

      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isLocked) {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('\uD83D\uDD12', cx, cy - 10);
        ctx.font = '9px Orbitron, monospace';
        ctx.fillText(`Lv.${e.requiredLevel} Required`, cx, cy + 10);
      } else {
        // Direction arrow
        ctx.fillStyle = '#66fcf1';
        ctx.fillText('\u27A1', cx, cy - 10);
        ctx.font = '10px Orbitron, monospace';
        ctx.fillStyle = '#66fcf1';
        ctx.fillText(e.label, cx, cy + 10);
      }
    }
  }

  private drawPlayer(
    gameState: GameState,
    cam: CameraState,
    sprites: PlayerSprites,
    saveState: ArmorySaveState
  ) {
    const ctx = this.ctx;
    const sx = gameState.playerX - cam.x;
    const sy = gameState.playerY - cam.y;

    const sprite = (gameState.facing === 'west' || gameState.facing === 'north')
      ? sprites.west
      : sprites.east;

    const size = 64;

    if (sprite) {
      ctx.drawImage(sprite, sx - size / 2, sy - size / 2, size, size);
    } else {
      // Fallback
      ctx.beginPath();
      ctx.arc(sx, sy - 10, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff99';
      ctx.fill();
      ctx.strokeStyle = '#66fcf1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Equipment emoji
    const equippedWeapon = saveState.equipped?.weapon;
    const equippedArmor = saveState.equipped?.armor;

    if (equippedWeapon || equippedArmor) {
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      // Items are imported but we can't use getItem here easily,
      // so we just show a small indicator
    }
  }

  private drawMinimap(zone: ZoneDef, gameState: GameState, cam: CameraState) {
    const ctx = this.ctx;
    const mmW = 120;
    const mmH = 90;
    const mmX = this.width - mmW - 10;
    const mmY = 10;
    const scaleX = mmW / zone.width;
    const scaleY = mmH / zone.height;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mmX, mmY, mmW, mmH);
    ctx.strokeStyle = '#45a29e';
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, mmW, mmH);

    // Walls (simplified - just iterate tiles at lower resolution)
    const step = Math.max(1, Math.floor(4 / zone.tileSize * zone.width / mmW));
    for (let row = 0; row < zone.collisionGrid.length; row += step) {
      for (let col = 0; col < zone.collisionGrid[0].length; col += step) {
        if (zone.collisionGrid[row][col] === 1) {
          ctx.fillStyle = zone.colors.wall;
          ctx.fillRect(
            mmX + col * zone.tileSize * scaleX,
            mmY + row * zone.tileSize * scaleY,
            Math.max(2, zone.tileSize * scaleX * step),
            Math.max(2, zone.tileSize * scaleY * step)
          );
        }
      }
    }

    // Stations
    for (const s of zone.stations) {
      ctx.fillStyle = '#45a29e';
      ctx.fillRect(mmX + s.x * scaleX - 2, mmY + s.y * scaleY - 2, 4, 4);
    }

    // Exits
    for (const e of zone.exits) {
      ctx.fillStyle = '#66fcf188';
      ctx.fillRect(mmX + e.x * scaleX, mmY + e.y * scaleY, Math.max(3, e.width * scaleX), Math.max(3, e.height * scaleY));
    }

    // Player
    ctx.fillStyle = '#00ff99';
    ctx.beginPath();
    ctx.arc(mmX + gameState.playerX * scaleX, mmY + gameState.playerY * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Viewport rectangle
    ctx.strokeStyle = 'rgba(102, 252, 241, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      mmX + cam.x * scaleX,
      mmY + cam.y * scaleY,
      cam.viewportWidth * scaleX,
      cam.viewportHeight * scaleY
    );
  }

  private drawHUD(zone: ZoneDef, gameState: GameState, saveState: ArmorySaveState) {
    const ctx = this.ctx;

    // Stats box (top-left)
    const statsW = 140;
    const statsH = 60;
    ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
    ctx.beginPath();
    this.roundRect(ctx, 10, 10, statsW, statsH, 6);
    ctx.fill();
    ctx.strokeStyle = '#66fcf1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(ctx, 10, 10, statsW, statsH, 6);
    ctx.stroke();

    ctx.font = '10px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Zone name
    ctx.fillStyle = zone.colors.accent;
    ctx.fillText(zone.name, 20, 18);

    // Player level
    ctx.fillStyle = '#facc15';
    ctx.fillText(`Lv.${saveState.progress.level}`, 20, 34);

    // ATK/DEF
    const equippedWeapon = saveState.equipped?.weapon;
    const equippedArmor = saveState.equipped?.armor;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(`ATK: ${equippedWeapon ? '?' : '0'}`, 20, 50);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText(`DEF: ${equippedArmor ? '?' : '0'}`, 80, 50);

    // Controls hint (bottom center)
    ctx.font = '10px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(102, 252, 241, 0.4)';
    ctx.fillText('WASD / Click to move | E to interact', this.width / 2, this.height - 14);
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
