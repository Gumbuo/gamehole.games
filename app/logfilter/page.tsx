"use client";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";

const GUILD_MEMBERS = [
  "wiseman89", "steemit", "Jamie", "khan", "Alstar",
  "Kirk", "Reixhm89", "GoldenDragonfly", "centelha", "NomStead",
];

const THEME = {
  bg: "#0b0c10",
  headerGradient: "linear-gradient(to bottom, #1f2833, #0b0c10)",
  primary: "#66fcf1",
  secondary: "#45a29e",
  accent: "#4ade80",
  cardBg: "rgba(31, 40, 51, 0.8)",
  font: "Orbitron, sans-serif",
  textMuted: "#c5c6c7",
};

// ── Parser ────────────────────────────────────────────────────────────────────
interface ParsedRow {
  player: string;
  action: string;
  details: string;
  time: string;
  raw: string;
}

const TIME_PATTERNS = [
  /\b(just now)\s*$/i,
  /\b(a moment ago)\s*$/i,
  /\b(about \d+ seconds? ago)\s*$/i,
  /\b(about \d+ minutes? ago)\s*$/i,
  /\b(about \d+ hours? ago)\s*$/i,
  /\b(about \d+ days? ago)\s*$/i,
  /\b(\d+ seconds? ago)\s*$/i,
  /\b(\d+ minutes? ago)\s*$/i,
  /\b(\d+ hours? ago)\s*$/i,
  /\b(\d+ days? ago)\s*$/i,
  /\b(yesterday)\s*$/i,
];

const ACTION_WORDS = [
  "received", "harvested", "planted", "crafted", "collected",
  "built", "placed", "completed", "bought", "sold", "traded",
  "earned", "gained", "found", "obtained", "used", "consumed",
];

