"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Crop Data ──────────────────────────────────────────────────────────────────
interface Crop {
  name: string;
  growthMinutes: number;
  growthLabel: string;
  color: string;
}

const CROPS: Crop[] = [
  { name: "Carrot",        growthMinutes: 1,    growthLabel: "1 min",   color: "#ff8c42" },
  { name: "Cucumber",      growthMinutes: 5,    growthLabel: "5 min",   color: "#7bc67e" },
  { name: "Fern",          growthMinutes: 30,   growthLabel: "30 min",  color: "#2d8a4e" },
  { name: "Tomato",        growthMinutes: 120,  growthLabel: "2 hr",    color: "#e63946" },
  { name: "Cotton",        growthMinutes: 120,  growthLabel: "2 hr",    color: "#f0e6d3" },
  { name: "Potato",        growthMinutes: 180,  growthLabel: "3 hr",    color: "#c9a96e" },
  { name: "Grapes",        growthMinutes: 180,  growthLabel: "3 hr",    color: "#9b59b6" },
  { name: "Pumpkin",       growthMinutes: 240,  growthLabel: "4 hr",    color: "#e67e22" },
  { name: "Red Flower",    growthMinutes: 240,  growthLabel: "4 hr",    color: "#e74c3c" },
  { name: "Yellow Flower", growthMinutes: 240,  growthLabel: "4 hr",    color: "#f1c40f" },
  { name: "Blue Flower",   growthMinutes: 240,  growthLabel: "4 hr",    color: "#3498db" },
  { name: "Wheat",         growthMinutes: 1440, growthLabel: "24 hr",   color: "#d4a847" },
];

const SOIL_PER_TILE = 32;
const MIN_YIELD = 4;
const MAX_YIELD = 8;
const AVG_YIELD = 6;

