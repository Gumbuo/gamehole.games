"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

const SEEDS = [
  { name: "Cotton",        h: 2 },
  { name: "Tomato",        h: 2 },
  { name: "Red Flower",    h: 4 },
  { name: "Blue Flower",   h: 4 },
  { name: "Yellow Flower", h: 4 },
  { name: "Grapes",        h: 4 },
  { name: "Pumpkin",       h: 4 },
  { name: "Potatoes",      h: 3 },
  { name: "Fern",          h: 2,      label: "2h" },
  { name: "Carrots",       h: 5 / 60, label: "5m" },
  { name: "Wheat",         h: 24 },
];

type FarmLink = {
  label: string;
  url: string;
  count?: number;
  note?: string;
};

type Section = {
  id: string;
  title: string;
  color: string;
  links: FarmLink[];
};

const SECTIONS: Section[] = [
  {
    id: "my-land",
    title: "My Land",
    color: "#66fcf1",
    links: [
      { label: "fox-hole / wine tile", url: "https://nomstead.com/fox-hole/6979ec3f24abb84a34c52a02", count: 4 },
      { label: "fox-hole / pond", url: "https://nomstead.com/fox-hole/68c7bc3fc0d978301fad2ca0" },
      { label: "fox tools shop", url: "https://nomstead.com/fox-alchmey/6952eca517bccce7626cdfbe" },
    ],
  },
  {
    id: "open-farms",
    title: "Open Farms",
    color: "#4ade80",
    links: [],
  },
  {
    id: "wine",
    title: "Wine",
    color: "#c084fc",
    links: [
      { label: "fox-hole / wine tile", url: "https://nomstead.com/fox-hole/6979ec3f24abb84a34c52a02", count: 4 },
      { label: "kunafool", url: "https://nomstead.com/kunafool/68c7baaa6ff5961fef12e500", count: 1 },
      { label: "pardisland", url: "https://nomstead.com/pardisland/6979ec3924abb84a34c528d1", count: 1 },
      { label: "nihil", url: "https://nomstead.com/nihil/66c60a2c55ca2290ac767a84", count: 1 },
      { label: "gabyluky1904", url: "https://nomstead.com/gabyluky1904/69078027b1f7c6772abaa94b", count: 1 },
      { label: "wfh365days", url: "https://nomstead.com/wfh365days/68d2cbfc80b9dc2c85fec7cf", count: 1 },
      { label: "the-greatest-estate", url: "https://nomstead.com/the-greatest-estate", count: 1 },
      { label: "waltz7809 / tile", url: "https://nomstead.com/waltz7809/690e7ce1da2482e1103a5258", count: 2 },
      { label: "waltz7809 / home", url: "https://nomstead.com/waltz7809", count: 1 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61c1e894f016c29f48d9cdd4", count: 2 },
      { label: "sbhan", url: "https://nomstead.com/sbhan/688b8d92eef426de55378ffb" },
      { label: "dyespinning-wheel", url: "https://nomstead.com/dyespinning-wheel/688b88dae48988acd89b012c" },
      { label: "kalentong / 688b895a", url: "https://nomstead.com/kalentong/688b895a1607c56f2c03d329", count: 3 },
      { label: "espartacus / 688b89eb", url: "https://nomstead.com/espartacus/688b89ebe48988acd89b8070", count: 2 },
      { label: "ottoman1453", url: "https://nomstead.com/ottoman1453/688b88961585b148c6a36d0f", count: 1 },
    ],
  },
  {
    id: "bread-ovens",
    title: "Bread Ovens",
    color: "#fb923c",
    links: [
      { label: "marben", url: "https://nomstead.com/marben", count: 10 },
      { label: "black-hole", url: "https://nomstead.com/black-hole/688b8ac0824d90422c6fe80c", count: 2 },
      { label: "bread-oven", url: "https://nomstead.com/bread-oven", count: 4 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61b7f8dcc5c5332553b750f3", count: 5 },
      { label: "moonz", url: "https://nomstead.com/moonz/66f638e6dda9cf2e408b022f" },
      { label: "cocineros", url: "https://nomstead.com/cocineros/6979ebcc24abb84a34c510f3", count: 3 },
      { label: "laizen", url: "https://nomstead.com/laizen/688ee6254470af38c4df0a09", count: 4 },
      { label: "geto-dacia", url: "https://nomstead.com/geto-dacia", count: 2 },
      { label: "l3l", url: "https://nomstead.com/l3l/62a33d835103e8e6490ff6fb", count: 2 },
      { label: "trung-thc", url: "https://nomstead.com/trung-thc/68aec146c53034996eb6bdf9", count: 6 },
      { label: "nihil", url: "https://nomstead.com/nihil", count: 5 },
      { label: "funjunkmans-lair", url: "https://nomstead.com/funjunkmans-lair", count: 1 },
      { label: "sbhan", url: "https://nomstead.com/sbhan" },
      { label: "m@lik", url: "https://nomstead.com/m@lik" },
      { label: "kalentong", url: "https://nomstead.com/kalentong/688b886f1585b148c6a36384", count: 1 },
      { label: "dyespinning-wheel", url: "https://nomstead.com/dyespinning-wheel/688b88eae48988acd89b0584" },
      { label: "hasishi / 66766518", url: "https://nomstead.com/hasishi/667665184dfc220fc8340766", count: 8 },
      { label: "espartacus / 688b8a3a", url: "https://nomstead.com/espartacus/688b8a3a1585b148c6a42be4", count: 1 },
      { label: "7", url: "https://nomstead.com/7", count: 1 },
    ],
  },
  {
    id: "mills",
    title: "Mills",
    color: "#fbbf24",
    links: [
      { label: "usop-empire / 688b88b6", url: "https://nomstead.com/usop-empire/688b88b664eac5c413e9ea5a", count: 3 },
      { label: "sembawang", url: "https://nomstead.com/sembawang/691878c2a8ceee6de5c5e158", count: 2 },
      { label: "pardisland", url: "https://nomstead.com/pardisland/690ca9969247d04106b82de0", count: 1 },
      { label: "goldv", url: "https://nomstead.com/goldv/6519ce1376805122fa9fa3c3", count: 1 },
      { label: "hilmyron", url: "https://nomstead.com/hilmyron/665f41dbf46670cb14ff5cec", count: 1 },
      { label: "the-47th-society", url: "https://nomstead.com/the-47th-society/65c106417d8c2c075d336757", count: 1 },
      { label: "la-terra-dei-cachi", url: "https://nomstead.com/la-terra-dei-cachi/61b7f8dcc5c5332553b750f3", count: 1 },
      { label: "trung-thc", url: "https://nomstead.com/trung-thc/68aec146c53034996eb6bdf9", count: 1 },
      { label: "lk", url: "https://nomstead.com/lk/688b94d864eac5c413f29d4a", count: 1 },
      { label: "cocineros", url: "https://nomstead.com/cocineros/6979ebcc24abb84a34c510f3", count: 1 },
      { label: "black-hole", url: "https://nomstead.com/black-hole/688b8ac0824d90422c6fe80c", count: 1 },
      { label: "sbhan", url: "https://nomstead.com/sbhan" },
      { label: "m@lik", url: "https://nomstead.com/m@lik" },
      { label: "l3l", url: "https://nomstead.com/l3l/64b5b71c9a0293d21d8c720b" },
      { label: "kalentong", url: "https://nomstead.com/kalentong/688b886f1585b148c6a36384", count: 1 },
      { label: "moonland", url: "https://nomstead.com/moonland/6686de4de33932506bc30f4f" },
      { label: "hakkeijima", url: "https://nomstead.com/hakkeijima/68c8ba7d3cb7a45f08849c19", count: 2 },
      { label: "espartacus / 688b8a3a", url: "https://nomstead.com/espartacus/688b8a3a1585b148c6a42be4", count: 1 },
      { label: "7", url: "https://nomstead.com/7", count: 1 },
    ],
  },
  {
    id: "guild-members",
    title: "Guild Members",
    color: "#a78bfa",
    links: [],
  },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i + 1);
const DAYS = [1, 2, 3, 4, 5, 6];
const MOD_HOURS = Array.from({ length: 24 }, (_, i) => i);

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "READY";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (h > 0 ? h + "h " : "") + (m > 0 || h > 0 ? m + "m " : "") + s + "s";
}

export default function FarmsPage() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const notifiedTimers = useRef<Set<string>>(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nomstead_timers") || "{}");
      setTimers(stored);
    } catch {}
    try {
      const storedNotes = JSON.parse(localStorage.getItem("nomstead_notes") || "{}");
      setNotes(storedNotes);
    } catch {}

    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  function handleSetTimer(url: string, ms: number) {
    const next = { ...timers, [url]: Date.now() + ms };
    setTimers(next);
    localStorage.setItem("nomstead_timers", JSON.stringify(next));
  }

  function handleSetNote(url: string, text: string) {
    const next = { ...notes, [url]: text };
    setNotes(next);
    localStorage.setItem("nomstead_notes", JSON.stringify(next));
  }

  function handleClearNote(url: string) {
    const next = { ...notes };
    delete next[url];
    setNotes(next);
    localStorage.setItem("nomstead_notes", JSON.stringify(next));
  }

  function handleClearTimer(url: string) {
    const next = { ...timers };
    delete next[url];
    setTimers(next);
    localStorage.setItem("nomstead_timers", JSON.stringify(next));
    notifiedTimers.current.delete(url);
  }

  useEffect(() => {
    const now = Date.now();
    Object.entries(timers).forEach(([url, expiry]) => {
      if (expiry - now <= 0 && !notifiedTimers.current.has(url)) {
        notifiedTimers.current.add(url);
        let label = url;
        for (const sec of SECTIONS) {
          const found = sec.links.find((l) => l.url === url);
          if (found) { label = found.label; break; }
        }
        fetch("/api/nomstead/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label, tileUrl: url, note: notes[url] }),
        }).catch(() => {});
      }
    });
  });

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: THEME.bg, color: THEME.textMuted, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", background: THEME.headerGradient, borderBottom: `2px solid ${THEME.secondary}` }}>
        <Link href="/nomstead" style={{ display: "flex", alignItems: "center", gap: "8px", color: THEME.primary, textDecoration: "none", fontFamily: THEME.font, fontSize: "14px", padding: "8px 16px", background: "rgba(102, 252, 241, 0.1)", border: `1px solid ${THEME.secondary}`, borderRadius: "8px" }}>
          ← NomStead
        </Link>
        <h1 style={{ fontFamily: THEME.font, fontSize: "20px", color: THEME.accent, margin: 0, textShadow: "0 0 10px rgba(74,222,128,0.5)" }}>
          Farm Navigator
        </h1>
        <div style={{ width: "120px" }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
        <p style={{ fontSize: "13px", color: THEME.secondary, marginBottom: "16px" }}>
          Click any tile to open it. Last visited stays <strong style={{ color: "#afffcf" }}>highlighted</strong>. Use <strong style={{ color: "#f90" }}>⏱</strong> to set a cooldown timer — click the countdown to clear it.
        </p>

        {SECTIONS.map((section) => (
          <FarmSection
            key={section.id}
            section={section}
            activeUrl={activeUrl}
            setActiveUrl={setActiveUrl}
            timers={timers}
            onSetTimer={handleSetTimer}
            onClearTimer={handleClearTimer}
            notes={notes}
            onSetNote={handleSetNote}
            onClearNote={handleClearNote}
          />
        ))}

        {/* Guild Goals */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", borderBottom: "1px solid #fbbf2444", paddingBottom: "8px" }}>
            <h2 style={{ fontFamily: THEME.font, fontSize: "15px", color: "#fbbf24", margin: 0, letterSpacing: "1px" }}>Guild Goals</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          </div>
        </div>
      </div>
    </div>
  );
}

