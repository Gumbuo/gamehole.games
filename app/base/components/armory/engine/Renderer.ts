import { CameraState, ZoneDef, ZoneExit, GameState, ZoneDecoration, Projectile, Enemy } from './types';
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

    // Draw enemies
    this.drawEnemies(gameState.enemies, cam);

    // Draw player
    this.drawPlayer(gameState, cam, sprites, saveState);

    // Draw projectiles
    this.drawProjectiles(gameState.projectiles, cam);

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
    const size = 64;

    const facing = gameState.facing;
    const isMoving = gameState.isMoving;

    if (facing === 'east' || facing === 'west') {
      // Walk bob for east/west
      const bob = isMoving ? Math.sin(this.animTime * 10) * 2 : 0;
      const sprite = facing === 'west' ? sprites.west : sprites.east;
      if (sprite) {
        ctx.drawImage(sprite, sx - size / 2, sy - size / 2 + bob, size, size);
      } else {
        this.drawFallbackPlayer(ctx, sx, sy + bob);
      }
    } else {
      // North / South — draw animated top-down character (no sprite files needed)
      this.drawNorthSouthPlayer(ctx, sx, sy, facing, isMoving);
    }
  }

  private drawFallbackPlayer(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
    ctx.beginPath();
    ctx.arc(sx, sy - 10, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff99';
    ctx.fill();
    ctx.strokeStyle = '#66fcf1';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawNorthSouthPlayer(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    facing: 'north' | 'south',
    isMoving: boolean
  ) {
    // Walking cycle: two alternating leg positions
    const walkPhase = this.animTime * 8;
    const bob = isMoving ? Math.sin(walkPhase) * 2 : 0;
    const legSwing = isMoving ? Math.sin(walkPhase) * 6 : 0;
    const armSwing = isMoving ? -Math.sin(walkPhase) * 5 : 0;

    ctx.save();
    ctx.translate(sx, sy + bob);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, 14, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    if (facing === 'south') {
      // Body (facing camera — show front)
      // Legs
      ctx.fillStyle = '#1a3a5a';
      ctx.beginPath();
      ctx.roundRect(-8 + legSwing * 0.5, 8, 7, 12, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(1 - legSwing * 0.5, 8, 7, 12, 3);
      ctx.fill();

      // Torso
      ctx.fillStyle = '#00cc77';
      ctx.beginPath();
      ctx.roundRect(-11, -8, 22, 18, 5);
      ctx.fill();
      ctx.strokeStyle = '#66fcf1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arms
      ctx.fillStyle = '#00aa66';
      ctx.beginPath();
      ctx.roundRect(-17, -6 + armSwing, 7, 14, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(10, -6 - armSwing, 7, 14, 3);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -18, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff99';
      ctx.fill();
      ctx.strokeStyle = '#66fcf1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#001a0d';
      ctx.beginPath();
      ctx.arc(-4, -18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, -18, 3, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#66fcf1';
      ctx.beginPath();
      ctx.arc(-3, -19, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, -19, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // North — show back of character
      // Legs
      ctx.fillStyle = '#1a3a5a';
      ctx.beginPath();
      ctx.roundRect(-8 + legSwing * 0.5, 8, 7, 12, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(1 - legSwing * 0.5, 8, 7, 12, 3);
      ctx.fill();

      // Torso (back — slightly darker)
      ctx.fillStyle = '#00994d';
      ctx.beginPath();
      ctx.roundRect(-11, -8, 22, 18, 5);
      ctx.fill();
      ctx.strokeStyle = '#45a29e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arms (back view — arms slightly behind body)
      ctx.fillStyle = '#007744';
      ctx.beginPath();
      ctx.roundRect(-17, -6 + armSwing, 7, 14, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(10, -6 - armSwing, 7, 14, 3);
      ctx.fill();

      // Head (back — no eyes visible)
      ctx.beginPath();
      ctx.arc(0, -18, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#00cc77';
      ctx.fill();
      ctx.strokeStyle = '#45a29e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Antenna / back-of-head detail
      ctx.strokeStyle = '#66fcf1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -31);
      ctx.lineTo(0, -36);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -37, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#66fcf1';
      ctx.fill();
    }

    ctx.restore();
  }

  private drawEnemies(enemies: Enemy[], cam: CameraState) {
    const ctx = this.ctx;
    for (const enemy of enemies) {
      if (enemy.respawnTimer > 0) continue;
      const sx = enemy.x - cam.x;
      const sy = enemy.y - cam.y;
      if (sx < -60 || sx > this.width + 60 || sy < -60 || sy > this.height + 60) continue;

      ctx.save();
      ctx.translate(sx, sy);

      // Hit flash — pulse white
      const isHit = enemy.hitTimer > 0;
      const hitAlpha = isHit ? enemy.hitTimer / 0.15 : 0;

      // Shadow
      ctx.beginPath();
      ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      // Body glow (red for charger, orange for grunt)
      const bodyColor = enemy.type === 'charger' ? '#ff3030' : '#ff6600';
      const glowColor = enemy.type === 'charger' ? 'rgba(255,48,48,0.25)' : 'rgba(255,102,0,0.25)';
      const pulse = 0.7 + Math.sin(this.animTime * 5 + enemy.id) * 0.2;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 28);
      glow.addColorStop(0, glowColor.replace('0.25', String(0.3 * pulse)));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(-28, -28, 56, 56);

      // Body (oval)
      ctx.beginPath();
      ctx.ellipse(0, 2, 14, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? `rgba(255,255,255,${hitAlpha})` : bodyColor;
      ctx.fill();
      ctx.strokeStyle = isHit ? '#fff' : (enemy.type === 'charger' ? '#ff8888' : '#ffaa44');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.ellipse(0, -14, 11, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? `rgba(255,255,255,${hitAlpha})` : bodyColor;
      ctx.fill();
      ctx.strokeStyle = ctx.strokeStyle;
      ctx.stroke();

      // Eyes — glowing yellow
      if (!isHit) {
        ctx.fillStyle = '#ffee00';
        ctx.shadowColor = '#ffee00';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(-4, -15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Charger has spikes
      if (enemy.type === 'charger') {
        ctx.strokeStyle = '#ff8888';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + this.animTime * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 14, 2 + Math.sin(angle) * 16);
          ctx.lineTo(Math.cos(angle) * 22, 2 + Math.sin(angle) * 24);
          ctx.stroke();
        }
      }

      ctx.restore();

      // HP bar (above enemy)
      if (enemy.hp < enemy.maxHp) {
        const barW = 32;
        const barH = 4;
        const bx = sx - barW / 2;
        const by = sy - 38;
        ctx.fillStyle = '#330000';
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = '#ff3030';
        ctx.fillRect(bx, by, barW * (enemy.hp / enemy.maxHp), barH);
        ctx.strokeStyle = '#660000';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, barH);
      }
    }
  }

  private drawProjectiles(projectiles: Projectile[], cam: CameraState) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      const sx = p.x - cam.x;
      const sy = p.y - cam.y;
      if (sx < -10 || sx > this.width + 10 || sy < -10 || sy > this.height + 10) continue;

      // Glow trail
      const alpha = Math.min(1, p.lifetime * 2);
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
      glow.addColorStop(0, `rgba(0, 255, 153, ${alpha * 0.6})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(sx - 10, sy - 10, 20, 20);

      // Core
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 153, ${alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(102, 252, 241, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
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
    const statsH = 65;
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

    // ---- Health bar ----
    const hpBarW = 140;
    const hpBarH = 14;
    const hpBarX = 10;
    const hpBarY = 80;
    const hpPct = gameState.playerHp / gameState.playerMaxHp;
    const hpColor = hpPct > 0.6 ? '#22c55e' : hpPct > 0.3 ? '#facc15' : '#ef4444';

    // Background box
    ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
    ctx.beginPath();
    this.roundRect(ctx, hpBarX, hpBarY, hpBarW, hpBarH + 18, 6);
    ctx.fill();
    ctx.strokeStyle = '#66fcf1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(ctx, hpBarX, hpBarY, hpBarW, hpBarH + 18, 6);
    ctx.stroke();

    // HP label
    ctx.font = '9px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#66fcf1';
    ctx.fillText('HP', hpBarX + 6, hpBarY + 4);
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${gameState.playerHp} / ${gameState.playerMaxHp}`, hpBarX + 26, hpBarY + 4);

    // Bar track
    const bx = hpBarX + 6;
    const by = hpBarY + 16;
    const bw = hpBarW - 12;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    this.roundRect(ctx, bx, by, bw, 8, 4);
    ctx.fill();

    // Bar fill
    if (hpPct > 0) {
      ctx.fillStyle = hpColor;
      // Flicker during invincibility
      if (gameState.invincibilityTimer > 0 && Math.sin(this.animTime * 20) > 0) {
        ctx.globalAlpha = 0.4;
      }
      ctx.beginPath();
      this.roundRect(ctx, bx, by, bw * hpPct, 8, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(ctx, bx, by, bw, 8, 4);
    ctx.stroke();

    // Controls hint (bottom center)
    ctx.font = '10px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(102, 252, 241, 0.4)';
    ctx.fillText('WASD to move | Click to shoot | E to interact', this.width / 2, this.height - 14);
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
