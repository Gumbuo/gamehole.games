"use client";
import Link from "next/link";
import activityData from "./activity-data.json";

type Player = {
  name: string;
  score: number;
  harvested: Record<string, number>;
  planted: Record<string, number>;
  trees: number;
  mined: Record<string, number>;
  fished: Record<string, number>;
  quests: Record<string, number>;
  unplanted: Record<string, number>;
};

function sum(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0);
}
function fmt(n: number) {
  return n.toLocaleString();
}
function sorted(map: Record<string, number>): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

const MEDALS = ["🥇", "🥈", "🥉"];

const SECTIONS = [
  { id: "leaderboards",  label: "Leaderboards",  emoji: "🏆" },
  { id: "details",       label: "Full Details",  emoji: "📊" },
  { id: "inactive",      label: "Inactive",      emoji: "💤" },
];

const INACTIVE_MEMBERS = [
  "Nandaimut22",
  "Jasonx",
  "Hampronk",
  "Jhossep007",
  "Mudassar",
  "Seva",
];

// ── Compact leaderboard table ──────────────────────────────────────────────────
function LeaderboardTable({
  rows,
  unit = "",
}: {
  rows: { name: string; value: number }[];
  unit?: string;
}) {
  const top = rows.filter((r) => r.value > 0);
  if (top.length === 0)
    return <p style={{ color: "#45a29e66", fontSize: "0.75rem" }}>No data yet</p>;

  return (
    <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "560px" }}>
      <tbody>
        {top.map((row, i) => (
          <tr
            key={row.name}
            style={{
              borderBottom: "1px solid rgba(69,162,158,0.1)",
              background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent",
            }}
          >
            <td style={{ padding: "7px 10px", width: "36px", color: "#45a29e", fontSize: "0.75rem", fontWeight: "bold" }}>
              {i < 3 ? MEDALS[i] : `#${i + 1}`}
            </td>
            <td style={{ padding: "7px 10px", color: "#c5c6c7", fontSize: "0.85rem", fontFamily: "Orbitron, sans-serif" }}>
              {row.name}
            </td>
            <td style={{ padding: "7px 10px", textAlign: "right", color: "#66fcf1", fontWeight: "bold", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              {fmt(row.value)}{unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ id, emoji, title, children }: { id: string; emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: "48px", scrollMarginTop: "110px" }}>
      <h2 style={{
        fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase",
        color: "#45a29e", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px",
        borderBottom: "1px solid rgba(69,162,158,0.3)", paddingBottom: "10px",
      }}>
        {emoji} {title}
      </h2>
      {children}
    </div>
  );
}

// ── Mini table for player card ─────────────────────────────────────────────────
function MiniTable({ rows, unit = "" }: { rows: [string, number][]; unit?: string }) {
  return (
    <table style={{ borderCollapse: "collapse", fontSize: "0.72rem", width: "100%" }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k}>
            <td style={{ padding: "2px 10px 2px 0", color: "#c5c6c7" }}>{k}</td>
            <td style={{ padding: "2px 0", textAlign: "right", color: "#66fcf1", fontWeight: "bold" }}>
              {fmt(v)}{unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CardSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ minWidth: "140px" }}>
      <div style={{
        fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase",
        color: "#45a29e", marginBottom: "6px", fontWeight: "bold",
      }}>
        {emoji} {title}
      </div>
      {children}
    </div>
  );
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "22",
      border: `1px solid ${color}`,
      color,
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "0.65rem",
      marginRight: "5px",
      marginBottom: "4px",
      whiteSpace: "nowrap",
    }}>
      {label}: <strong>{value}</strong>
    </span>
  );
}