type FarmSectionProps = {
  section: Section;
  activeUrl: string | null;
  setActiveUrl: (url: string) => void;
  timers: Record<string, number>;
  onSetTimer: (url: string, ms: number) => void;
  onClearTimer: (url: string) => void;
  notes: Record<string, string>;
  onSetNote: (url: string, text: string) => void;
  onClearNote: (url: string) => void;
};

function FarmSection({ section, activeUrl, setActiveUrl, timers, onSetTimer, onClearTimer, notes, onSetNote, onClearNote }: FarmSectionProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", borderBottom: `1px solid ${section.color}44`, paddingBottom: "8px" }}>
        <h2 style={{ fontFamily: THEME.font, fontSize: "15px", color: section.color, margin: 0, letterSpacing: "1px" }}>
          {section.title}
        </h2>
        <span style={{ fontSize: "12px", color: THEME.secondary }}>{section.links.length} tiles</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "6px" }}>
        {section.links.map((link) => (
          <FarmLink
            key={link.url + link.label}
            link={link}
            accentColor={section.color}
            isActive={activeUrl === link.url}
            onVisit={() => setActiveUrl(link.url)}
            expiry={timers[link.url]}
            onSetTimer={(ms) => onSetTimer(link.url, ms)}
            onClearTimer={() => onClearTimer(link.url)}
            noteText={notes[link.url]}
            onSetNote={(text) => onSetNote(link.url, text)}
            onClearNote={() => onClearNote(link.url)}
          />
        ))}
      </div>
    </div>
  );
}

