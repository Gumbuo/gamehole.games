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

export default function LogFilterPage() {
  const [rawText, setRawText]       = useState("");
  const [lines, setLines]           = useState<string[]>([]);
  const [filterInput, setFilterInput] = useState("");
  const [filters, setFilters]       = useState<string[]>([]);
  const [copied, setCopied]         = useState(false);
  const [loaded, setLoaded]         = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load raw text into lines ──────────────────────────────────────────────
  function load() {
    const ls = rawText.split("\n").filter((l) => l.trim() !== "");
    setLines(ls);
    setLoaded(true);
  }

  // ── Filter logic ──────────────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  function deleteHighlighted() {
    setLines((prev) => prev.filter((l) => !lineMatches(l)));
  }

  function copyRemaining() {
    const clean = lines.filter((l) => !lineMatches(l)).join("\n");
    navigator.clipboard.writeText(clean);
    flash();
  }

  function copyAll() {
    navigator.clipboard.writeText(lines.join("\n"));
    flash();
  }

  function flash() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setRawText("");
    setLines([]);
    setFilters([]);
    setFilterInput("");
    setLoaded(false);
  }

  const remaining = lines.filter((l) => !lineMatches(l)).length;

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

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Step 1: Paste ── */}
        {!loaded ? (
          <div>
            <p style={{ fontSize: "13px", color: THEME.secondary, marginBottom: "12px" }}>
              Paste your full activity log below, then click <strong style={{ color: THEME.primary }}>Load</strong>.
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
                Filter — type a keyword or click a member name to highlight matching lines
              </div>

              {/* Quick-add guild member buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                {GUILD_MEMBERS.map((name) => {
                  const active = filters.includes(name.toLowerCase());
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        const lower = name.toLowerCase();
                        if (active) {
                          setFilters((f) => f.filter((x) => x !== lower));
                        } else {
                          setFilters((f) => [...f, lower]);
                        }
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

              {/* Active filter chips */}
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
                <strong style={{ color: THEME.accent }}>{remaining} remaining</strong>
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {matchCount > 0 && (
                  <button
                    onClick={deleteHighlighted}
                    style={{ background: "#3a0a0a", color: "#ff4757", border: "1px solid #ff4757", borderRadius: "5px", padding: "6px 16px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                  >
                    Delete {matchCount} highlighted lines
                  </button>
                )}
                <button
                  onClick={copyRemaining}
                  style={{ background: "rgba(0,255,65,0.1)", color: THEME.accent, border: `1px solid ${THEME.accent}`, borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
                >
                  {copied ? "✓ Copied!" : "Copy remaining"}
                </button>
                <button
                  onClick={copyAll}
                  style={{ background: "transparent", color: THEME.secondary, border: `1px solid ${THEME.secondary}`, borderRadius: "5px", padding: "6px 14px", cursor: "pointer", fontSize: "12px" }}
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

            {/* ── Line list ── */}
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
          </div>
        )}
      </div>
    </div>
  );
}
