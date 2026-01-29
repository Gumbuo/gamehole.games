"use client";
import Link from "next/link";

const THEME = {
  bg: "#1a0a00",
  headerGradient: "linear-gradient(to bottom, #2a1500, #1a0a00)",
  primary: "#d4af37",
  secondary: "#8b6914",
  accent: "#f5d76e",
  cardBg: "rgba(42, 21, 0, 0.8)",
  font: "Orbitron, sans-serif",
  textMuted: "#d4c5a9",
};

const CANNON_TYPES = [
  {
    name: "Captain's Cannon",
    desc: "Default starter cannon. Balanced damage and reload.",
  },
  {
    name: "Normal Cannon",
    desc: "Standard broadside cannon. Reliable all-around choice.",
  },
  {
    name: "Gatling Cannon",
    desc: "Rapid-fire with low per-shot damage. Great for shredding sails.",
  },
  {
    name: "Scatter Cannon",
    desc: "Shotgun-style spread. Devastating at close range.",
  },
];

const CLASSES = [
  {
    name: "Demolitionist",
    color: "#e74c3c",
    focus: "Damage & Destruction",
    details: [
      "Maximizes cannon damage output",
      "Explosive abilities for area damage",
      "Best for aggressive playstyles",
    ],
  },
  {
    name: "Tactician",
    color: "#3498db",
    focus: "Crew Buffs & Strategy",
    details: [
      "Buffs crew reload speed and accuracy",
      "Defensive abilities and crowd control",
      "Ideal for team-oriented captains",
    ],
  },
  {
    name: "Tinkerer",
    color: "#2ecc71",
    focus: "Healing & Mines",
    details: [
      "Repair hull and shield during combat",
      "Deploy sea mines for area denial",
      "Strong sustain and utility role",
    ],
  },
];

const CHAINS = [
  {
    name: "Abstract",
    note: "Primary chain — ZK rollup L2",
    color: "#3b82f6",
    contract: "0xD3844AcCa3562b52a22e46fb56C5c29b621b0d33",
  },
  {
    name: "Ethereum",
    note: "Original deployment",
    color: "#627eea",
    contract: "0xB8F7709ef495a459e69BC7bCbABAadB80462f2A6",
  },
];