function PlayerCard({ player, rank }: { player: Player; rank: number }) {
  const harv  = sorted(player.harvested);
  const plant = sorted(player.planted);
  const mine  = sorted(player.mined);
  const fish  = sorted(player.fished);
  const quest = sorted(player.quests);

  const totalHarv  = sum(player.harvested);
  const totalPlant = sum(player.planted);
  const totalMine  = sum(player.mined);
  const totalFish  = sum(player.fished);
  const totalQuest = sum(player.quests);

  const medal = rank < 3 ? MEDALS[rank] + " " : "";
  const catCount = [totalHarv, totalPlant, player.trees, totalMine, totalFish, totalQuest].filter(v => v > 0).length;

  return (
    <div style={{
      background: "rgba(0,0,0,0.45)",
      border: "1px solid #45a29e",
      borderRadius: "12px",
      padding: "18px 20px",
      marginBottom: "16px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        borderBottom: "1px solid #45a29e22", paddingBottom: "10px", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "0.65rem", color: "#45a29e", minWidth: "22px" }}>#{rank + 1}</span>
        <h3 style={{ margin: 0, fontSize: "1rem", color: "#66fcf1", letterSpacing: "1px", flex: 1 }}>
          {medal}{player.name}
        </h3>
        <span style={{
          fontSize: "0.62rem", letterSpacing: "1px",
          color: catCount === 6 ? "#ffd700" : "#45a29e",
          border: `1px solid ${catCount === 6 ? "#ffd700" : "#45a29e"}`,
          borderRadius: "4px", padding: "2px 7px", whiteSpace: "nowrap",
        }}>
          {catCount}/6 categories
        </span>
      </div>

      <div style={{ marginBottom: "14px" }}>
        {totalHarv  ? <Badge label="Harvested" value={fmt(totalHarv) + " items"}    color="#00ff41" /> : null}
        {totalPlant ? <Badge label="Planted"   value={fmt(totalPlant) + " seeds"}   color="#00d9ff" /> : null}
        {player.trees ? <Badge label="Wood"    value={fmt(player.trees)}            color="#c68642" /> : null}
        {totalMine  ? <Badge label="Mined"     value={fmt(totalMine) + " minerals"} color="#b44dff" /> : null}
        {totalFish  ? <Badge label="Fished"    value={fmt(totalFish) + " fish"}     color="#00d9ff" /> : null}
        {totalQuest ? <Badge label="Quest"     value={fmt(totalQuest) + " items"}   color="#ffd700" /> : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 30px" }}>
        {harv.length > 0  && <CardSection emoji="🌾" title="Harvested"><MiniTable rows={harv} /></CardSection>}
        {plant.length > 0 && <CardSection emoji="🌱" title="Planted"><MiniTable rows={plant} unit=" seeds" /></CardSection>}
        {player.trees > 0 && <CardSection emoji="🪓" title="Tree Chopping"><MiniTable rows={[["Wood collected", player.trees]]} /></CardSection>}
        {mine.length > 0  && <CardSection emoji="⛏️" title="Mining"><MiniTable rows={mine} /></CardSection>}
        {fish.length > 0  && <CardSection emoji="🎣" title="Fishing"><MiniTable rows={fish} /></CardSection>}
        {quest.length > 0 && <CardSection emoji="📋" title="Daily Quest"><MiniTable rows={quest} /></CardSection>}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function GuildEventsPage() {
  const { date, totals, players } = activityData as unknown as {
    date: string;
    totals: {
      totalHarvested: number; totalPlanted: number; totalWood: number;
      totalMined: number; totalFish: number; totalQuest: number;
    };
    players: Player[];
  };

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const active = players.filter(p => p.score > 0);

  const harvestRanks     = [...active].sort((a, b) => sum(b.harvested) - sum(a.harvested));
  const plantRanks       = [...active].sort((a, b) => sum(b.planted)   - sum(a.planted));
  const woodRanks        = [...active].sort((a, b) => b.trees          - a.trees);
  const mineRanks        = [...active].sort((a, b) => sum(b.mined)     - sum(a.mined));
  const fishRanks        = [...active].sort((a, b) => sum(b.fished)    - sum(a.fished));
  const questRanks       = [...active].sort((a, b) => sum(b.quests)    - sum(a.quests));

  return (
    <div style={{
      width: "100%", minHeight: "100vh", backgroundColor: "#0b0c10",
      fontFamily: "Orbitron, sans-serif", color: "#66fcf1",
      overflowX: "hidden", paddingBottom: "80px",
    }}>
      {/* Top bar */}
      <div style={{
        background: "rgba(0,0,0,0.8)", borderBottom: "2px solid #45a29e",
        padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{
          color: "#66fcf1", textDecoration: "none", fontSize: "0.8rem", fontWeight: "bold",
          fontFamily: "Orbitron, sans-serif", border: "2px solid #66fcf1", borderRadius: "6px",
          padding: "6px 14px", background: "rgba(102,252,241,0.08)",
          boxShadow: "0 0 10px rgba(102,252,241,0.4)", letterSpacing: "1px",
        }}>
          &#8592; HOME PAGE
        </Link>
        <span style={{ fontSize: "0.7rem", color: "#c5c6c7", letterSpacing: "2px", textTransform: "uppercase" }}>
          Guild Activity
        </span>
      </div>

      {/* Section nav */}
      <div style={{
        background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(69,162,158,0.3)",
        padding: "0 20px", display: "flex", alignItems: "center", gap: "4px",
        overflowX: "auto", position: "sticky", top: "53px", zIndex: 49,
        scrollbarWidth: "none",
      }}>
        {SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              padding: "10px 14px", color: "#45a29e", textDecoration: "none",
              fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase",
              whiteSpace: "nowrap", borderBottom: "2px solid transparent",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = "#66fcf1"; (e.target as HTMLElement).style.borderBottomColor = "#66fcf1"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = "#45a29e"; (e.target as HTMLElement).style.borderBottomColor = "transparent"; }}
          >
            {s.emoji} {s.label}
          </a>
        ))}
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "30px 16px" }}>

        {/* Title */}
        <h1 style={{
          fontSize: "1.6rem", textAlign: "center", textShadow: "0 0 15px #66fcf1",
          letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px",
        }}>
          Guild Activity Report
        </h1>
        <p style={{ textAlign: "center", color: "#ffd700", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "30px" }}>
          {displayDate} · NomStead
        </p>

        {/* Guild totals */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
          borderRadius: "12px", padding: "20px 24px", marginBottom: "48px",
        }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", color: "#45a29e" }}>
            Guild Totals
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px" }}>
            {[
              { emoji: "👥", label: "Active Members",      value: active.length },
              { emoji: "🌾", label: "Items Harvested",     value: totals.totalHarvested },
              { emoji: "🌱", label: "Seeds Planted",       value: totals.totalPlanted },
              { emoji: "🪓", label: "Wood Chopped",        value: totals.totalWood },
              { emoji: "⛏️", label: "Minerals Mined",      value: totals.totalMined },
              { emoji: "🎣", label: "Fish Caught",         value: totals.totalFish },
              { emoji: "📋", label: "Quest Contributions", value: totals.totalQuest },
            ].map(({ emoji, label, value }) => (
              <div key={label} style={{ minWidth: "140px" }}>
                <div style={{ fontSize: "0.6rem", color: "#c5c6c7", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {emoji} {label}
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#66fcf1", marginTop: "2px" }}>
                  {fmt(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leaderboard grid ── */}
        <div id="leaderboards" style={{ scrollMarginTop: "110px", marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase",
            color: "#45a29e", marginBottom: "20px", borderBottom: "1px solid rgba(69,162,158,0.3)", paddingBottom: "10px",
          }}>
            🏆 Leaderboards
          </h2>

          {/* Overall — full width */}
          <div style={{
            background: "rgba(0,0,0,0.4)", border: "1px solid #45a29e",
            borderRadius: "10px", padding: "16px 20px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "#ffd700", marginBottom: "12px", fontWeight: "bold" }}>
              🏆 Overall — Activity Breadth + Score
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "2px" }}>
              {active.map((p, i) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.7rem", color: "#45a29e", minWidth: "28px", fontWeight: "bold" }}>{i < 3 ? MEDALS[i] : `#${i+1}`}</span>
                  <span style={{ fontSize: "0.75rem", color: "#c5c6c7", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "#66fcf1", fontWeight: "bold", whiteSpace: "nowrap" }}>{fmt(p.score)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category leaderboards — 3-col grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { emoji: "🌾", title: "Harvesting",    rows: harvestRanks.map(p => ({ name: p.name, value: sum(p.harvested) })),  unit: " items"    },
              { emoji: "🌱", title: "Planting",      rows: plantRanks.map(p => ({ name: p.name, value: sum(p.planted) })),      unit: " seeds"    },
              { emoji: "🪓", title: "Wood Chopping", rows: woodRanks.map(p => ({ name: p.name, value: p.trees })),              unit: " wood"     },
              { emoji: "⛏️", title: "Mining",        rows: mineRanks.map(p => ({ name: p.name, value: sum(p.mined) })),         unit: " minerals" },
              { emoji: "🎣", title: "Fishing",       rows: fishRanks.map(p => ({ name: p.name, value: sum(p.fished) })),        unit: " fish"     },
              { emoji: "📋", title: "Contributions", rows: questRanks.map(p => ({ name: p.name, value: sum(p.quests) })),       unit: " items"    },
            ].map(({ emoji, title, rows, unit }) => (
              <div key={title} style={{
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(69,162,158,0.5)",
                borderRadius: "10px", padding: "16px 20px",
              }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "#45a29e", marginBottom: "12px", fontWeight: "bold" }}>
                  {emoji} {title}
                </div>
                <LeaderboardTable rows={rows} unit={unit} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Full Details ── */}
        <Section id="details" emoji="📊" title="Full Member Details">
          {active.map((player, i) => (
            <PlayerCard key={player.name} player={player} rank={i} />
          ))}
        </Section>

        {/* ── Inactive Members ── */}
        <div id="inactive" style={{ scrollMarginTop: "110px", marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase",
            color: "#f87171", marginBottom: "20px", borderBottom: "1px solid rgba(248,113,113,0.3)", paddingBottom: "10px",
          }}>
            💤 Inactive Members
          </h2>
          <p style={{ fontSize: "0.7rem", color: "#c5c6c7", marginBottom: "16px", letterSpacing: "1px" }}>
            No activity recorded in guild logs for the following members.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {INACTIVE_MEMBERS.map(name => (
              <div key={name} style={{
                background: "rgba(248,113,113,0.06)",
                border: "1px solid rgba(248,113,113,0.35)",
                borderRadius: "8px", padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.85rem", color: "#c5c6c7", fontFamily: "Orbitron, sans-serif" }}>{name}</span>
                <span style={{ fontSize: "0.6rem", color: "#f87171", letterSpacing: "1px", textTransform: "uppercase" }}>inactive</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#45a29e66", fontSize: "0.6rem", letterSpacing: "1px", marginTop: "30px" }}>
          Generated from guild log · {date}
        </p>
      </div>
    </div>
  );
}
