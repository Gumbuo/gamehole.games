"use client";
import { useMemo, useState } from "react";
import type { PlayerSave, OperativeCard, TerritoryTileState } from "./types";
import {
  THEME,
  TERRITORY_TILES,
  TERRITORY_MAX_GARRISON,
  DISTRICTS,
  ROLES,
  RARITIES,
  axialToPixel,
  effectiveStats,
  garrisonPower,
} from "./data";

const HEX_SIZE = 52;

function shortName(name: string): string {
  return name.length > 11 ? name.slice(0, 10) + "…" : name;
}

function hexPoints(cx: number, cy: number, size: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90);
    return `${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`;
  }).join(" ");
}

function fmtCash(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtDuration(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default function TerritoryMap({
  save,
  walletAddress,
  tiles,
  now,
  busy,
  onGarrison,
  onAttack,
  onRecall,
  onCollect,
}: {
  save: PlayerSave;
  walletAddress: string;
  tiles: TerritoryTileState[] | null;
  now: number;
  busy: boolean;
  onGarrison: (tileId: string, operativeIds: string[]) => void;
  onAttack: (tileId: string, operativeIds: string[]) => void;
  onRecall: (tileId: string) => void;
  onCollect: (tileId: string) => void;
}) {
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const tileStateById = useMemo(() => {
    const map: Record<string, TerritoryTileState> = {};
    for (const t of tiles || []) map[t.id] = t;
    return map;
  }, [tiles]);

  const layout = useMemo(() => {
    const points = TERRITORY_TILES.map((def) => ({ def, ...axialToPixel(def.q, def.r, HEX_SIZE) }));
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const pad = HEX_SIZE * 1.4;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) - pad + pad * 2;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) - pad + pad * 2;
    return { points, minX, minY, width: maxX - minX, height: maxY - minY };
  }, []);

  const selectedDef = TERRITORY_TILES.find((t) => t.id === selectedTileId) || null;
  const selectedState = selectedTileId ? tileStateById[selectedTileId] : null;
  const district = selectedDef?.districtId ? DISTRICTS.find((d) => d.id === selectedDef.districtId) : null;

  const idleOperatives = save.operatives.filter((o) => o.status === "idle");
  const pickedCrew = picked.map((id) => save.operatives.find((o) => o.id === id)).filter(Boolean) as OperativeCard[];
  const pickedPower = garrisonPower(pickedCrew);

  const closePanel = () => {
    setSelectedTileId(null);
    setPicked([]);
  };

  const togglePick = (id: string) => {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= TERRITORY_MAX_GARRISON) return p;
      return [...p, id];
    });
  };

  const isMine = (state: TerritoryTileState | undefined) => !!state && state.controlledBy === walletAddress;
  const isEnemy = (state: TerritoryTileState | undefined) => !!state && !!state.controlledBy && state.controlledBy !== walletAddress;

  return (
    <div>
      <h2 style={{ fontFamily: THEME.font, color: THEME.accent, fontSize: 18, marginBottom: 6 }}>Territory</h2>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 14 }}>
        Shared across every Family. Click a tile to garrison, attack, or collect.
      </p>

      <div
        style={{
          overflow: "auto",
          border: `1px solid ${THEME.accent}66`,
          background: "#0a0808",
          padding: 10,
        }}
      >
        <svg width={Math.max(360, layout.width)} height={Math.max(360, layout.height)} viewBox={`${layout.minX} ${layout.minY} ${layout.width} ${layout.height}`}>
          <defs>
            {layout.points
              .filter(({ def }) => def.image)
              .map(({ def, x, y }) => (
                <pattern
                  key={def.id}
                  id={`tile-art-${def.id}`}
                  patternUnits="userSpaceOnUse"
                  x={x - HEX_SIZE}
                  y={y - HEX_SIZE}
                  width={HEX_SIZE * 2}
                  height={HEX_SIZE * 2}
                >
                  <image href={def.image} x={0} y={0} width={HEX_SIZE * 2} height={HEX_SIZE * 2} preserveAspectRatio="xMidYMid slice" />
                </pattern>
              ))}
          </defs>
          {layout.points.map(({ def, x, y }) => {
            const state = tileStateById[def.id];
            const mine = isMine(state);
            const enemy = isEnemy(state);
            const shielded = !!state && now < state.shieldUntil;
            // Tint sits on top of tile art to show ownership — kept light when
            // art is present so the art stays visible, not just a color wash.
            const tintAlpha = def.image ? 0.18 : 0.35;
            const fill = mine
              ? `rgba(212,175,55,${tintAlpha})`
              : enemy
              ? `rgba(201,48,44,${tintAlpha})`
              : def.image
              ? "rgba(0,0,0,0)"
              : "rgba(120,120,120,0.15)";
            const stroke = mine ? "#d4af37" : enemy ? "#c9302c" : "#555";
            const locked = save.reputation < Math.max(def.repRequired, district_rep(def));
            return (
              <g key={def.id} onClick={() => !locked && setSelectedTileId(def.id)} style={{ cursor: locked ? "not-allowed" : "pointer" }} opacity={locked ? (def.image ? 0.6 : 0.35) : 1}>
                <polygon
                  points={hexPoints(x, y, HEX_SIZE - 2)}
                  fill={def.image ? `url(#tile-art-${def.id})` : fill}
                  stroke={selectedTileId === def.id ? "#fff" : stroke}
                  strokeWidth={selectedTileId === def.id ? 3 : 2}
                />
                {def.image && (
                  <polygon points={hexPoints(x, y, HEX_SIZE - 2)} fill={fill} style={{ pointerEvents: "none" }} />
                )}
                <text x={x} y={y - 4} textAnchor="middle" fontSize={8} fontFamily={THEME.font} fill="#fff" style={{ pointerEvents: "none" }}>
                  {shortName(def.name)}
                </text>
                {locked ? (
                  <text x={x} y={y + 12} textAnchor="middle" fontSize={11} style={{ pointerEvents: "none" }}>
                    🔒
                  </text>
                ) : (
                  state?.controlledBy && (
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      fontSize={8}
                      fontFamily={THEME.bodyFont}
                      fill={mine ? "#f5d76e" : "#ff9f9f"}
                      style={{ pointerEvents: "none" }}
                    >
                      {(mine ? "YOU" : `${state.controlledBy.slice(0, 4)}…`) + (shielded ? " 🛡" : "")}
                    </text>
                  )
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {selectedDef && selectedState && (
        <div
          onClick={closePanel}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0808",
              border: `1px solid ${THEME.accent}88`,
              padding: 24,
              width: "92vw",
              maxWidth: 1100,
              height: "88vh",
              maxHeight: 780,
              overflowY: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 28,
              alignContent: "flex-start",
            }}
          >
            {selectedDef.image && (
              <div style={{ flex: "1 1 380px", minHeight: 260, maxHeight: "60vh", borderRadius: 10, overflow: "hidden", border: `1px solid ${THEME.secondary}` }}>
                <img
                  src={selectedDef.image}
                  alt={selectedDef.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }}
                />
              </div>
            )}

            <div style={{ flex: "2 1 420px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontFamily: THEME.font, color: THEME.accent, fontSize: 28 }}>{selectedDef.name}</div>
                  <div style={{ fontSize: 14, color: "#999" }}>{district ? district.name : "The City"}</div>
                </div>
                <button onClick={closePanel} style={{ background: "none", border: "none", color: "#999", fontSize: 22, cursor: "pointer" }}>
                  ✕
                </button>
              </div>
              <p style={{ fontSize: 14, color: "#999", margin: "12px 0" }}>{selectedDef.description}</p>

              <div style={{ fontSize: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <span>
                  Controlled by:{" "}
                  <strong style={{ color: isMine(selectedState) ? "#f5d76e" : selectedState.controlledBy ? "#ff9f9f" : "#4ade80" }}>
                    {isMine(selectedState) ? "You" : selectedState.controlledBy ? `${selectedState.controlledBy.slice(0, 4)}…${selectedState.controlledBy.slice(-4)}` : "Unclaimed"}
                  </strong>
                </span>
                {selectedState.controlledBy && <span>Garrison power: {Math.round(selectedState.garrisonPower)}</span>}
                {now < selectedState.shieldUntil && <span style={{ color: "#60a5fa" }}>Shielded for {fmtDuration(selectedState.shieldUntil - now)}</span>}
                <span style={{ color: THEME.accent }}>{selectedDef.baseRatePerHour}/hr while held</span>
              </div>

              {isMine(selectedState) ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <ActionButton disabled={busy} onClick={() => onCollect(selectedDef.id)}>
                    COLLECT INCOME
                  </ActionButton>
                  <ActionButton disabled={busy} onClick={() => onRecall(selectedDef.id)}>
                    RECALL GARRISON
                  </ActionButton>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "#999", margin: "10px 0 8px" }}>
                    {selectedState.controlledBy ? "Pick up to 3 operatives to attack:" : "Pick up to 3 operatives to garrison:"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                    {idleOperatives.length === 0 && <span style={{ fontSize: 13, color: "#666" }}>No idle operatives available.</span>}
                    {idleOperatives.map((op) => {
                      const rarity = RARITIES[op.rarity];
                      const checked = picked.includes(op.id);
                      return (
                        <label key={op.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={checked} onChange={() => togglePick(op.id)} />
                          <span style={{ color: rarity.color }}>{op.name}</span>
                          <span style={{ color: "#888" }}>
                            {ROLES[op.role].label} · PWR {effectiveStats(op).power}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {picked.length > 0 && (
                    <div style={{ fontSize: 13, color: THEME.accent, margin: "10px 0" }}>Combined power: ~{Math.round(pickedPower)}</div>
                  )}
                  <div style={{ marginTop: 12 }}>
                    {selectedState.controlledBy ? (
                      <ActionButton
                        disabled={busy || picked.length === 0 || now < selectedState.shieldUntil}
                        onClick={() => {
                          onAttack(selectedDef.id, picked);
                          closePanel();
                        }}
                      >
                        {now < selectedState.shieldUntil ? "SHIELDED" : "ATTACK"}
                      </ActionButton>
                    ) : (
                      <ActionButton
                        disabled={busy || picked.length === 0}
                        onClick={() => {
                          onGarrison(selectedDef.id, picked);
                          closePanel();
                        }}
                      >
                        GARRISON
                      </ActionButton>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function district_rep(def: (typeof TERRITORY_TILES)[number]): number {
  if (!def.districtId) return 0;
  return DISTRICTS.find((d) => d.id === def.districtId)?.repRequired ?? 0;
}

function ActionButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        padding: "10px 16px",
        border: "none",
        borderRadius: 4,
        background: "url(/underworld/ui/button-frame-v2.png) center / 100% 100% no-repeat",
        color: disabled ? "#999" : "#fff",
        fontFamily: THEME.font,
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: 0.5,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
