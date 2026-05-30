"use client";
import Link from "next/link";
import activityData from "./activity-data.json";

// ── Types ──────────────────────────────────────────────────────────────────────
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
  treeChops: number;
  mineSwings: number;
  fishCasts: number;
  questContributions: number;
  goldEarned: number;
  vaultDonated: number;
  joinDate: string | null;
  guildStatus: "accepted" | "kicked" | null;
};

// ── Event Goals ────────────────────────────────────────────────────────────────
const WOOD_EVENT_TARGET = 650;
const MINE_EVENT_TARGET = 400;

const FISHING_EVENT: { fish: string; target: number; color: string }[] = [
  { fish: "Yellow Bluegill",  target: 250, color: "#f9c74f" },
  { fish: "Blue Bluegill",    target: 250, color: "#4fc3f7" },
  { fish: "Orange Bluegill",  target: 250, color: "#ff8c42" },
  { fish: "Crucian Carp",     target: 35,  color: "#80cfa9" },
  { fish: "Black Crappie",    target: 25,  color: "#90a4ae" },
  { fish: "Red Chubfish",     target: 25,  color: "#ef5350" },
  { fish: "Yellow Chubfish",  target: 25,  color: "#ffd54f" },
  { fish: "Grey Chubfish",    target: 25,  color: "#b0bec5" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function sorted(map: Record<string, number>): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}
function sum(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0);
}
function fmt(n: number) {
  return n.toLocaleString();
}

const MEDALS = ["🥇", "🥈", "🥉"];

