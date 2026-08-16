"use client";
import { useEffect, useState } from "react";

const DIRS: { name: string; dx: number; dy: number }[] = [
  { name: "north", dx: 0, dy: -1 },
  { name: "north-east", dx: 0.7071, dy: -0.7071 },
  { name: "east", dx: 1, dy: 0 },
  { name: "south-east", dx: 0.7071, dy: 0.7071 },
  { name: "south", dx: 0, dy: 1 },
  { name: "south-west", dx: -0.7071, dy: 0.7071 },
  { name: "west", dx: -1, dy: 0 },
  { name: "north-west", dx: -0.7071, dy: -0.7071 },
];

function nearestDir(dx: number, dy: number) {
  const len = Math.hypot(dx, dy) || 1;
  const ndx = dx / len;
  const ndy = dy / len;
  let best = DIRS[0];
  let bestDot = -Infinity;
  for (const d of DIRS) {
    const dot = d.dx * ndx + d.dy * ndy;
    if (dot > bestDot) {
      bestDot = dot;
      best = d;
    }
  }
  return best;
}

const CHARACTERS = [
  { key: "legs", size: 620, attackPrefix: "shoot" },
  { key: "mech", size: 760, attackPrefix: "shoot" },
  { key: "berserker", size: 580, attackPrefix: "attack" },
];

const SPEED = 90; // px/sec
const TICK_MS = 120;
const SPAWN_CHECK_MS = 2500;
const FIGHT_RANGE = 480;
const ATTACK_DURATION = 1400;
const HURT_DURATION = 1400;
const FIGHT_COOLDOWN = 3000;

type BattleState = "walk" | "attack" | "hurt";

interface Wanderer {
  id: number;
  key: string;
  size: number;
  attackPrefix: string;
  x: number;
  y: number;
  dirName: string;
  vx: number;
  vy: number;
  state: BattleState;
  stateUntil: number;
  cooldownUntil: number;
}

let nextId = 0;

function spawnPosition(dir: { dx: number; dy: number }, vw: number, vh: number, size: number) {
  const margin = size;
  let x: number;
  let y: number;

  if (dir.dx > 0) x = -margin;
  else if (dir.dx < 0) x = vw + margin;
  else x = Math.random() * vw;

  if (dir.dy > 0) y = -margin;
  else if (dir.dy < 0) y = vh + margin;
  else y = Math.random() * vh;

  return { x, y };
}

function spriteSrc(w: Wanderer) {
  if (w.state === "walk") return `/sprites/wander-${w.key}-${w.dirName}.gif`;
  if (w.state === "attack") return `/sprites/${w.attackPrefix}-${w.key}-${w.dirName}.gif`;
  return `/sprites/hurt-${w.key}-${w.dirName}.gif`;
}

export default function WanderingSprites() {
  const [wanderers, setWanderers] = useState<Wanderer[]>([]);

  useEffect(() => {
    let cancelled = false;

    const trySpawn = () => {
      if (cancelled) return;
      setWanderers((prev) => {
        const activeKeys = new Set(prev.map((w) => w.key));
        const available = CHARACTERS.filter((c) => !activeKeys.has(c.key));
        if (available.length === 0) return prev;

        const char = available[Math.floor(Math.random() * available.length)];
        const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        const { x, y } = spawnPosition(dir, window.innerWidth, window.innerHeight, char.size);

        const w: Wanderer = {
          id: nextId++,
          key: char.key,
          size: char.size,
          attackPrefix: char.attackPrefix,
          x,
          y,
          dirName: dir.name,
          vx: dir.dx * SPEED,
          vy: dir.dy * SPEED,
          state: "walk",
          stateUntil: 0,
          cooldownUntil: 0,
        };
        return [...prev, w];
      });
    };

    const tick = () => {
      if (cancelled) return;
      const now = Date.now();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setWanderers((prev) => {
        let next = prev.map((w) => ({ ...w }));

        for (const w of next) {
          if (w.state === "walk") {
            w.x += w.vx * (TICK_MS / 1000);
            w.y += w.vy * (TICK_MS / 1000);
          } else if (now >= w.stateUntil) {
            const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
            w.state = "walk";
            w.dirName = dir.name;
            w.vx = dir.dx * SPEED;
            w.vy = dir.dy * SPEED;
            w.cooldownUntil = now + FIGHT_COOLDOWN;
          }
        }

        next = next.filter((w) => {
          const margin = w.size * 2;
          return !(w.state === "walk" && (w.x < -margin || w.x > vw + margin || w.y < -margin || w.y > vh + margin));
        });

        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i];
            const b = next[j];
            if (a.state !== "walk" || b.state !== "walk") continue;
            if (now < a.cooldownUntil || now < b.cooldownUntil) continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            if (Math.hypot(dx, dy) < FIGHT_RANGE) {
              const dAB = nearestDir(dx, dy);
              const dBA = nearestDir(-dx, -dy);
              a.state = "attack";
              a.dirName = dAB.name;
              a.vx = 0;
              a.vy = 0;
              a.stateUntil = now + ATTACK_DURATION;
              b.state = "hurt";
              b.dirName = dBA.name;
              b.vx = 0;
              b.vy = 0;
              b.stateUntil = now + HURT_DURATION;
            }
          }
        }

        return next;
      });
    };

    trySpawn();
    const spawnTimer = setInterval(trySpawn, SPAWN_CHECK_MS);
    const tickTimer = setInterval(tick, TICK_MS);

    return () => {
      cancelled = true;
      clearInterval(spawnTimer);
      clearInterval(tickTimer);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {wanderers.map((w) => (
        <img
          key={w.id}
          src={spriteSrc(w)}
          alt=""
          style={{
            position: "absolute",
            left: `${w.x}px`,
            top: `${w.y}px`,
            width: `${w.size}px`,
            height: "auto",
            imageRendering: "pixelated",
            transition: "left 0.12s linear, top 0.12s linear",
          }}
        />
      ))}
    </div>
  );
}