type FarmLinkProps = {
  link: FarmLink;
  accentColor: string;
  isActive: boolean;
  onVisit: () => void;
  expiry?: number;
  onSetTimer: (ms: number) => void;
  onClearTimer: () => void;
  noteText?: string;
  onSetNote: (text: string) => void;
  onClearNote: () => void;
};

function FarmLink({ link, accentColor, isActive, onVisit, expiry, onSetTimer, onClearTimer, noteText, onSetNote, onClearNote }: FarmLinkProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customHrs, setCustomHrs] = useState("");
  const [selDay, setSelDay] = useState(0);
  const [selHour, setSelHour] = useState(0);
  const [notePickerOpen, setNotePickerOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const remaining = expiry ? expiry - Date.now() : null;
  const hasTimer = remaining !== null;
  const isReady = hasTimer && remaining! <= 0;

  function closePicker() { setPickerOpen(false); setSelDay(0); setSelHour(0); setCustomHrs(""); }
  function applyTimer(ms: number) { onSetTimer(ms); closePicker(); }

  const bg = isActive ? "#0d3320" : THEME.cardBg;
  const borderColor = isActive ? "#4af080" : hasTimer ? (isReady ? "#4af08088" : "#2a3a5a") : "#1a3050";
  const textColor = isActive ? "#afffcf" : "#9cf";

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onVisit}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: bg, border: `1px solid ${borderColor}`, borderRadius: "6px", padding: "7px 10px", textDecoration: "none", color: textColor, fontSize: "13px", gap: "6px", flex: 1, minWidth: 0, transition: "border-color 0.15s, background 0.15s" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{link.label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          {link.note && <span style={{ fontSize: "10px", color: "#f90" }} title={link.note}>{link.note}</span>}
          {link.count !== undefined && (
            <span style={{ background: "#1a3a20", color: "#6d9", border: "1px solid #2a5a30", borderRadius: "3px", padding: "1px 5px", fontSize: "11px" }}>×{link.count}</span>
          )}
        </span>
      </a>

      {/* Timer display — click to clear */}
      {hasTimer && (
        <span onClick={onClearTimer} title="Click to clear timer"
          style={{ fontSize: "11px", padding: "3px 6px", borderRadius: "3px", border: `1px solid ${isReady ? "#4af080" : "#2a3a5a"}`, background: isReady ? "#0d3320" : "#0d1020", color: isReady ? "#4af080" : "#7a9", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          {isReady ? "READY ✓" : fmtCountdown(remaining!)}
        </span>
      )}

      {/* Timer set button */}
      <button onClick={(e) => { e.stopPropagation(); pickerOpen ? closePicker() : setPickerOpen(true); }} title="Set cooldown timer"
        style={{ background: "#0d1e33", border: "1px solid #1a3050", color: pickerOpen ? "#f90" : "#567", borderRadius: "3px", padding: "4px 6px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>
        ⏱
      </button>

      {/* Note display */}
      {noteText && (
        <span title={noteText} style={{ fontSize: "11px", color: "#f90", fontStyle: "italic", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1 }}>
          📝 {noteText}
        </span>
      )}

      {/* Note button */}
      <button onClick={(e) => { e.stopPropagation(); if (notePickerOpen) { setNotePickerOpen(false); } else { setNoteDraft(noteText || ""); setNotePickerOpen(true); closePicker(); } }} title="Add/edit note"
        style={{ background: "#0d1e33", border: "1px solid #1a3050", color: notePickerOpen || noteText ? "#f90" : "#567", borderRadius: "3px", padding: "4px 6px", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>
        ✎
      </button>

      {/* Note picker */}
      {notePickerOpen && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 200, background: "#0d1a2e", border: "1px solid #2a5a8c", borderRadius: "6px", padding: "10px", boxShadow: "0 4px 16px #000a", width: "240px" }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "11px", color: "#7a9", marginBottom: "6px" }}>Note for this link</div>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="e.g. cotton planted, mushrooms nearby..."
            rows={3}
            autoFocus
            style={{ width: "100%", background: "#060e1a", color: "#c8d8e8", border: "1px solid #2a4a6a", borderRadius: "4px", padding: "6px", fontSize: "12px", resize: "vertical", boxSizing: "border-box", marginBottom: "8px" }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => { const v = noteDraft.trim(); if (v) onSetNote(v); else onClearNote(); setNotePickerOpen(false); }}
              style={{ flex: 1, background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "4px", padding: "4px", cursor: "pointer", fontSize: "12px" }}>
              Save
            </button>
            <button onClick={() => { onClearNote(); setNotePickerOpen(false); }}
              style={{ background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>
              Clear
            </button>
            <button onClick={() => setNotePickerOpen(false)}
              style={{ background: "transparent", color: "#567", border: "1px solid #2a3a5a", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Timer picker */}
      {pickerOpen && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 100, background: "#0d1e33", border: "1px solid #2a5a8c", borderRadius: "6px", padding: "10px", boxShadow: "0 4px 16px #000a", width: "236px" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Seed presets */}
          <div style={{ fontSize: "10px", color: "#9cf", marginBottom: "5px", fontWeight: "bold" }}>🌱 Seed presets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", marginBottom: "8px" }}>
            {SEEDS.map((seed) => {
              const lbl = seed.label || (seed.h % 1 === 0 ? seed.h + "h" : Math.round(seed.h * 60) + "m");
              return (
                <button key={seed.name} onClick={() => applyTimer(seed.h * 3600000)}
                  style={{ background: "#0d2010", border: "1px solid #1a4020", borderRadius: "4px", padding: "5px 3px", cursor: "pointer", textAlign: "center" }}>
                  <span style={{ display: "block", fontSize: "10px", color: "#9cf", lineHeight: 1.2 }}>{seed.name}</span>
                  <span style={{ display: "block", fontSize: "9px", color: "#7a9", marginTop: "1px" }}>{lbl}</span>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid #1a3050", margin: "0 0 8px" }} />

          {/* Hours 1–24 instant set */}
          <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>Hours — click to set instantly</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", marginBottom: "8px" }}>
            {HOURS.map((h) => (
              <button key={h} onClick={() => applyTimer(h * 3600000)}
                style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "3px 2px", cursor: "pointer", fontSize: "11px" }}>
                {h}h
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #1a3050", margin: "2px 0 8px" }} />

          {/* Days 1–6 */}
          <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>Days</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", marginBottom: "6px" }}>
            {DAYS.map((d) => (
              <button key={d}
                onClick={() => { if (selDay === d) { setSelDay(0); setSelHour(0); } else { setSelDay(d); setSelHour(0); } }}
                style={{ background: selDay === d ? "#2a4a8c" : "#1a2a4c", color: "#adf", border: "1px solid #2a4a7c", borderRadius: "3px", padding: "4px 2px", cursor: "pointer", fontSize: "11px" }}>
                {d}d
              </button>
            ))}
          </div>

          {selDay > 0 && (
            <>
              <div style={{ fontSize: "10px", color: "#7a9", marginBottom: "4px" }}>+ Extra hours</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px", marginBottom: "8px" }}>
                {MOD_HOURS.map((h) => (
                  <button key={h} onClick={() => setSelHour(h)}
                    style={{ background: selHour === h ? "#2a4a8c" : "#0a1428", color: "#adf", border: "1px solid #2a4a7c", borderRadius: "3px", padding: "2px 1px", cursor: "pointer", fontSize: "10px" }}>
                    +{h}h
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <span style={{ flex: 1, color: "#adf", fontSize: "11px" }}>
                  {selDay}d{selHour > 0 ? ` +${selHour}h` : ""}
                </span>
                <button onClick={() => applyTimer(selDay * 86400000 + selHour * 3600000)}
                  style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "4px 14px", cursor: "pointer", fontSize: "12px" }}>
                  Set
                </button>
              </div>
            </>
          )}

          <div style={{ borderTop: "1px solid #1a3050", margin: "2px 0 8px" }} />

          {/* Custom input */}
          <div style={{ display: "flex", gap: "4px", marginBottom: hasTimer ? "8px" : "0" }}>
            <input type="number" placeholder="custom hrs" min="0.5" step="0.5" value={customHrs}
              onChange={(e) => setCustomHrs(e.target.value)}
              style={{ flex: 1, background: "#0a1a2e", border: "1px solid #2a5a8c", color: "#9cf", borderRadius: "3px", padding: "4px 6px", fontSize: "12px" }} />
            <button onClick={() => { const v = parseFloat(customHrs); if (v > 0) applyTimer(v * 3600000); }}
              style={{ background: "#1a3a5c", color: "#7df", border: "1px solid #2a5a8c", borderRadius: "3px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>
              Set
            </button>
          </div>

          {hasTimer && (
            <button onClick={() => { onClearTimer(); closePicker(); }}
              style={{ width: "100%", background: "transparent", color: "#f66", border: "1px solid #f664", borderRadius: "3px", padding: "4px", cursor: "pointer", fontSize: "11px" }}>
              Clear timer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
