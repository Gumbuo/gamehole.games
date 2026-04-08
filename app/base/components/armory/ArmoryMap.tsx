"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ArmorySaveState,
  StationId,
  ZoneId,
} from "./types";
import { getItem } from "./data/items";
import { STATIONS } from "./data/stations";
import { GameLoop } from "./engine/GameLoop";
import { Camera } from "./engine/Camera";
import { InputHandler } from "./engine/InputHandler";
import { Renderer } from "./engine/Renderer";
import { updateMovement } from "./engine/Movement";
import { canMoveTo, getNearStation, getNearExit } from "./engine/Collision";
import { GameState, FacingDirection, ZonePlayerPosition } from "./engine/types";
import { getZone, getSpawnPoint } from "./data/zones";

interface ArmoryMapProps {
  saveState: ArmorySaveState;
  onStationSelect: (stationId: StationId) => void;
  onUpdatePosition: (position: ZonePlayerPosition) => void;
  onZoneChange?: (zoneId: ZoneId) => void;
}

const MIN_WIDTH = 720;
const MIN_HEIGHT = 480;

export default function ArmoryMap({
  saveState,
  onStationSelect,
  onUpdatePosition,
  onZoneChange,
}: ArmoryMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Canvas size as ref — avoids React re-renders and game loop restarts on resize
  const canvasSizeRef = useRef({ width: MIN_WIDTH, height: MIN_HEIGHT });

  // Stable refs for prop callbacks — game loop reads these without needing them as deps
  const onStationSelectRef = useRef(onStationSelect);
  const onUpdatePositionRef = useRef(onUpdatePosition);
  const onZoneChangeRef = useRef(onZoneChange);
  useEffect(() => { onStationSelectRef.current = onStationSelect; }, [onStationSelect]);
  useEffect(() => { onUpdatePositionRef.current = onUpdatePosition; }, [onUpdatePosition]);
  useEffect(() => { onZoneChangeRef.current = onZoneChange; }, [onZoneChange]);

  // Refs for game engine objects (survive re-renders)
  const gameLoopRef = useRef<GameLoop | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const inputRef = useRef<InputHandler | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const stateRef = useRef<GameState>({
    playerX: saveState.playerPosition?.x ?? 15 * 32,
    playerY: saveState.playerPosition?.y ?? 10 * 32,
    facing: 'east' as FacingDirection,
    isMoving: false,
    currentZoneId: (saveState.playerPosition?.zoneId as ZoneId) ?? 'homeBase',
    nearStation: null,
    nearExit: null,
    isTransitioning: false,
    transitionAlpha: 0,
    projectiles: [],
  });
  const saveStateRef = useRef(saveState);
  const spritesRef = useRef<{ east: HTMLImageElement | null; west: HTMLImageElement | null }>({
    east: null,
    west: null,
  });
  const positionSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zonePositionsRef = useRef<Record<string, { x: number; y: number }>>(
    saveState.playerPosition?.zonePositions || {}
  );
  // Track transition state
  const transitionRef = useRef<{
    active: boolean;
    targetZone: ZoneId;
    targetSpawn: string;
    phase: 'fadeOut' | 'fadeIn';
  } | null>(null);

  // Zone name toast
  const [zoneToast, setZoneToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep saveState ref updated
  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  // Load player sprites
  useEffect(() => {
    const imgEast = new Image();
    imgEast.src = "/images/armory/player/east.png";
    imgEast.onload = () => { spritesRef.current.east = imgEast; };

    const imgWest = new Image();
    imgWest.src = "/images/armory/player/west.png";
    imgWest.onload = () => { spritesRef.current.west = imgWest; };
  }, []);

  // Get equipped items for overlay
  const equippedWeapon = saveState.equipped?.weapon ? getItem(saveState.equipped.weapon.itemId) : null;
  const equippedArmor = saveState.equipped?.armor ? getItem(saveState.equipped.armor.itemId) : null;

  // Debounced position save — uses ref so it never changes identity
  const savePosition = useCallback(() => {
    if (positionSaveTimerRef.current) {
      clearTimeout(positionSaveTimerRef.current);
    }
    positionSaveTimerRef.current = setTimeout(() => {
      const s = stateRef.current;
      onUpdatePositionRef.current({
        zoneId: s.currentZoneId,
        x: s.playerX,
        y: s.playerY,
        currentStation: s.nearStation,
        zonePositions: zonePositionsRef.current,
      });
    }, 2000);
  }, []);

  // Show zone toast
  const showZoneToast = useCallback((zoneName: string) => {
    setZoneToast(zoneName);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setZoneToast(null), 2000);
  }, []);

  // Handle zone transition
  const startTransition = useCallback((targetZone: ZoneId, targetSpawn: string) => {
    transitionRef.current = {
      active: true,
      targetZone,
      targetSpawn,
      phase: 'fadeOut',
    };
    stateRef.current.isTransitioning = true;
  }, []);

  // Responsive canvas sizing — updates imperatively, never restarts game loop
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth || MIN_WIDTH;
      const w = Math.max(MIN_WIDTH, Math.min(parentWidth - 32, 1200));
      const h = Math.max(MIN_HEIGHT, Math.round(w * 0.55));
      canvasSizeRef.current = { width: w, height: h };
      // Update DOM directly
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      // Update engine objects if they exist
      cameraRef.current?.resize(w, h);
      rendererRef.current?.resize(w, h);
      const zone = getZone(stateRef.current.currentZoneId);
      cameraRef.current?.snapTo(stateRef.current.playerX, stateRef.current.playerY, zone.width, zone.height);
      if (inputRef.current && cameraRef.current) {
        const cam = cameraRef.current;
        inputRef.current.updateScreenToWorld((sx, sy) => cam.screenToWorld(sx, sy));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Main game engine setup — runs once on mount only
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvasSizeRef.current;

    // Initialize engine modules
    const camera = new Camera(width, height);
    const renderer = new Renderer(ctx, width, height);

    // Snap camera to player immediately
    const zone = getZone(stateRef.current.currentZoneId);
    camera.snapTo(stateRef.current.playerX, stateRef.current.playerY, zone.width, zone.height);

    const input = new InputHandler(canvas, (sx, sy) => camera.screenToWorld(sx, sy));

    cameraRef.current = camera;
    inputRef.current = input;
    rendererRef.current = renderer;

    // Show initial zone toast
    showZoneToast(zone.name);

    // Game loop update function
    const update = (dt: number) => {
      const state = stateRef.current;
      const currentZone = getZone(state.currentZoneId);

      // Handle zone transition animation
      if (transitionRef.current?.active) {
        state.isMoving = false;
        const tr = transitionRef.current;
        if (tr.phase === 'fadeOut') {
          state.transitionAlpha = Math.min(1, state.transitionAlpha + dt * 4);
          if (state.transitionAlpha >= 1) {
            // Switch zone
            const newZone = getZone(tr.targetZone);
            const spawn = getSpawnPoint(newZone, tr.targetSpawn);

            // Save position in old zone
            zonePositionsRef.current[state.currentZoneId] = {
              x: state.playerX,
              y: state.playerY,
            };

            state.currentZoneId = tr.targetZone;
            state.playerX = spawn.x;
            state.playerY = spawn.y;
            state.nearStation = null;
            state.nearExit = null;

            camera.snapTo(spawn.x, spawn.y, newZone.width, newZone.height);
            input.updateScreenToWorld((sx, sy) => camera.screenToWorld(sx, sy));

            tr.phase = 'fadeIn';
            showZoneToast(newZone.name);
            onZoneChangeRef.current?.(tr.targetZone);

            // Save position immediately on zone change
            onUpdatePositionRef.current({
              zoneId: state.currentZoneId,
              x: state.playerX,
              y: state.playerY,
              currentStation: null,
              zonePositions: zonePositionsRef.current,
            });
          }
        } else {
          state.transitionAlpha = Math.max(0, state.transitionAlpha - dt * 4);
          if (state.transitionAlpha <= 0) {
            state.isTransitioning = false;
            transitionRef.current = null;
          }
        }

        // Render even during transition
        renderer.render(
          getZone(state.currentZoneId),
          camera.getState(),
          state,
          spritesRef.current,
          saveStateRef.current,
          dt
        );
        return;
      }

      // Normal movement
      const movResult = updateMovement(
        state.playerX,
        state.playerY,
        state.facing,
        input.state,
        dt,
        (x, y) => canMoveTo(x, y, currentZone)
      );

      state.playerX = movResult.x;
      state.playerY = movResult.y;
      state.facing = movResult.facing;
      state.isMoving = movResult.moved;

      if (movResult.moved) {
        savePosition();
      }

      // Check station proximity
      state.nearStation = getNearStation(state.playerX, state.playerY, currentZone.stations);

      // Check exit proximity
      state.nearExit = getNearExit(state.playerX, state.playerY, currentZone.exits);

      // Handle interaction (E key)
      if (input.consumeInteract()) {
        if (state.nearStation) {
          const stationLevel = saveStateRef.current.stationLevels[state.nearStation];
          const station = STATIONS[state.nearStation];
          const isUnlocked = stationLevel > 0 || saveStateRef.current.progress.level >= station.unlockLevel;
          if (isUnlocked && stationLevel > 0) {
            onStationSelectRef.current(state.nearStation);
          }
        }
      }

      // Handle click — interact with station if near one, otherwise shoot
      const shootTarget = input.consumeShoot();
      if (shootTarget) {
        const clickStation = getNearStation(shootTarget.x, shootTarget.y, currentZone.stations);
        if (clickStation && clickStation === state.nearStation) {
          // Click on nearby station = open it
          const stationLevel = saveStateRef.current.stationLevels[clickStation];
          const station = STATIONS[clickStation];
          const isUnlocked = stationLevel > 0 || saveStateRef.current.progress.level >= station.unlockLevel;
          if (isUnlocked && stationLevel > 0) {
            onStationSelectRef.current(clickStation);
          }
        } else {
          // Click anywhere else = shoot
          const dx = shootTarget.x - state.playerX;
          const dy = shootTarget.y - state.playerY;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 4) {
            const speed = 500;
            state.projectiles.push({
              id: performance.now() + Math.random(),
              x: state.playerX,
              y: state.playerY,
              vx: (dx / len) * speed,
              vy: (dy / len) * speed,
              lifetime: 1.5,
            });
          }
        }
      }

      // Update projectiles
      for (const p of state.projectiles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.lifetime -= dt;
      }
      state.projectiles = state.projectiles.filter(p => p.lifetime > 0);

      // Handle exit transition
      if (state.nearExit && !state.isTransitioning) {
        const exit = state.nearExit;
        const playerLevel = saveStateRef.current.progress.level;
        if (playerLevel >= exit.requiredLevel) {
          startTransition(exit.targetZone, exit.targetSpawnId);
        }
      }

      // Camera follow
      camera.follow(state.playerX, state.playerY, currentZone.width, currentZone.height);

      // Render
      renderer.render(
        currentZone,
        camera.getState(),
        state,
        spritesRef.current,
        saveStateRef.current,
        dt
      );
    };

    const gameLoop = new GameLoop(update);
    gameLoopRef.current = gameLoop;
    gameLoop.start();

    // Focus canvas for keyboard input
    canvas.focus();

    return () => {
      gameLoop.stop();
      input.detach();
      if (positionSaveTimerRef.current) {
        clearTimeout(positionSaveTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once on mount — resize handled imperatively, callbacks via refs

  return (
    <div ref={containerRef} className="relative">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={canvasSizeRef.current.width}
          height={canvasSizeRef.current.height}
          className="border border-cyan-800 rounded-lg cursor-crosshair"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Zone transition toast */}
        {zoneToast && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              background: 'rgba(10, 10, 15, 0.9)',
              border: '1px solid #66fcf1',
              borderRadius: '8px',
              padding: '8px 24px',
              fontFamily: 'Orbitron, monospace',
              fontSize: '16px',
              color: '#66fcf1',
              textShadow: '0 0 10px rgba(102, 252, 241, 0.5)',
              animation: 'fadeInOut 2s ease-in-out',
            }}
          >
            {zoneToast}
          </div>
        )}

        {/* Equipment overlay */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${(stateRef.current.playerX - (cameraRef.current?.x || 0)) - 40}px`,
            top: `${(stateRef.current.playerY - (cameraRef.current?.y || 0)) - 45}px`,
          }}
        >
          {equippedWeapon && (
            <div className="absolute" style={{ left: '60px', top: '-5px', fontSize: '20px' }}>
              {equippedWeapon.icon}
            </div>
          )}
          {equippedArmor && (
            <div className="absolute" style={{ left: '-5px', top: '0px', fontSize: '16px' }}>
              {equippedArmor.icon}
            </div>
          )}
        </div>
      </div>

      {/* Equipment display below map */}
      <div className="mt-3 flex justify-center gap-4">
        <div className="bg-gray-900/80 border border-cyan-800 rounded px-3 py-2 text-xs flex items-center gap-2">
          <span className="text-gray-400">Weapon:</span>
          {equippedWeapon ? (
            <>
              <span style={{ fontSize: '18px' }}>{equippedWeapon.icon}</span>
              <span className="text-cyan-400">{equippedWeapon.name}</span>
              <span className="text-red-400 text-xs">+{equippedWeapon.stats.attack} ATK</span>
            </>
          ) : (
            <span className="text-gray-600">None</span>
          )}
        </div>
        <div className="bg-gray-900/80 border border-cyan-800 rounded px-3 py-2 text-xs flex items-center gap-2">
          <span className="text-gray-400">Armor:</span>
          {equippedArmor ? (
            <>
              <span style={{ fontSize: '18px' }}>{equippedArmor.icon}</span>
              <span className="text-cyan-400">{equippedArmor.name}</span>
              <span className="text-teal-400 text-xs">+{equippedArmor.stats.defense} DEF</span>
            </>
          ) : (
            <span className="text-gray-600">None</span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