export default function CapnCoPage() {
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
          borderBottom: `2px solid ${THEME.secondary}`,
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
            background: "rgba(212, 175, 55, 0.1)",
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
            color: THEME.accent,
            margin: 0,
            textShadow: `0 0 10px rgba(212, 175, 55, 0.5)`,
          }}
        >
          Captain & Company Guide
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
        {/* Quick Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <LinkCard label="Play Now" href="https://capnco.gg/" />
          <LinkCard label="Wiki" href="https://wiki.capnco.gg/" />
          <LinkCard label="Docs" href="https://docs.capnco.gg/" />
          <LinkCard label="Blog" href="https://blog.capnco.gg/" />
        </div>

        {/* Getting Started */}
        <SectionTitle>Getting Started</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
            }}
          >
            <li>
              <strong style={{ color: THEME.accent }}>Free-to-play</strong> — no
              purchase required to start playing
            </li>
            <li>
              Play in your <strong style={{ color: THEME.accent }}>browser</strong>{" "}
              (PC or mobile) at{" "}
              <a
                href="https://capnco.gg/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: THEME.primary }}
              >
                capnco.gg
              </a>
            </li>
            <li>
              128-player naval battle MMORPG — massive open-sea battles
            </li>
            <li>
              Command your own ship, recruit crew, and battle for treasure on
              the high seas
            </li>
          </ul>
        </div>

        {/* Game Modes */}
        <SectionTitle>Game Modes</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: THEME.font,
                fontSize: "16px",
                color: "#e74c3c",
                margin: "0 0 8px 0",
              }}
            >
              Deathmatch
            </h3>
            <p style={{ margin: 0, lineHeight: "1.6", fontSize: "14px" }}>
              All-out PvP combat. Sink enemy ships to earn points and climb the
              leaderboard. Last ship standing wins glory and rewards.
            </p>
          </div>
          <div
            style={{
              background: THEME.cardBg,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: THEME.font,
                fontSize: "16px",
                color: "#f39c12",
                margin: "0 0 8px 0",
              }}
            >
              Pillage
            </h3>
            <p style={{ margin: 0, lineHeight: "1.6", fontSize: "14px" }}>
              Objective-based mode. Raid enemy ports, steal treasure, and
              deliver loot back to your base. Teamwork and strategy are key.
            </p>
          </div>
        </div>

        {/* Ship Combat */}
        <SectionTitle>Ship Combat</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "15px",
              color: THEME.accent,
              margin: "0 0 12px 0",
            }}
          >
            Ship Components
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              {
                name: "Shield",
                desc: "First line of defense. Regenerates over time.",
                color: "#3498db",
              },
              {
                name: "Hull",
                desc: "Core HP. When it hits zero, your ship sinks.",
                color: "#95a5a6",
              },
              {
                name: "Sails",
                desc: "Controls speed. Damaged sails slow you down.",
                color: "#ecf0f1",
              },
              {
                name: "Cannons",
                desc: "Your weapons. Different types for different tactics.",
                color: "#e67e22",
              },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${c.color}40`,
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: "13px",
                    color: c.color,
                    marginBottom: "4px",
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
                  {c.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "15px",
              color: THEME.accent,
              margin: "0 0 12px 0",
            }}
          >
            Cannon Types
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {CANNON_TYPES.map((c) => (
              <div
                key={c.name}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "baseline",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: THEME.font,
                    fontSize: "13px",
                    color: THEME.primary,
                    minWidth: "150px",
                  }}
                >
                  {c.name}
                </span>
                <span style={{ fontSize: "13px" }}>{c.desc}</span>
              </div>
            ))}
          </div>
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
          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "15px",
              color: THEME.accent,
              margin: "0 0 8px 0",
            }}
          >
            Other Combat Mechanics
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            <li>
              <strong style={{ color: THEME.primary }}>Ramming</strong> — sail
              directly into enemy ships to deal hull damage
            </li>
            <li>
              <strong style={{ color: THEME.primary }}>Wind</strong> — affects
              ship speed and maneuverability; sail with the wind for a boost
            </li>
            <li>
              <strong style={{ color: THEME.primary }}>Drifting</strong> —
              momentum-based turning allows skilled captains to broadside while
              moving
            </li>
          </ul>
        </div>

        {/* Classes & Talent Trees */}
        <SectionTitle>Classes & Talent Trees</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {CLASSES.map((cls) => (
            <div
              key={cls.name}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${cls.color}60`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3
                style={{
                  fontFamily: THEME.font,
                  fontSize: "16px",
                  color: cls.color,
                  margin: "0 0 4px 0",
                }}
              >
                {cls.name}
              </h3>
              <div
                style={{
                  fontSize: "12px",
                  color: THEME.secondary,
                  marginBottom: "12px",
                  fontFamily: THEME.font,
                }}
              >
                {cls.focus}
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  lineHeight: "1.7",
                  fontSize: "13px",
                }}
              >
                {cls.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Economy & Tokens */}
        <SectionTitle>Economy & Tokens</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
            }}
          >
            <li>
              <strong style={{ color: THEME.accent }}>$CNC Token</strong> — the
              primary governance and reward token for Captain & Company
            </li>
            <li>
              <strong style={{ color: "#f39c12" }}>Nuggies</strong> — in-game
              soft currency earned through gameplay; used for upgrades and
              cosmetics
            </li>
            <li>
              <strong style={{ color: THEME.primary }}>Doubloons</strong> —
              premium currency; can be earned or purchased for special items
            </li>
            <li>
              <strong style={{ color: THEME.accent }}>Node System</strong> —
              run a Captain & Company node to earn $CNC rewards
            </li>
            <li>
              <strong style={{ color: THEME.accent }}>
                Staking & Lock Schedule
              </strong>{" "}
              — stake $CNC with lock periods for boosted yields; longer locks
              earn higher multipliers
            </li>
          </ul>
        </div>

        {/* Pirate Pass */}
        <SectionTitle>Pirate Pass</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
            }}
          >
            <li>
              <strong style={{ color: THEME.accent }}>$5 for 30 days</strong> of
              premium access
            </li>
            <li>Boosted $CNC and Nuggie earning rates</li>
            <li>Exclusive cosmetics and ship customization options</li>
            <li>Priority queue for new game modes and events</li>
            <li>
              Purchase with crypto or fiat at{" "}
              <a
                href="https://capnco.gg/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: THEME.primary }}
              >
                capnco.gg
              </a>
            </li>
          </ul>
        </div>

        {/* Blockchain */}
        <SectionTitle>Blockchain Deployments</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {CHAINS.map((chain) => (
            <div
              key={chain.name}
              style={{
                background: THEME.cardBg,
                border: `1px solid ${chain.color}60`,
                borderRadius: "10px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: THEME.font,
                  fontSize: "16px",
                  color: chain.color,
                  marginBottom: "6px",
                }}
              >
                {chain.name}
              </div>
              <div style={{ fontSize: "13px", color: THEME.textMuted, marginBottom: "6px" }}>
                {chain.note}
              </div>
              <code
                style={{
                  fontSize: "11px",
                  color: THEME.secondary,
                  background: "rgba(139, 105, 20, 0.15)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  wordBreak: "break-all",
                }}
              >
                {chain.contract}
              </code>
            </div>
          ))}
        </div>

        {/* Guilds & Delegation */}
        <SectionTitle>Guilds & Delegation</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
            }}
          >
            <li>
              <strong style={{ color: THEME.accent }}>Ship Delegation</strong> —
              lend your ship to other players and earn a share of their rewards
            </li>
            <li>
              <strong style={{ color: THEME.accent }}>Reward Sharing</strong> —
              configurable split between ship owner and borrower
            </li>
            <li>
              Join or create guilds to coordinate battles, share resources, and
              dominate the seas together
            </li>
          </ul>
        </div>

        {/* Soneium Score / Sony Campaign */}
        <SectionTitle>Sony Soneium Score Campaign</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid #7c3aed60`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <p style={{ margin: "0 0 12px 0", lineHeight: "1.6", fontSize: "14px" }}>
            <strong style={{ color: "#7c3aed" }}>Soneium</strong> is Sony&apos;s
            Ethereum Layer 2 blockchain (OP Stack). While Captain & Company
            isn&apos;t deployed on Soneium, the Soneium Score campaign is a
            separate opportunity for web3 gamers to earn potential future rewards
            from Sony&apos;s ecosystem.
          </p>
          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "14px",
              color: "#7c3aed",
              margin: "0 0 8px 0",
            }}
          >
            What is Soneium Score?
          </h3>
          <ul
            style={{
              margin: "0 0 16px 0",
              paddingLeft: "20px",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            <li>On-chain proof-of-contribution system that tracks and rewards participation</li>
            <li>28-day seasons — currently Season 6 (Jan 14 – Feb 11, 2026)</li>
            <li>Score 80+ out of 100 each season to earn a permanent SBT badge</li>
            <li>No confirmed airdrop yet, but badge holders may be eligible for future rewards</li>
          </ul>

          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "14px",
              color: "#7c3aed",
              margin: "0 0 8px 0",
            }}
          >
            How to Participate
          </h3>
          <ol
            style={{
              margin: "0 0 16px 0",
              paddingLeft: "20px",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            <li>
              <strong style={{ color: THEME.accent }}>Bridge ETH to Soneium</strong>{" "}
              — use{" "}
              <a href="https://superbridge.app/soneium" target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary }}>
                Superbridge
              </a>{" "}
              or{" "}
              <a href="https://relay.link/" target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary }}>
                Relay
              </a>
            </li>
            <li>
              <strong style={{ color: THEME.accent }}>Connect wallet</strong> at the
              Soneium Score campaign page on{" "}
              <a href="https://soneium.org/" target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary }}>
                soneium.org
              </a>
            </li>
            <li>
              <strong style={{ color: THEME.accent }}>Earn across 4 categories</strong>
            </li>
          </ol>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                name: "Activity Score",
                desc: "Transaction frequency, active days, streaks",
              },
              {
                name: "Liquidity Score",
                desc: "LP contributions on Aave, Velodrome, QuickSwap, etc.",
              },
              {
                name: "NFT Score",
                desc: "Participate in NFT activities announced each season",
              },
              {
                name: "Bonus Score",
                desc: "Temporary partner activities and special tasks",
              },
            ].map((cat) => (
              <div
                key={cat.name}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid #7c3aed30",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: "12px",
                    color: "#7c3aed",
                    marginBottom: "4px",
                  }}
                >
                  {cat.name}
                </div>
                <div style={{ fontSize: "12px", lineHeight: "1.4" }}>{cat.desc}</div>
              </div>
            ))}
          </div>

          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "14px",
              color: "#7c3aed",
              margin: "0 0 8px 0",
            }}
          >
            Quick Ways to Earn Points
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            <li>Swap tokens on Uniswap (Soneium) — each swap counts toward Activity Score</li>
            <li>Bridge via Meson at least 3 times for bonus NFT</li>
            <li>Swap $100+ from any chain to Soneium via Rango for an NFT Badge</li>
            <li>Provide liquidity on Velodrome, Aave, or Kyo Finance</li>
            <li>Maintain daily streaks for multiplied Activity Score</li>
          </ul>
        </div>

        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid #7c3aed60`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontFamily: THEME.font,
              fontSize: "14px",
              color: "#7c3aed",
              margin: "0 0 8px 0",
            }}
          >
            Soneium Stats
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              { label: "Transactions", value: "500M+" },
              { label: "Active Wallets", value: "5.4M" },
              { label: "Live dApps", value: "250+" },
              { label: "Backed By", value: "Sony" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: THEME.secondary,
                    fontFamily: THEME.font,
                    marginBottom: "4px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontFamily: THEME.font,
                    color: "#7c3aed",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <SectionTitle>More Resources</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <LinkCard label="Play Now" href="https://capnco.gg/" />
          <LinkCard label="Wiki" href="https://wiki.capnco.gg/" />
          <LinkCard label="Docs" href="https://docs.capnco.gg/" />
          <LinkCard label="Blog" href="https://blog.capnco.gg/" />
        </div>
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
