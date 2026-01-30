"use client";
import Link from "next/link";

const THEME = {
  bg: "#0a0a1a",
  headerGradient: "linear-gradient(to bottom, #1a0a0a, #0a0a1a)",
  primary: "#ff0033",
  secondary: "#ff003360",
  accent: "#ff4444",
  cardBg: "rgba(40, 10, 10, 0.8)",
  font: "Orbitron, sans-serif",
  textMuted: "#c5c6c7",
};

const FILE_NODE_PHASES = [
  {
    name: "Phase 1",
    subtitle: "Prerequisites + Registration",
    status: "Complete",
    statusColor: "#4ade80",
    details: [
      "76% of File Nodes registered to node dashboard",
      "Registered nodes earned 9.91 COPI/day (now RISE) per node",
      "Rewards distributed during July 2024",
    ],
  },
  {
    name: "Phase 2",
    subtitle: "The Owner's Choice",
    status: "Active",
    statusColor: "#fbbf24",
    details: [
      "Ongoing registration — new nodes earn rewards the following day",
      "Performance-based rewards gradually replacing flat payouts",
      "Transitioning from 1% to 90% performance-based by Jan 2026",
      "Public Node Pools Dashboard is live — view top pools by region",
    ],
  },
  {
    name: "Phase 3",
    subtitle: "Full Performance Mode",
    status: "Upcoming",
    statusColor: "#888",
    details: [
      "Details TBD — marks endpoint for Phase 2 reward structure",
      "Expected to be fully performance-based compensation",
    ],
  },
];

const PERFORMANCE_SCHEDULE = [
  { date: "Jul 2025", performance: "1%", base: "99%" },
  { date: "Aug 2025", performance: "10%", base: "90%" },
  { date: "Sep 2025", performance: "25%", base: "75%" },
  { date: "Oct 2025", performance: "40%", base: "60%" },
  { date: "Nov 2025", performance: "60%", base: "40%" },
  { date: "Dec 2025", performance: "75%", base: "25%" },
  { date: "Jan 2026", performance: "90%", base: "10%" },
];

const NODE_KEYS = [
  {
    chain: "Base",
    chainColor: "#0052ff",
    contract: "0x6AcD...DA02",
    price: "$300",
    supply: "10,000",
    status: "Available",
    statusColor: "#4ade80",
    marketUrl: "https://opensea.io/collection/infinity-rising-file-node-access-key",
    buildDate: "December 2024",
  },
  {
    chain: "Cardano",
    chainColor: "#0033ad",
    contract: "c170a933...a221",
    price: "$345",
    supply: "10,000",
    status: "Available",
    statusColor: "#4ade80",
    marketUrl: "https://www.jpg.store/collection/infinity-rising",
    buildDate: "July 2024 (original mint)",
  },
];

const NFT_COLLECTIONS = [
  {
    name: "Land - Zones 1-3",
    description: "Plot NFTs within theme zones. Pre-determined layouts with five size variations, empty and ready to build on.",
    marketUrl: "https://www.jpg.store/collection/cornucopias-land-zones",
    chain: "Cardano",
  },
  {
    name: "Bubblejett Sprinter",
    description: "Vehicle NFTs from the 2022 collection. Usable in-game for traversal and racing.",
    marketUrl: "https://www.jpg.store/collection/cornucopias-bubblejett-sprinter2022",
    chain: "Cardano",
  },
  {
    name: "File Node Access Key (Base)",
    description: "Node license NFTs on Base chain. Required for running File Nodes and earning $RISE rewards.",
    marketUrl: "https://opensea.io/collection/infinity-rising-file-node-access-key",
    chain: "Base",
  },
  {
    name: "File Node Access Key (Cardano)",
    description: "Node license NFTs on Cardano. Same functionality as Base version.",
    marketUrl: "https://www.jpg.store/collection/infinity-rising",
    chain: "Cardano",
  },
];

