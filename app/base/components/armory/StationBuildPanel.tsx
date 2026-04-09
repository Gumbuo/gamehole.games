"use client";

import React, { useState } from "react";
import { ArmorySaveState, StationId } from "./types";
import { STATIONS } from "./data/stations";
import { BLUEPRINTS, countRequiredSlots, countFilledSlots } from "./data/blueprints";
import { MATERIAL_NAMES, MATERIAL_ICONS, THEME } from "./constants";

interface StationBuildPanelProps {
  stationId: StationId;
  saveState: ArmorySaveState;
  onPlaceResource: (stationId: StationId, row: number, col: number) => Promise<void>;
  onClose: () => void;
}

export default function StationBuildPanel({
  stationId,
  saveState,
  onPlaceResource,
  onClose,
}: StationBuildPanelProps) {
  const [placing, setPlacing] = useState<string | null>(null);

  const station = STATIONS[stationId];
  const blueprint = BLUEPRINTS[stationId];
  const buildGrid = saveState.stationBuilds?.[stationId] ?? Array(4).fill(null).map(() => Array(4).fill(false));
  const filled = countFilledSlots(blueprint, buildGrid);
  const required = countRequiredSlots(blueprint);
  const pct = required > 0 ? (filled / required) * 100 : 0;

  const handlePlace = async (row: number, col: number) => {
    const resource = blueprint.grid[row][col];
    if (!resource) return;
    if (buildGrid[row]?.[col]) return;
    const have = (saveState.resources as unknown as Record<string, number>)[resource] ?? 0;
    if (have < 1) return;

    const key = `${row}-${col}`;
    setPlacing(key);
    try {
      await onPlaceResource(stationId, row, col);
    } finally {
      setPlacing(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: THEME.colors.background,
          border: `2px solid ${THEME.colors.primary}`,
          borderRadius: 12,
          padding: 28,
          width: 480,
          maxWidth: "95vw",
          boxShadow: THEME.shadows.glowStrong,
          fontFamily: "Orbitron, monospace",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, color: THEME.colors.primary, marginBottom: 4 }}>
              🔨 Build {station.name}
            </div>
            <div style={{ fontSize: 11, color: THEME.colors.text, maxWidth: 360, lineHeight: 1.5 }}>
              {blueprint.description}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${THEME.colors.secondary}`,
              color: THEME.colors.text,
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "Orbitron, monospace",
              fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: THEME.colors.text, marginBottom: 6 }}>
            <span>BUILD PROGRESS</span>
            <span style={{ color: pct === 100 ? THEME.colors.success : THEME.colors.primary }}>
              {filled} / {required} slots
            </span>
          </div>
          <div style={{ background: "#1a1a2e", borderRadius: 4, height: 10, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: pct === 100 ? THEME.colors.success : `linear-gradient(90deg, ${THEME.colors.secondary}, ${THEME.colors.primary})`,
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* 4×4 Build Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {blueprint.grid.map((rowCells, r) =>
            rowCells.map((cell, c) => {
              const isFilled = buildGrid[r]?.[c] === true;
              const isRequired = cell !== null;
              const have = isRequired ? ((saveState.resources as unknown as Record<string, number>)[cell] ?? 0) : 0;
              const canPlace = isRequired && !isFilled && have >= 1;
              const isPlacing = placing === `${r}-${c}`;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => canPlace && handlePlace(r, c)}
                  disabled={!canPlace || isPlacing}
                  style={{
                    aspectRatio: "1",
                    border: isFilled
                      ? `2px solid ${THEME.colors.success}`
                      : isRequired
                        ? canPlace
                          ? `2px solid ${THEME.colors.primary}`
                          : `2px solid #444`
                        : `2px solid #1a1a2e`,
                    borderRadius: 8,
                    background: isFilled
                      ? "rgba(74, 222, 128, 0.15)"
                      : isRequired
                        ? canPlace
                          ? "rgba(102, 252, 241, 0.08)"
                          : "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.2)",
                    cursor: canPlace ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    padding: 4,
                    transition: "all 0.15s",
                    opacity: isPlacing ? 0.6 : 1,
                    fontFamily: "Orbitron, monospace",
                  }}
                  title={isRequired ? (isFilled ? `✓ ${MATERIAL_NAMES[cell!]}` : `${MATERIAL_NAMES[cell!]} (have: ${have})`) : ""}
                >
                  {isRequired ? (
                    <>
                      <span style={{ fontSize: 20 }}>
                        {isFilled ? "✅" : MATERIAL_ICONS[cell!]}
                      </span>
                      <span style={{ fontSize: 7, color: isFilled ? THEME.colors.success : have > 0 ? THEME.colors.primary : "#666", textAlign: "center", lineHeight: 1.2 }}>
                        {isFilled ? "PLACED" : `${have} avail`}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 10, color: "#333" }}>—</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Materials needed summary */}
        <div style={{ borderTop: `1px solid #2a2a3e`, paddingTop: 14 }}>
          <div style={{ fontSize: 10, color: THEME.colors.text, marginBottom: 10 }}>MATERIALS NEEDED</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(() => {
              const needed: Record<string, { count: number; have: number }> = {};
              blueprint.grid.flat().forEach(cell => {
                if (!cell) return;
                if (!needed[cell]) {
                  needed[cell] = {
                    count: 0,
                    have: (saveState.resources as unknown as Record<string, number>)[cell] ?? 0,
                  };
                }
                needed[cell].count++;
              });
              return Object.entries(needed).map(([res, { count, have }]) => {
                // Count how many of this resource are already placed
                let placed = 0;
                blueprint.grid.forEach((rowCells, r) =>
                  rowCells.forEach((cell, c) => {
                    if (cell === res && buildGrid[r]?.[c]) placed++;
                  })
                );
                const stillNeeded = count - placed;
                const ok = have >= stillNeeded;
                return (
                  <div
                    key={res}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${ok || stillNeeded === 0 ? THEME.colors.success : "#444"}`,
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                    }}
                  >
                    <span>{MATERIAL_ICONS[res as keyof typeof MATERIAL_ICONS]}</span>
                    <span style={{ color: THEME.colors.text }}>{MATERIAL_NAMES[res as keyof typeof MATERIAL_NAMES]}</span>
                    <span style={{ color: stillNeeded === 0 ? THEME.colors.success : ok ? THEME.colors.primary : THEME.colors.error }}>
                      {stillNeeded === 0 ? "✓" : `${have}/${stillNeeded}`}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {pct === 100 && (
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              color: THEME.colors.success,
              fontSize: 14,
              padding: "10px",
              border: `1px solid ${THEME.colors.success}`,
              borderRadius: 8,
              background: "rgba(74, 222, 128, 0.1)",
            }}
          >
            ✅ {station.name} is fully built and operational!
          </div>
        )}
      </div>
    </div>
  );
}