function parseLine(line: string): ParsedRow {
  let rest = line.trim();
  let time = "";
  let player = "";
  let action = "";

  // Extract time from end
  for (const pat of TIME_PATTERNS) {
    const m = rest.match(pat);
    if (m) {
      time = m[1];
      rest = rest.slice(0, rest.length - m[0].length).trim();
      break;
    }
  }

  // Extract player from start (guild member match first, then first word)
  const lowerRest = rest.toLowerCase();
  const memberMatch = GUILD_MEMBERS.find((m) => lowerRest.startsWith(m.toLowerCase()));
  if (memberMatch) {
    player = memberMatch;
    rest = rest.slice(memberMatch.length).trim();
  } else {
    // First word as player if it looks like a name (starts with capital or has no spaces before action word)
    const firstWord = rest.split(/\s+/)[0];
    const actionIdx = rest.toLowerCase().split(/\s+/).findIndex((w) => ACTION_WORDS.includes(w));
    if (actionIdx > 0) {
      player = rest.split(/\s+/).slice(0, actionIdx).join(" ");
      rest = rest.split(/\s+/).slice(actionIdx).join(" ");
    } else if (/^[A-Z]/.test(firstWord)) {
      player = firstWord;
      rest = rest.slice(firstWord.length).trim();
    }
  }

  // Extract action word
  const words = rest.split(/\s+/);
  const actionWordIdx = words.findIndex((w) => ACTION_WORDS.includes(w.toLowerCase()));
  if (actionWordIdx !== -1) {
    action = words[actionWordIdx];
    rest = words.filter((_, i) => i !== actionWordIdx).join(" ");
  }

  return { player, action, details: rest, time, raw: line };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LogFilterPage() {
  const [rawText, setRawText]         = useState("");
  const [lines, setLines]             = useState<string[]>([]);
  const [filterInput, setFilterInput] = useState("");
  const [filters, setFilters]         = useState<string[]>([]);
  const [copied, setCopied]           = useState(false);
  const [loaded, setLoaded]           = useState(false);
  const [viewMode, setViewMode]       = useState<"list" | "table">("list");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  function load() {
    const ls = rawText.split("\n").filter((l) => l.trim() !== "");
    setLines(ls);
    setLoaded(true);
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  function addFilter() {
    const val = filterInput.trim();
    if (val && !filters.includes(val.toLowerCase())) {
      setFilters((f) => [...f, val.toLowerCase()]);
    }
    setFilterInput("");
    inputRef.current?.focus();
  }

  function removeFilter(f: string) {
    setFilters((prev) => prev.filter((x) => x !== f));
  }

  function lineMatches(line: string) {
    if (filters.length === 0) return false;
    const lower = line.toLowerCase();
    return filters.some((f) => lower.includes(f));
  }

  const matchCount = useMemo(
    () => lines.filter(lineMatches).length,
    [lines, filters]
  );

  const remaining = lines.filter((l) => !lineMatches(l));

  // ── Actions ───────────────────────────────────────────────────────────────
  function deleteHighlighted() {
    setLines((prev) => prev.filter((l) => !lineMatches(l)));
  }

  function flash(msg?: string) {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyRemaining() {
    navigator.clipboard.writeText(remaining.join("\n"));
    flash();
  }

  function copyAll() {
    navigator.clipboard.writeText(lines.join("\n"));
    flash();
  }

  function exportForSheets() {
    const header = ["Player", "Action", "Details", "Time", "Raw Log"].join("\t");
    const rows = remaining.map((line) => {
      const p = parseLine(line);
      return [p.player, p.action, p.details, p.time, p.raw].join("\t");
    });
    navigator.clipboard.writeText([header, ...rows].join("\n"));
    flash();
  }

  function reset() {
    setRawText("");
    setLines([]);
    setFilters([]);
    setFilterInput("");
    setLoaded(false);
    setViewMode("list");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: THEME.bg, color: THEME.textMuted, fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", background: THEME.headerGradient, borderBottom: `2px solid ${THEME.secondary}` }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: THEME.primary, textDecoration: "none", fontFamily: THEME.font, fontSize: "14px", padding: "8px 16px", background: "rgba(102,252,241,0.1)", border: `1px solid ${THEME.secondary}`, borderRadius: "8px" }}>
          ← Game Hole
        </Link>
        <h1 style={{ fontFamily: THEME.font, fontSize: "20px", color: THEME.accent, margin: 0, textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
          Log Filter
        </h1>
        <div style={{ width: "120px" }} />
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Step 1: Paste ── */}
        {!loaded ? (
          <div>
            <p style={{ fontSize: "13px", color: THEME.secondary, marginBottom: "12px" }}>
              Paste your NomStead activity log below, then click <strong style={{ color: THEME.primary }}>Load</strong>.
              After loading you can filter, delete noise lines, then <strong style={{ color: THEME.accent }}>Export for Sheets</strong> to get a clean table you can paste directly into Google Sheets.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste activity log here…"
              style={{
                width: "100%",
                height: "400px",
                background: "rgba(10,20,35,0.9)",
                border: `1px solid ${THEME.secondary}`,
                borderRadius: "8px",
                color: "#c8d8e8",
                fontSize: "13px",
                padding: "12px",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "monospace",
                lineHeight: "1.5",
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                onClick={load}
                disabled={!rawText.trim()}
                style={{ background: rawText.trim() ? THEME.primary : "#333", color: "#000", border: "none", borderRadius: "6px", padding: "10px 28px", cursor: rawText.trim() ? "pointer" : "not-allowed", fontFamily: THEME.font, fontSize: "13px", fontWeight: "bold" }}
              >
                Load →
              </button>
              <button
                onClick={() => setRawText("")}
                style={{ background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: "6px", padding: "10px 16px", cursor: "pointer", fontSize: "13px" }}
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div>

            {/* ── Filter bar ── */}
            <div style={{ background: "rgba(10,20,35,0.9)", border: `1px solid ${THEME.secondary}`, borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: THEME.secondary, marginBottom: "8px", fontFamily: THEME.font }}>
                Highlight lines to delete — click an action, guild member, or type a keyword
              </div>

              {/* Quick-add action keyword buttons */}
              {(() => {
                const ACTION_FILTERS = ["planted", "harvested"];
                return (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#555", fontFamily: THEME.font, alignSelf: "center", marginRight: "2px" }}>ACTIONS</span>
                    {ACTION_FILTERS.map((kw) => {
                      const active = filters.includes(kw);
                      return (
                        <button
                          key={kw}
                          onClick={() => {
                            if (active) setFilters((f) => f.filter((x) => x !== kw));
                            else setFilters((f) => [...f, kw]);
                          }}
                          style={{
                            background: active ? "rgba(255,71,87,0.2)" : "rgba(255,165,0,0.08)",
                            color: active ? "#ff7088" : "#ffaa44",
                            border: `1px solid ${active ? "#ff4757" : "#ffaa4466"}`,
                            borderRadius: "4px",
                            padding: "4px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontFamily: THEME.font,
                            transition: "all 0.1s",
                          }}
                        >
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Quick-add guild member buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {GUILD_MEMBERS.map((name) => {
                  const active = filters.includes(name.toLowerCase());
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        const lower = name.toLowerCase();
                        if (active) setFilters((f) => f.filter((x) => x !== lower));
                        else setFilters((f) => [...f, lower]);
                      }}
                      style={{
                        background: active ? "rgba(255,71,87,0.2)" : "rgba(69,162,158,0.1)",
                        color: active ? "#ff7088" : THEME.secondary,
                        border: `1px solid ${active ? "#ff4757" : THEME.secondary + "66"}`,
                        borderRadius: "4px",
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontFamily: THEME.font,
                        transition: "all 0.1s",
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addFilter(); }}
                  placeholder="e.g. planted, FoxHole, about 2 hours…"
                  autoFocus
                  style={{ flex: "1 1 240px", background: "#060e1a", color: "#c8d8e8", border: `1px solid ${THEME.secondary}`, borderRadius: "5px", padding: "7px 10px", fontSize: "13px" }}
                />
                <button
                  onClick={addFilter}
                  disabled={!filterInput.trim()}
                  style={{ background: filterInput.trim() ? "#ff4757" : "#333", color: "#fff", border: "none", borderRadius: "5px", padding: "7px 16px", cursor: filterInput.trim() ? "pointer" : "not-allowed", fontSize: "13px", whiteSpace: "nowrap" }}
                >
                  + Add filter
                </button>
              </div>

              {filters.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                  {filters.map((f) => (
                    <span
                      key={f}
                      style={{ background: "rgba(255,71,87,0.2)", border: "1px solid #ff4757", color: "#ff7088", borderRadius: "4px", padding: "3px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {f}
                      <button
                        onClick={() => removeFilter(f)}
                        style={{ background: "transparent", border: "none", color: "#ff4757", cursor: "pointer", fontSize: "13px", padding: 0, lineHeight: 1 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setFilters([])}
                    style={{ background: "transparent", color: "#888", border: "1px solid #444", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontSize: "11px" }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* ── Action bar ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", color: THEME.secondary }}>
                <strong style={{ color: "#c8d8e8" }}>{lines.length}</strong> lines total ·{" "}
                {matchCount > 0
                  ? <strong style={{ color: "#ff4757" }}>{matchCount} highlighted</strong>
                  : <span>{matchCount} highlighted</span>
                } ·{" "}
                <strong style={{ color: THEME.accent }}>{remaining.length} remaining</strong>
              </span>

              {/* View toggle */}
              <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                <button
                  onClick={() => setViewMode("list")}
                  style={{ background: viewMode === "list" ? `${THEME.secondary}33` : "transparent", color: viewMode === "list" ? THEME.primary : "#555", border: `1px solid ${viewMode === "list" ? THEME.secondary : "#333"}`, borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontFamily: THEME.font }}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  style={{ background: viewMode === "table" ? `${THEME.accent}22` : "transparent", color: viewMode === "table" ? THEME.accent : "#555", border: `1px solid ${viewMode === "table" ? THEME.accent : "#333"}`, borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontFamily: THEME.font }}
                >
                  Table
                </button>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {matchCount > 0 && (
                  <button
                    onClick={deleteHighlighted}
                    style={{ background: "#3a0a0a", color: "#ff4757", border: "1px solid #ff4757", borderRadius: "5px", padding: "6px 16px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                  >
                    Delete {matchCount} highlighted
                  </button>
                )}
                <button
                  onClick={exportForSheets}
                  style={{ background: "rgba(74,222,128,0.15)", color: THEME.accent, border: `1px solid ${THEME.accent}`, borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                >
                  {copied ? "✓ Copied!" : "Export for Sheets"}
                </button>
                <button
                  onClick={copyRemaining}
                  style={{ background: "rgba(0,255,65,0.05)", color: THEME.secondary, border: `1px solid ${THEME.secondary}`, borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
                >
                  Copy remaining
                </button>
                <button
                  onClick={copyAll}
                  style={{ background: "transparent", color: "#666", border: "1px solid #444", borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
                >
                  Copy all
                </button>
                <button
                  onClick={reset}
                  style={{ background: "transparent", color: "#888", border: "1px solid #444", borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
                >
                  ↺ Start over
                </button>
              </div>
            </div>

            {/* ── List view ── */}
            {viewMode === "list" && (
              <div style={{ background: "rgba(6,14,26,0.95)", border: `1px solid ${THEME.secondary}44`, borderRadius: "8px", padding: "8px", maxHeight: "60vh", overflowY: "auto" }}>
                {lines.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#555", padding: "40px", fontSize: "14px" }}>
                    All lines deleted — nothing left.
                  </div>
                ) : (
                  lines.map((line, i) => {
                    const match = lineMatches(line);
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          padding: "3px 6px",
                          borderRadius: "3px",
                          background: match ? "rgba(255,71,87,0.12)" : "transparent",
                          borderLeft: match ? "2px solid #ff4757" : "2px solid transparent",
                          marginBottom: "1px",
                        }}
                      >
                        <span style={{ fontSize: "10px", color: "#333", userSelect: "none", minWidth: "28px", textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: "12px", color: match ? "#ff7088" : "#9cb", fontFamily: "monospace", wordBreak: "break-word", flex: 1 }}>
                          {line}
                        </span>
                        <button
                          onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                          title="Delete this line"
                          style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", padding: "0 2px", flexShrink: 0, opacity: 0.6 }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Table view ── */}
            {viewMode === "table" && (
              <div style={{ background: "rgba(6,14,26,0.95)", border: `1px solid ${THEME.secondary}44`, borderRadius: "8px", maxHeight: "60vh", overflowY: "auto", overflowX: "auto" }}>
                {remaining.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#555", padding: "40px", fontSize: "14px" }}>
                    No lines to display.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: "monospace" }}>
                    <thead>
                      <tr style={{ background: "rgba(69,162,158,0.15)", position: "sticky", top: 0 }}>
                        {["#", "Player", "Action", "Details", "Time"].map((h) => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: THEME.primary, fontFamily: THEME.font, fontSize: "10px", borderBottom: `1px solid ${THEME.secondary}44`, whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                        <th style={{ padding: "8px 10px", borderBottom: `1px solid ${THEME.secondary}44` }} />
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((line, i) => {
                        const p = parseLine(line);
                        return (
                          <tr
                            key={i}
                            style={{ borderBottom: `1px solid ${THEME.secondary}22` }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(69,162,158,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "5px 10px", color: "#333", minWidth: "32px", textAlign: "right" }}>{i + 1}</td>
                            <td style={{ padding: "5px 10px", color: "#66fcf1", whiteSpace: "nowrap" }}>{p.player || <span style={{ color: "#444" }}>—</span>}</td>
                            <td style={{ padding: "5px 10px", color: THEME.accent, whiteSpace: "nowrap" }}>{p.action || <span style={{ color: "#444" }}>—</span>}</td>
                            <td style={{ padding: "5px 10px", color: "#c8d8e8", wordBreak: "break-word", maxWidth: "400px" }}>{p.details || <span style={{ color: "#444" }}>—</span>}</td>
                            <td style={{ padding: "5px 10px", color: THEME.secondary, whiteSpace: "nowrap" }}>{p.time || <span style={{ color: "#444" }}>—</span>}</td>
                            <td style={{ padding: "5px 8px" }}>
                              <button
                                onClick={() => setLines((prev) => prev.filter((l) => l !== line))}
                                title="Delete this line"
                                style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", padding: "0 2px", opacity: 0.6 }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Export hint */}
            <p style={{ fontSize: "11px", color: "#444", marginTop: "10px", fontFamily: THEME.font }}>
              TIP — <span style={{ color: THEME.accent }}>Export for Sheets</span> copies a tab-separated table. Open Google Sheets → click an empty cell → Ctrl+V to paste instantly with columns.
            </p>

          </div>
        )}
      </div>
    </div>
  );
}