export default function InfinityRisingPage() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: THEME.bg,
        color: THEME.textMuted,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 20px",
          background: THEME.headerGradient,
          borderBottom: `2px solid ${THEME.primary}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: THEME.primary,
            textDecoration: "none",
            fontFamily: THEME.font,
            fontSize: "14px",
            padding: "8px 16px",
            background: "rgba(255, 0, 51, 0.1)",
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "8px",
          }}
        >
          ← Back to Game Hole
        </Link>
        <h1
          style={{
            fontFamily: THEME.font,
            fontSize: "24px",
            color: THEME.primary,
            margin: 0,
            textShadow: `0 0 10px rgba(255, 0, 51, 0.5)`,
          }}
        >
          Infinity Rising
        </h1>
        <div style={{ width: "150px" }} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          maxWidth: "960px",
          margin: "0 auto",
          padding: "24px 20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Token Overview */}
        <SectionTitle>$RISE Token</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <StatCard label="Token" value="$RISE" />
          <StatCard label="Max Supply" value="3B" />
          <StatCard label="Chains" value="Cardano + Base" />
          <StatCard label="Formerly" value="$COPI" />
        </div>

        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Rebranded from Cornucopias (COPI) — 1:1 migration Nov 13, 2025</li>
            <li>Available on <strong style={{ color: "#0033ad" }}>Cardano</strong> (native) and <strong style={{ color: "#0052ff" }}>Base</strong> (ERC-20)</li>
            <li>Used for marketplace transactions, governance, staking, and node rewards</li>
            <li>Node Rewards allocation: 241.4M RISE tokens</li>
            <li>Gameplay Rewards allocation: 724.1M RISE tokens</li>
            <li>Top exchanges: Minswap (ADA pair), MEXC, Aerodrome (Base)</li>
          </ul>
        </div>

        {/* File Node System */}
        <SectionTitle>File Node System</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0 0 16px 0", lineHeight: "1.6" }}>
            File Nodes are community-operated nodes that power game download distribution.
            Node pools deliver game files to new players, providing faster, decentralized onboarding.
            Year 1 paid out <strong style={{ color: THEME.accent }}>26 million COPI</strong> tokens
            evenly among all node license holders.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            <StatCard label="Total Minted" value="9,400" />
            <StatCard label="Sale Nodes" value="8,874" />
            <StatCard label="Year 1 Payout" value="26M COPI" />
            <StatCard label="Next 6 Months" value="13M RISE" />
          </div>
        </div>

        {/* Node Access Keys */}
        <SectionTitle>Node Access Keys</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {NODE_KEYS.map((key) => (
            <div
              key={key.chain}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${key.chainColor}60`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: key.chainColor,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: THEME.font,
                      fontSize: "16px",
                      color: key.chainColor,
                      fontWeight: "bold",
                    }}
                  >
                    {key.chain}
                  </span>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    background: `${key.statusColor}20`,
                    border: `1px solid ${key.statusColor}`,
                    borderRadius: "4px",
                    color: key.statusColor,
                    fontFamily: THEME.font,
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {key.status}
                </span>
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <div>Price: <strong style={{ color: THEME.accent }}>{key.price}</strong></div>
                <div>Supply: <strong>{key.supply}</strong></div>
                <div>Contract: <code style={{ fontSize: "12px", color: THEME.primary }}>{key.contract}</code></div>
                <div style={{ fontSize: "12px", color: "#888" }}>{key.buildDate}</div>
              </div>
              <a
                href={key.marketUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: "12px",
                  padding: "8px 16px",
                  background: `${key.chainColor}20`,
                  border: `1px solid ${key.chainColor}60`,
                  borderRadius: "8px",
                  color: key.chainColor,
                  fontFamily: THEME.font,
                  fontSize: "12px",
                  textAlign: "center",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                View on {key.chain === "Cardano" ? "JPG Store" : "OpenSea"} →
              </a>
            </div>
          ))}
        </div>

        {/* Phase Roadmap */}
        <SectionTitle>Node Phases</SectionTitle>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {FILE_NODE_PHASES.map((phase) => (
            <div
              key={phase.name}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${THEME.secondary}`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: THEME.font,
                      fontSize: "16px",
                      color: THEME.accent,
                      margin: "0 0 2px 0",
                    }}
                  >
                    {phase.name}
                  </h3>
                  <span style={{ fontSize: "13px", color: "#888" }}>
                    {phase.subtitle}
                  </span>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    background: `${phase.statusColor}20`,
                    border: `1px solid ${phase.statusColor}`,
                    borderRadius: "4px",
                    color: phase.statusColor,
                    fontFamily: THEME.font,
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {phase.status}
                </span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  lineHeight: "1.7",
                  fontSize: "14px",
                }}
              >
                {phase.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Performance Schedule */}
        <SectionTitle>Reward Transition Schedule</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
            overflowX: "auto",
          }}
        >
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", lineHeight: "1.5" }}>
            Rewards are transitioning from flat base payouts to performance-based (uptime, reliability, data served):
          </p>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}`, color: THEME.primary, fontFamily: THEME.font, fontSize: "11px" }}>Date</th>
                <th style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}`, color: "#4ade80", fontFamily: THEME.font, fontSize: "11px" }}>Performance</th>
                <th style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}`, color: "#888", fontFamily: THEME.font, fontSize: "11px" }}>Base</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_SCHEDULE.map((row) => (
                <tr key={row.date}>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}30` }}>{row.date}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}30`, color: "#4ade80", fontWeight: "bold" }}>{row.performance}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${THEME.secondary}30`, color: "#888" }}>{row.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NFT Collections */}
        <SectionTitle>NFT Collections</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {NFT_COLLECTIONS.map((col) => (
            <a
              key={col.name}
              href={col.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: THEME.cardBg,
                border: `1px solid ${THEME.secondary}`,
                borderRadius: "12px",
                padding: "16px",
                textDecoration: "none",
              }}
            >
              <h3
                style={{
                  fontFamily: THEME.font,
                  fontSize: "14px",
                  color: THEME.accent,
                  margin: "0 0 6px 0",
                }}
              >
                {col.name}
              </h3>
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: THEME.textMuted,
                }}
              >
                {col.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    background: col.chain === "Base" ? "#0052ff20" : "#0033ad20",
                    border: `1px solid ${col.chain === "Base" ? "#0052ff60" : "#0033ad60"}`,
                    borderRadius: "4px",
                    color: col.chain === "Base" ? "#0052ff" : "#0033ad",
                    fontFamily: THEME.font,
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {col.chain}
                </span>
                <span style={{ color: THEME.primary, fontSize: "12px" }}>
                  View →
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Links */}
        <SectionTitle>Quick Links</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <LinkCard label="Play Infinity Rising" href="https://infinityrising.io/" />
          <LinkCard label="$RISE Token Info" href="https://infinityrising.com/web3/rise-token" />
          <LinkCard label="File Node Details" href="https://infinityrising.com/blog/node-rewards" />
          <LinkCard label="JPG Store Collections" href="https://www.jpg.store/collection/cornucopias-land-zones" />
          <LinkCard label="YouTube Trailer" href="https://www.youtube.com/watch?v=yZECO2nDyu8" />
          <LinkCard label="CoinGecko" href="https://www.coingecko.com/en/coins/infinity-rising" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: THEME.cardBg,
        border: `1px solid ${THEME.secondary}`,
        borderRadius: "10px",
        padding: "14px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#888",
          marginBottom: "4px",
          fontFamily: THEME.font,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "18px",
          fontFamily: THEME.font,
          color: THEME.accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: THEME.font,
        fontSize: "18px",
        color: THEME.primary,
        margin: "0 0 16px 0",
        borderBottom: `1px solid ${THEME.secondary}`,
        paddingBottom: "8px",
      }}
    >
      {children}
    </h2>
  );
}

function LinkCard({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: THEME.cardBg,
        border: `1px solid ${THEME.secondary}`,
        borderRadius: "10px",
        padding: "16px",
        textAlign: "center",
        textDecoration: "none",
        color: THEME.primary,
        fontFamily: THEME.font,
        fontSize: "14px",
      }}
    >
      {label} →
    </a>
  );
}