function daysInGuild(joinDate: string | null): number | null {
  if (!joinDate) return null;
  const join = new Date(joinDate + "T00:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Specialty detection ────────────────────────────────────────────────────────
type Specialty = { key: string; label: string; emoji: string; color: string };

const SPECIALTIES: Specialty[] = [
  { key: "farming",      label: "Farmer",       emoji: "🌾", color: "#2e7d32" },
  { key: "fishing",      label: "Fisher",        emoji: "🎣", color: "#00838f" },
  { key: "woodcutting",  label: "Woodcutter",    emoji: "🪓", color: "#c68642" },
  { key: "mining",       label: "Miner",         emoji: "⛏️", color: "#b44dff" },
  { key: "quests",       label: "Quest Runner",  emoji: "📋", color: "#ffd700" },
];

function getSpecialty(player: Player): Specialty | null {
  const scores: Record<string, number> = {
    farming:     sum(player.harvested) + sum(player.planted),
    fishing:     sum(player.fished),
    woodcutting: player.trees,
    mining:      sum(player.mined),
    quests:      sum(player.quests),
  };
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) return null;
  return SPECIALTIES.find(s => s.key === best[0]) || null;
}

// Players exempt from the harvest-without-planting violation flag
const VIOLATION_EXEMPT = ["Dravyn"];

function isHarvestViolator(player: Player): boolean {
  if (VIOLATION_EXEMPT.includes(player.name)) return false;
  return sum(player.harvested) > 0 && sum(player.planted) === 0;
}

// ── Mini table ─────────────────────────────────────────────────────────────────
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

// ── Section block inside a player card ────────────────────────────────────────
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

// ── Badge ──────────────────────────────────────────────────────────────────────
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

// ── Player card ────────────────────────────────────────────────────────────────
function PlayerCard({ player, rank }: { player: Player; rank: number }) {
  const violation = isHarvestViolator(player);
  const days = daysInGuild(player.joinDate);
  const kicked = player.guildStatus === "kicked";
  const specialty = getSpecialty(player);
  const harv = sorted(player.harvested);
  const plant = sorted(player.planted);
  const mine = sorted(player.mined);
  const fish = sorted(player.fished);
  const quest = sorted(player.quests);

  const totalHarv  = sum(player.harvested);
  const totalPlant = sum(player.planted);
  const totalMine  = sum(player.mined);
  const totalFish  = sum(player.fished);
  const totalQuest = sum(player.quests);

  const medal = rank < 3 ? MEDALS[rank] + " " : "";

  return (
    <div style={{
      background: violation ? "rgba(60,0,0,0.55)" : "rgba(0,0,0,0.45)",
      border: `1px solid ${violation ? "#ff2d2d" : "#45a29e"}`,
      borderRadius: "12px",
      padding: "18px 20px",
      marginBottom: "16px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "baseline", gap: "10px",
        borderBottom: `1px solid ${violation ? "#ff2d2d44" : "#45a29e22"}`, paddingBottom: "10px", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "0.65rem", color: violation ? "#ff2d2d" : "#45a29e", minWidth: "22px" }}>
          #{rank + 1}
        </span>
        <h3 style={{ margin: 0, fontSize: "1rem", color: violation ? "#ff6b6b" : "#66fcf1", letterSpacing: "1px" }}>
          {medal}{player.name}
        </h3>
        {specialty && (
          <span style={{
            fontSize: "0.6rem", letterSpacing: "1px", whiteSpace: "nowrap",
            background: specialty.color + "22", border: `1px solid ${specialty.color}`,
            color: specialty.color, borderRadius: "4px", padding: "2px 7px",
          }}>
            {specialty.emoji} {specialty.label.toUpperCase()}
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
          {days !== null && (
            <span style={{
              fontSize: "0.6rem", letterSpacing: "1px",
              color: kicked ? "#888" : "#ffd700",
              border: `1px solid ${kicked ? "#555" : "#ffd70066"}`,
              borderRadius: "4px", padding: "2px 7px", whiteSpace: "nowrap",
            }}>
              {kicked ? `⚠ KICKED — Day ${days}` : `Day ${days}`}
            </span>
          )}
          {violation && (
            <span style={{
              fontSize: "0.6rem", letterSpacing: "1px",
              color: "#ff2d2d", border: "1px solid #ff2d2d", borderRadius: "4px",
              padding: "2px 7px", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              ⚠ Harvesting — Not Planting
            </span>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ marginBottom: "14px" }}>
        {totalHarv  ? <Badge label="Harvested" value={fmt(totalHarv) + " items"}    color="#00ff41" /> : null}
        {totalPlant ? <Badge label="Planted"   value={fmt(totalPlant) + " seeds"}   color="#00d9ff" /> : null}
        {player.trees ? <Badge label="Wood"    value={fmt(player.trees)}            color="#c68642" /> : null}
        {totalMine  ? <Badge label="Mined"     value={fmt(totalMine) + " minerals"} color="#b44dff" /> : null}
        {totalFish  ? <Badge label="Fished"    value={fmt(totalFish) + " fish"}     color="#00d9ff" /> : null}
        {totalQuest ? <Badge label="Quest"     value={fmt(totalQuest) + " items"}   color="#ffd700" /> : null}
      </div>

      {/* Detail sections */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px 30px" }}>
        {harv.length > 0 && (
          <CardSection emoji="🌾" title="Harvested">
            <MiniTable rows={harv} />
          </CardSection>
        )}
        {plant.length > 0 && (
          <CardSection emoji="🌱" title="Planted">
            <MiniTable rows={plant} unit=" seeds" />
          </CardSection>
        )}
        {player.trees > 0 && (
          <CardSection emoji="🪓" title="Tree Chopping">
            <MiniTable rows={[["Wood collected", player.trees]]} />
          </CardSection>
        )}
        {mine.length > 0 && (
          <CardSection emoji="⛏️" title="Mining">
            <MiniTable rows={mine} />
          </CardSection>
        )}
        {fish.length > 0 && (
          <CardSection emoji="🎣" title="Fishing">
            <MiniTable rows={fish} />
          </CardSection>
        )}
        {quest.length > 0 && (
          <CardSection emoji="📋" title="Daily Quest">
            <MiniTable rows={quest} />
          </CardSection>
        )}
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
      totalMined: number; totalFish: number; totalQuest: number; totalGold: number;
      totalVaultDonated: number; totalReinvested: number;
    };
    players: Player[];
  };

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

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
      }}>
        <Link href="/" style={{
          color: "#45a29e", textDecoration: "none",
          fontSize: "0.85rem", fontWeight: "bold", fontFamily: "Orbitron, sans-serif",
        }}>
          &larr; MOTHERSHIP
        </Link>
        <span style={{ fontSize: "0.7rem", color: "#c5c6c7", letterSpacing: "2px", textTransform: "uppercase" }}>
          Guild Activity
        </span>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "30px 16px" }}>

        {/* Title */}
        <h1 style={{
          fontSize: "1.6rem", textAlign: "center",
          textShadow: "0 0 15px #66fcf1", letterSpacing: "3px",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          Guild Activity Report
        </h1>
        <p style={{
          textAlign: "center", color: "#ffd700", fontSize: "0.75rem",
          letterSpacing: "2px", marginBottom: "30px",
        }}>
          {displayDate} · NomStead
        </p>

        {/* Summary box */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "2px solid #45a29e",
          borderRadius: "12px", padding: "20px 24px", marginBottom: "36px",
        }}>
          <h2 style={{
            margin: "0 0 16px 0", fontSize: "0.8rem", letterSpacing: "2px",
            textTransform: "uppercase", color: "#45a29e",
          }}>
            Guild Totals
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 28px" }}>
            {[
              { emoji: "👥", label: "Active Members",       value: players.length },
              { emoji: "🌾", label: "Items Harvested",      value: totals.totalHarvested },
              { emoji: "🌱", label: "Seeds Planted",        value: totals.totalPlanted },
              { emoji: "🪓", label: "Wood Chopped",         value: totals.totalWood },
              { emoji: "⛏️", label: "Minerals Mined",       value: totals.totalMined },
              { emoji: "🎣", label: "Fish Caught",          value: totals.totalFish },
              { emoji: "📋", label: "Quest Contributions",  value: totals.totalQuest },
              { emoji: "💰", label: "Gold Earned",          value: totals.totalGold },
              { emoji: "🏦", label: "Vault Donated",        value: totals.totalVaultDonated },
            ].map(({ emoji, label, value }) => (
              <div key={label} style={{ minWidth: "140px" }}>
                <div style={{ fontSize: "0.6rem", color: "#c5c6c7", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {emoji} {label}
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: label === "Gold Earned" ? "#ffd700" : "#66fcf1", marginTop: "2px" }}>
                  {label === "Gold Earned" ? (value as number).toFixed(2) : fmt(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Goals */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#ffd700", marginBottom: "6px", marginTop: "10px",
        }}>
          🏆 Guild Event — Personal Goals
        </h2>
        <p style={{ fontSize: "0.7rem", color: "#c5c6c7", marginBottom: "18px", letterSpacing: "1px" }}>
          Each member must hit all targets to complete the event and earn their reward.
        </p>

        {/* Wood goal */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid #c6864255",
          borderRadius: "12px", padding: "18px 24px", marginBottom: "16px",
        }}>
          <div style={{
            fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase",
            color: "#c68642", fontWeight: "bold", marginBottom: "14px",
          }}>
            🪓 Wood Cutting
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ color: "#c68642", fontWeight: "bold", fontSize: "0.78rem" }}>Tree Chops</span>
              <span style={{ color: "#ffd700", fontSize: "0.72rem", fontWeight: "bold" }}>Target: {fmt(WOOD_EVENT_TARGET)}</span>
            </div>
            <div style={{ height: "8px", background: "#ffffff11", borderRadius: "4px" }} />
            <div style={{ fontSize: "0.62rem", color: "#c5c6c7" }}>Not started</div>
          </div>
        </div>

        {/* Mining goal */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid #b44dff55",
          borderRadius: "12px", padding: "18px 24px", marginBottom: "16px",
        }}>
          <div style={{
            fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase",
            color: "#b44dff", fontWeight: "bold", marginBottom: "14px",
          }}>
            ⛏️ Mining
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ color: "#b44dff", fontWeight: "bold", fontSize: "0.78rem" }}>Rocks Mined</span>
              <span style={{ color: "#ffd700", fontSize: "0.72rem", fontWeight: "bold" }}>Target: {fmt(MINE_EVENT_TARGET)}</span>
            </div>
            <div style={{ height: "8px", background: "#ffffff11", borderRadius: "4px" }} />
            <div style={{ fontSize: "0.62rem", color: "#c5c6c7" }}>Not started — all mineral drops will be recorded</div>
          </div>
        </div>

        {/* Fishing goals */}
        <div style={{
          background: "rgba(0,0,0,0.5)", border: "1px solid #ffd70055",
          borderRadius: "12px", padding: "18px 24px", marginBottom: "40px",
        }}>
          <div style={{
            fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase",
            color: "#00838f", fontWeight: "bold", marginBottom: "14px",
          }}>
            🎣 Fishing
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {FISHING_EVENT.map(({ fish, target, color }) => (
              <div key={fish} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ color, fontWeight: "bold", fontSize: "0.78rem" }}>{fish}</span>
                  <span style={{ color: "#ffd700", fontSize: "0.72rem", fontWeight: "bold" }}>
                    Target: {fmt(target)}
                  </span>
                </div>
                <div style={{ height: "8px", background: "#ffffff11", borderRadius: "4px" }} />
                <div style={{ fontSize: "0.62rem", color: "#c5c6c7" }}>Not started</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wood Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#45a29e", marginBottom: "12px", marginTop: "40px",
        }}>
          🪓 Wood Cutting — Most to Least
        </h2>

        {/* Gold Axe reward explanation */}
        <div style={{
          background: "rgba(198,134,66,0.1)", border: "1px solid #c68642",
          borderRadius: "8px", padding: "12px 16px", marginBottom: "18px",
          fontSize: "0.72rem", color: "#c5c6c7", lineHeight: "1.7",
        }}>
          <span style={{ color: "#ffd700", fontWeight: "bold" }}>🪓 Gold Axe Reward</span>
          {"  ·  "}Collect <strong style={{ color: "#ffd700" }}>150 wood</strong> and FoxHole or Mrfaf will give you a Gold Axe.
          <br />
          A Gold Axe yields <strong style={{ color: "#c68642" }}>3 wood per chop</strong> and lasts <strong style={{ color: "#c68642" }}>~60 chops</strong> (180 wood total) before it breaks — reaching 150 means you{`'`}ve earned a replacement before your current one runs out.
        </div>

        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #45a29e",
          borderRadius: "12px", padding: "18px 20px", marginBottom: "36px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              {[...players].filter(p => p.trees > 0).sort((a, b) => b.trees - a.trees).map((p, i) => {
                const earned = p.trees >= 150;
                return (
                  <tr key={p.name} style={{
                    borderBottom: "1px solid #45a29e22",
                    background: earned ? "rgba(198,134,66,0.08)" : "transparent",
                  }}>
                    <td style={{ padding: "6px 8px", color: earned ? "#ffd700" : "#45a29e", width: "32px" }}>#{i + 1}</td>
                    <td style={{ padding: "6px 8px", color: earned ? "#ffd700" : "#66fcf1", fontWeight: earned ? "bold" : "normal" }}>
                      {i < 3 ? MEDALS[i] + " " : ""}{p.name}
                      {earned && (
                        <span style={{
                          marginLeft: "10px", fontSize: "0.6rem", letterSpacing: "1px",
                          background: "rgba(198,134,66,0.2)", border: "1px solid #c68642",
                          color: "#ffd700", borderRadius: "4px", padding: "1px 6px",
                        }}>
                          🪓 GOLD AXE EARNED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem" }}>
                      {fmt(p.treeChops)} chops
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: earned ? "#ffd700" : "#c68642", fontWeight: "bold" }}>
                      {earned ? `${fmt(p.trees)} wood` : `${fmt(p.trees)} / 150`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mining Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#45a29e", marginBottom: "12px",
        }}>
          ⛏️ Mining — Most to Least
        </h2>

        {/* Gold Pickaxe reward explanation */}
        <div style={{
          background: "rgba(180,77,255,0.08)", border: "1px solid #b44dff",
          borderRadius: "8px", padding: "12px 16px", marginBottom: "18px",
          fontSize: "0.72rem", color: "#c5c6c7", lineHeight: "1.7",
        }}>
          <span style={{ color: "#ffd700", fontWeight: "bold" }}>⛏️ Gold Pickaxe Reward</span>
          {"  ·  "}Reach <strong style={{ color: "#ffd700" }}>150 swings</strong> and FoxHole or Mrfaf will give you a Gold Pickaxe.
        </div>

        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #45a29e",
          borderRadius: "12px", padding: "18px 20px", marginBottom: "36px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              {[...players].filter(p => sum(p.mined) > 0).sort((a, b) => sum(b.mined) - sum(a.mined)).map((p, i) => {
                const earned = p.mineSwings >= 150;
                return (
                  <tr key={p.name} style={{
                    borderBottom: "1px solid #45a29e22",
                    background: earned ? "rgba(180,77,255,0.06)" : "transparent",
                  }}>
                    <td style={{ padding: "6px 8px", color: earned ? "#ffd700" : "#45a29e", width: "32px" }}>#{i + 1}</td>
                    <td style={{ padding: "6px 8px", color: earned ? "#ffd700" : "#66fcf1", fontWeight: earned ? "bold" : "normal" }}>
                      {i < 3 ? MEDALS[i] + " " : ""}{p.name}
                      {earned && (
                        <span style={{
                          marginLeft: "10px", fontSize: "0.6rem", letterSpacing: "1px",
                          background: "rgba(180,77,255,0.2)", border: "1px solid #b44dff",
                          color: "#ffd700", borderRadius: "4px", padding: "1px 6px",
                        }}>
                          ⛏️ GOLD PICKAXE EARNED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "6px 8px", fontSize: "0.65rem" }}>
                      {sorted(p.mined).map(([k, v], idx) => {
                        const color = k === "Pure gold ore" ? "#ffd700"
                                    : k === "Ruby"          ? "#e0115f"
                                    : k === "Silver"        ? "#c0c0c0"
                                    : k === "Iron"          ? "#9e9e9e"
                                    : "#c5c6c7";
                        const bold = k === "Pure gold ore" || k === "Ruby" || k === "Silver";
                        return (
                          <span key={k}>
                            {idx > 0 && <span style={{ color: "#c5c6c7" }}> · </span>}
                            <span style={{ color, fontWeight: bold ? "bold" : "normal" }}>
                              {k === "Ruby" && <span style={{ fontSize: "0.7rem" }}>♦ </span>}{k}: {v}
                            </span>
                          </span>
                        );
                      })}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem" }}>
                      {earned ? `${fmt(p.mineSwings)} swings` : `${fmt(p.mineSwings)} / 150`}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: earned ? "#ffd700" : "#b44dff", fontWeight: "bold" }}>
                      {fmt(sum(p.mined))} minerals
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Fishing Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#45a29e", marginBottom: "18px", marginTop: "40px",
        }}>
          🎣 Fishing — Most to Least
        </h2>
        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #45a29e",
          borderRadius: "12px", padding: "18px 20px", marginBottom: "36px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              {[...players].filter(p => p.fishCasts > 0).sort((a, b) => b.fishCasts - a.fishCasts).map((p, i) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #45a29e22" }}>
                  <td style={{ padding: "6px 8px", color: "#45a29e", width: "32px" }}>#{i + 1}</td>
                  <td style={{ padding: "6px 8px", color: "#66fcf1" }}>{i < 3 ? MEDALS[i] + " " : ""}{p.name}</td>
                  <td style={{ padding: "6px 8px", fontSize: "0.65rem" }}>
                    {sorted(p.fished).map(([k, v], idx) => {
                      const color = k.toLowerCase().includes("chub") || k.toLowerCase().includes("black crappie") ? "#4fc3f7"
                                  : k.toLowerCase().includes("golden koi") || k.toLowerCase().includes("lotus carp") ? "#ffd700"
                                  : "#c5c6c7";
                      const bold = color !== "#c5c6c7";
                      return (
                        <span key={k}>
                          {idx > 0 && <span style={{ color: "#c5c6c7" }}> · </span>}
                          <span style={{ color, fontWeight: bold ? "bold" : "normal" }}>{k}: {v}</span>
                        </span>
                      );
                    })}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "center", color: "#c5c6c7", fontSize: "0.65rem" }}>
                    {fmt(p.fishCasts)} casts
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "#00838f", fontWeight: "bold" }}>
                    {fmt(sum(p.fished))} fish
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Guild Contributions Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#45a29e", marginBottom: "18px", marginTop: "40px",
        }}>
          📋 Guild Contributions — Most to Least
        </h2>
        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #45a29e",
          borderRadius: "12px", overflow: "hidden", marginBottom: "36px",
        }}>
          {[...players].filter(p => sum(p.quests) > 0).sort((a, b) => sum(b.quests) - sum(a.quests)).map((p, i, arr) => (
            <div key={p.name} style={{
              padding: "14px 18px",
              borderBottom: i < arr.length - 1 ? "1px solid #45a29e22" : "none",
            }}>
              {/* Player header */}
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                marginBottom: "10px", borderBottom: "1px solid #45a29e22", paddingBottom: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontSize: "0.65rem", color: "#45a29e", minWidth: "22px" }}>#{i + 1}</span>
                  <span style={{ fontSize: "0.9rem", color: "#66fcf1", fontWeight: "bold" }}>
                    {i < 3 ? MEDALS[i] + " " : ""}{p.name}
                  </span>
                </div>
                <span style={{ fontSize: "0.65rem", color: "#ffd700", whiteSpace: "nowrap" }}>
                  {fmt(p.questContributions)} contributions · <strong>{fmt(sum(p.quests))} items</strong>
                </span>
              </div>
              {/* Items grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "2px 16px",
              }}>
                {sorted(p.quests).map(([k, v]) => (
                  <div key={k} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "0.68rem", padding: "2px 0",
                    borderBottom: "1px solid #ffffff08",
                  }}>
                    <span style={{ color: "#c5c6c7" }}>{k}</span>
                    <span style={{ color: "#66fcf1", fontWeight: "bold", marginLeft: "8px" }}>{fmt(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Gold Earnings Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#ffd700", marginBottom: "18px", marginTop: "40px",
        }}>
          💰 Gold Earned — Member Share
        </h2>
        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #ffd70055",
          borderRadius: "12px", padding: "18px 20px", marginBottom: "36px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              {[...players].filter(p => (p.goldEarned || 0) > 0).sort((a, b) => (b.goldEarned || 0) - (a.goldEarned || 0)).map((p, i) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #ffd70022" }}>
                  <td style={{ padding: "6px 8px", color: "#ffd70088", width: "32px" }}>#{i + 1}</td>
                  <td style={{ padding: "6px 8px", color: i < 3 ? "#ffd700" : "#66fcf1", fontWeight: i < 3 ? "bold" : "normal" }}>
                    {i < 3 ? MEDALS[i] + " " : ""}{p.name}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "#ffd700", fontWeight: "bold" }}>
                    {(p.goldEarned || 0).toFixed(2)} gold
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vault Donations Leaderboard */}
        <h2 style={{
          fontSize: "0.85rem", letterSpacing: "3px", textTransform: "uppercase",
          color: "#ffd700", marginBottom: "12px", marginTop: "40px",
        }}>
          🏦 Guild Vault — Player Donations
        </h2>
        <div style={{
          background: "rgba(255,215,0,0.04)", border: "1px solid #ffd70033",
          borderRadius: "8px", padding: "10px 16px", marginBottom: "18px",
          fontSize: "0.72rem", color: "#c5c6c7", lineHeight: "1.7",
        }}>
          <span style={{ color: "#ffd700", fontWeight: "bold" }}>🏦 Guild Vault</span>
          {"  ·  "}Total donated by players: <strong style={{ color: "#ffd700" }}>{fmt(totals.totalVaultDonated)} gold</strong>
          {"  ·  "}Auto-reinvested from rewards: <strong style={{ color: "#c68642" }}>{totals.totalReinvested.toFixed(2)} gold</strong>
        </div>
        <div style={{
          background: "rgba(0,0,0,0.45)", border: "1px solid #ffd70055",
          borderRadius: "12px", padding: "18px 20px", marginBottom: "36px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <tbody>
              {[...players].filter(p => (p.vaultDonated || 0) > 0).sort((a, b) => (b.vaultDonated || 0) - (a.vaultDonated || 0)).map((p, i) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #ffd70022" }}>
                  <td style={{ padding: "6px 8px", color: "#ffd70088", width: "32px" }}>#{i + 1}</td>
                  <td style={{ padding: "6px 8px", color: i < 3 ? "#ffd700" : "#66fcf1", fontWeight: i < 3 ? "bold" : "normal" }}>
                    {i < 3 ? MEDALS[i] + " " : ""}{p.name}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "#ffd700", fontWeight: "bold" }}>
                    {fmt(p.vaultDonated || 0)} gold
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{
          textAlign: "center", color: "#45a29e66",
          fontSize: "0.6rem", letterSpacing: "1px", marginTop: "30px",
        }}>
          Generated from guild log · {date}
        </p>
      </div>
    </div>
  );
}