export default function FarmCalculatorPage() {
  const [selectedCrop, setSelectedCrop] = useState(0);
  const [targetItems, setTargetItems] = useState(1000);
  const [timeframeHours, setTimeframeHours] = useState(24);
  const [ownedTiles, setOwnedTiles] = useState(2);

  const crop = CROPS[selectedCrop];

  // Harvests per timeframe
  const totalMinutes = timeframeHours * 60;
  const harvestsPerPlot = Math.floor(totalMinutes / crop.growthMinutes);

  // Yields per soil per timeframe
  const minPerSoil = harvestsPerPlot * MIN_YIELD;
  const avgPerSoil = harvestsPerPlot * AVG_YIELD;
  const maxPerSoil = harvestsPerPlot * MAX_YIELD;

  // Yields per tile per timeframe
  const minPerTile = minPerSoil * SOIL_PER_TILE;
  const avgPerTile = avgPerSoil * SOIL_PER_TILE;
  const maxPerTile = maxPerSoil * SOIL_PER_TILE;

  // Soil needed
  const soilMin = maxPerSoil > 0 ? Math.ceil(targetItems / maxPerSoil) : Infinity;
  const soilAvg = avgPerSoil > 0 ? Math.ceil(targetItems / avgPerSoil) : Infinity;
  const soilMax = minPerSoil > 0 ? Math.ceil(targetItems / minPerSoil) : Infinity;

  // Tiles needed
  const tilesMin = Math.ceil(soilMin / SOIL_PER_TILE);
  const tilesAvg = Math.ceil(soilAvg / SOIL_PER_TILE);
  const tilesMax = Math.ceil(soilMax / SOIL_PER_TILE);

  const fmt = (n: number) => (n === Infinity ? "—" : n.toLocaleString());

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b0c10",
        fontFamily: "Orbitron, sans-serif",
        color: "#66fcf1",
        overflowX: "hidden",
        paddingBottom: "60px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          borderBottom: "2px solid #4ade80",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#45a29e",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: "bold",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          &larr; GAME HOLE
        </Link>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#c5c6c7",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          NomStead Farm Calculator
        </span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 16px" }}>
        {/* Title */}
        <h1
          style={{
            fontSize: "1.8rem",
            textAlign: "center",
            textShadow: "0 0 15px #4ade80",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "8px",
            color: "#4ade80",
          }}
        >
          Farm Yield Calculator
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#c5c6c7",
            fontSize: "0.8rem",
            lineHeight: "1.7",
            maxWidth: "600px",
            margin: "0 auto 30px auto",
          }}
        >
          Figure out how many tiles and soil plots you need to hit your target.
          Each soil holds 1 plant. Each tile holds 32 soil. Plants yield 4–8 items per harvest.
        </p>

        {/* ── Controls Row ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Target items */}
          <div
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "2px solid #45a29e",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "#c5c6c7",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Target Items
            </label>
            <input
              type="number"
              value={targetItems}
              onChange={(e) => setTargetItems(Math.max(1, Number(e.target.value)))}
              min={1}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #45a29e",
                borderRadius: "8px",
                color: "#4ade80",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.2rem",
                fontWeight: "bold",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Timeframe */}
          <div
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "2px solid #45a29e",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "0.7rem",
                color: "#c5c6c7",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Timeframe (hours)
            </label>
            <input
              type="number"
              value={timeframeHours}
              onChange={(e) => setTimeframeHours(Math.max(1, Number(e.target.value)))}
              min={1}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #45a29e",
                borderRadius: "8px",
                color: "#4ade80",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1.2rem",
                fontWeight: "bold",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* ── Crop Selector ─────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "2px solid #45a29e",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.7rem",
              color: "#c5c6c7",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Select Crop
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "8px",
            }}
          >
            {CROPS.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setSelectedCrop(i)}
                style={{
                  padding: "10px 8px",
                  background:
                    i === selectedCrop
                      ? `${c.color}30`
                      : "rgba(0,0,0,0.4)",
                  border: `2px solid ${i === selectedCrop ? c.color : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "8px",
                  color: i === selectedCrop ? c.color : "#888",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                <div>{c.name}</div>
                <div
                  style={{
                    fontSize: "0.55rem",
                    color: i === selectedCrop ? c.color : "#666",
                    marginTop: "4px",
                  }}
                >
                  {c.growthLabel}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            border: `2px solid ${crop.color}`,
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              color: crop.color,
              fontSize: "1.1rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 0,
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            {crop.name}
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#c5c6c7",
              fontSize: "0.7rem",
              marginBottom: "20px",
            }}
          >
            {fmt(targetItems)} items in {timeframeHours}h — {harvestsPerPlot} harvest
            {harvestsPerPlot !== 1 ? "s" : ""} per soil
          </p>

          {/* 3 scenario columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Best case */}
            <div
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                border: "1px solid #4ade8040",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#4ade80",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Best Case (8/plant)
              </div>
              <div
                style={{
                  fontSize: "1.6rem",
                  color: "#4ade80",
                  fontWeight: "bold",
                }}
              >
                {fmt(tilesMin)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "4px" }}>
                tile{tilesMin !== 1 ? "s" : ""}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#4ade80",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {fmt(soilMin)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888" }}>soil plots</div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#666",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "8px",
                }}
              >
                {fmt(maxPerTile)}/tile/{timeframeHours}h
              </div>
            </div>

            {/* Average case */}
            <div
              style={{
                background: "rgba(0, 212, 255, 0.08)",
                border: "2px solid #00d4ff80",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#00d4ff",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Average (6/plant)
              </div>
              <div
                style={{
                  fontSize: "1.6rem",
                  color: "#00d4ff",
                  fontWeight: "bold",
                }}
              >
                {fmt(tilesAvg)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "4px" }}>
                tile{tilesAvg !== 1 ? "s" : ""}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#00d4ff",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {fmt(soilAvg)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888" }}>soil plots</div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#666",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "8px",
                }}
              >
                {fmt(avgPerTile)}/tile/{timeframeHours}h
              </div>
            </div>

            {/* Worst case */}
            <div
              style={{
                background: "rgba(231, 76, 60, 0.08)",
                border: "1px solid #e74c3c40",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#e74c3c",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                Worst Case (4/plant)
              </div>
              <div
                style={{
                  fontSize: "1.6rem",
                  color: "#e74c3c",
                  fontWeight: "bold",
                }}
              >
                {fmt(tilesMax)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888", marginTop: "4px" }}>
                tile{tilesMax !== 1 ? "s" : ""}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#e74c3c",
                  fontWeight: "bold",
                  marginTop: "8px",
                }}
              >
                {fmt(soilMax)}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#888" }}>soil plots</div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#666",
                  marginTop: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "8px",
                }}
              >
                {fmt(minPerTile)}/tile/{timeframeHours}h
              </div>
            </div>
          </div>

          {/* Quick math breakdown */}
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              borderRadius: "10px",
              padding: "14px 16px",
              fontSize: "0.68rem",
              color: "#c5c6c7",
              lineHeight: "1.8",
            }}
          >
            <div style={{ color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", fontSize: "0.6rem" }}>
              Breakdown
            </div>
            <div>
              Growth time: <strong style={{ color: crop.color }}>{crop.growthLabel}</strong>
            </div>
            <div>
              Harvests in {timeframeHours}h: <strong style={{ color: "#fff" }}>{harvestsPerPlot}</strong> per soil plot
            </div>
            <div>
              Yield per soil: <strong style={{ color: "#4ade80" }}>{fmt(maxPerSoil)}</strong> best / <strong style={{ color: "#00d4ff" }}>{fmt(avgPerSoil)}</strong> avg / <strong style={{ color: "#e74c3c" }}>{fmt(minPerSoil)}</strong> worst
            </div>
            <div>
              Yield per tile (32 soil): <strong style={{ color: "#4ade80" }}>{fmt(maxPerTile)}</strong> best / <strong style={{ color: "#00d4ff" }}>{fmt(avgPerTile)}</strong> avg / <strong style={{ color: "#e74c3c" }}>{fmt(minPerTile)}</strong> worst
            </div>
          </div>
        </div>

        {/* ── All Crops Quick Reference ─────────────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "2px solid #45a29e",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              color: "#66fcf1",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 0,
              marginBottom: "14px",
            }}
          >
            All Crops — {fmt(targetItems)} items in {timeframeHours}h (avg yield)
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.68rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #45a29e",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px", color: "#888" }}>Crop</th>
                  <th style={{ padding: "8px", color: "#888" }}>Growth</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Harvests</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Avg/Soil</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Avg/Tile</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Soil Needed</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Tiles Needed</th>
                </tr>
              </thead>
              <tbody>
                {CROPS.map((c) => {
                  const harv = Math.floor(totalMinutes / c.growthMinutes);
                  const avg = harv * AVG_YIELD;
                  const avgTile = avg * SOIL_PER_TILE;
                  const soil = avg > 0 ? Math.ceil(targetItems / avg) : Infinity;
                  const tiles = Math.ceil(soil / SOIL_PER_TILE);
                  return (
                    <tr
                      key={c.name}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background:
                          c.name === crop.name
                            ? `${c.color}15`
                            : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px", color: c.color, fontWeight: "bold" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "8px", color: "#c5c6c7" }}>
                        {c.growthLabel}
                      </td>
                      <td style={{ padding: "8px", color: "#fff", textAlign: "right" }}>{harv}</td>
                      <td style={{ padding: "8px", color: "#00d4ff", textAlign: "right" }}>{fmt(avg)}</td>
                      <td style={{ padding: "8px", color: "#00d4ff", textAlign: "right" }}>{fmt(avgTile)}</td>
                      <td style={{ padding: "8px", color: "#ffd700", textAlign: "right", fontWeight: "bold" }}>{fmt(soil)}</td>
                      <td style={{ padding: "8px", color: "#4ade80", textAlign: "right", fontWeight: "bold" }}>{fmt(tiles)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Max Production Section ────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "2px solid #ffd700",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "30px",
          }}
        >
          <h3
            style={{
              color: "#ffd700",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 0,
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            Max Production
          </h3>
          <p
            style={{
              textAlign: "center",
              color: "#c5c6c7",
              fontSize: "0.75rem",
              marginBottom: "16px",
            }}
          >
            How much can you produce with what you have?
          </p>

          {/* Tile input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                fontSize: "0.7rem",
                color: "#c5c6c7",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              My Tiles:
            </label>
            <input
              type="number"
              value={ownedTiles}
              onChange={(e) => setOwnedTiles(Math.max(1, Number(e.target.value)))}
              min={1}
              style={{
                width: "80px",
                padding: "8px 10px",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #ffd700",
                borderRadius: "8px",
                color: "#ffd700",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "1rem",
                fontWeight: "bold",
                textAlign: "center",
              }}
            />
            <span style={{ fontSize: "0.7rem", color: "#888" }}>
              = {(ownedTiles * SOIL_PER_TILE).toLocaleString()} soil
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.68rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #ffd700",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px", color: "#888" }}>Crop</th>
                  <th style={{ padding: "8px", color: "#888" }}>Growth</th>
                  <th style={{ padding: "8px", color: "#888", textAlign: "right" }}>Harvests/{timeframeHours}h</th>
                  <th style={{ padding: "8px", color: "#e74c3c", textAlign: "right" }}>Worst (4)</th>
                  <th style={{ padding: "8px", color: "#00d4ff", textAlign: "right" }}>Average (6)</th>
                  <th style={{ padding: "8px", color: "#4ade80", textAlign: "right" }}>Best (8)</th>
                </tr>
              </thead>
              <tbody>
                {CROPS.map((c) => {
                  const totalSoil = ownedTiles * SOIL_PER_TILE;
                  const harv = Math.floor(totalMinutes / c.growthMinutes);
                  const worst = totalSoil * harv * MIN_YIELD;
                  const avg = totalSoil * harv * AVG_YIELD;
                  const best = totalSoil * harv * MAX_YIELD;
                  return (
                    <tr
                      key={c.name}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background:
                          c.name === crop.name
                            ? `${c.color}15`
                            : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px", color: c.color, fontWeight: "bold" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "8px", color: "#c5c6c7" }}>
                        {c.growthLabel}
                      </td>
                      <td style={{ padding: "8px", color: "#fff", textAlign: "right" }}>{harv}</td>
                      <td style={{ padding: "8px", color: "#e74c3c", textAlign: "right" }}>
                        {worst.toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", color: "#00d4ff", textAlign: "right", fontWeight: "bold" }}>
                        {avg.toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", color: "#4ade80", textAlign: "right" }}>
                        {best.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
