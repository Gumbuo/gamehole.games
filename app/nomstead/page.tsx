"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NomSteadStats {
  nftCount?: number;
  activeListings?: number;
  floorPrice?: string;
  floorCurrency?: string;
  marketplaceUrl?: string;
}

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

const COLLECTIONS = [
  {
    name: "Tiles",
    contract: "0x213d...2c6",
    description: "Land plot NFTs that form the NomStead world map.",
    details: [
      "Infinite standard grassland tiles available",
      "Scarce special tiles: forests, mountains, rivers",
      "Only 10 Stadium tiles exist — ultra-rare PvP arenas",
      "Tile type determines resource gathering and building options",
    ],
    marketUrl:
      "https://sphere.market/immutable/collection/0x213d44664cdf6c79abe73bf9310ec68e0329a2c6",
  },
  {
    name: "Genesis Chests",
    contract: "0x80f2...ccc",
    description:
      "Capped at 4,000 total. Each chest reveals a tile + Visa pass on July 15.",
    tiers: [
      {
        name: "Wood",
        supply: "3,500",
        price: "$30",
        color: "#a0522d",
        perks: "Standard grassland tile, 1-month Visa pass",
      },
      {
        name: "Emerald",
        supply: "400",
        price: "$150",
        color: "#50c878",
        perks: "Larger & rarer plot types, 3-month Visa pass",
      },
      {
        name: "Sapphire",
        supply: "100",
        price: "$300",
        color: "#4169e1",
        perks: "Premium plots, 12-month Visa, Stadium access chance",
      },
    ],
    note: "Fully tradable on secondary markets before the July 15 reveal event.",
    marketUrl:
      "https://sphere.market/immutable/collection/0x80f2f7100e4155105c6ea4e3b822726cbe56cccc",
  },
  {
    name: "Companions",
    contract: "0x3167...dc9",
    description: "Companion NFTs that accompany your character. Utility TBD.",
    details: [
      "Collectible companion creatures",
      "Full utility details to be revealed",
      "Tradable on Sphere marketplace",
    ],
    marketUrl:
      "https://sphere.market/immutable/collection/0x3167dd54e6fe1b7d4a9688af031c7c00f1dcfdc9",
  },
];

export default function NomSteadPage() {
  const [stats, setStats] = useState<NomSteadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nomstead?game=nomstead")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            background: "rgba(102, 252, 241, 0.1)",
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
            textShadow: `0 0 10px rgba(74, 222, 128, 0.5)`,
          }}
        >
          NomStead Guide
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
        {/* Live Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            label="NFTs Minted"
            value={
              loading
                ? "..."
                : stats?.nftCount?.toLocaleString() ?? "—"
            }
          />
          <StatCard
            label="Active Listings"
            value={
              loading
                ? "..."
                : stats?.activeListings?.toLocaleString() ?? "—"
            }
          />
          <StatCard
            label="Floor Price"
            value={
              loading
                ? "..."
                : stats?.floorPrice
                  ? `$${stats.floorPrice} ${stats.floorCurrency ?? ""}`
                  : "—"
            }
          />
          <StatCard
            label="Marketplace"
            value="Sphere"
            link="https://sphere.market/immutable/collection/0x213d44664cdf6c79abe73bf9310ec68e0329a2c6"
          />
        </div>

        {/* Collections */}
        <SectionTitle>NFT Collections</SectionTitle>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          {COLLECTIONS.map((col) => (
            <div
              key={col.name}
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
                <h3
                  style={{
                    fontFamily: THEME.font,
                    fontSize: "18px",
                    color: THEME.accent,
                    margin: 0,
                  }}
                >
                  {col.name}
                </h3>
                <code
                  style={{
                    fontSize: "12px",
                    color: THEME.secondary,
                    background: "rgba(69, 162, 158, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {col.contract}
                </code>
              </div>
              <p style={{ margin: "0 0 12px 0", lineHeight: "1.5" }}>
                {col.description}
              </p>

              {col.details && (
                <ul
                  style={{
                    margin: "0 0 12px 0",
                    paddingLeft: "20px",
                    lineHeight: "1.7",
                  }}
                >
                  {col.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}

              {col.tiers && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {col.tiers.map((t) => (
                    <div
                      key={t.name}
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${t.color}`,
                        borderRadius: "8px",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: THEME.font,
                          fontSize: "14px",
                          color: t.color,
                          marginBottom: "4px",
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                        {t.supply} supply · {t.price}
                      </div>
                      <div style={{ fontSize: "12px", color: THEME.secondary }}>
                        {t.perks}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {col.note && (
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "13px",
                    color: THEME.accent,
                    fontStyle: "italic",
                  }}
                >
                  {col.note}
                </p>
              )}

              <a
                href={col.marketUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: THEME.primary,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                View on Sphere →
              </a>
            </div>
          ))}
        </div>

        {/* Economy Overview */}
        <SectionTitle>Economy Overview</SectionTitle>
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
              <strong style={{ color: "#fbbf24" }}>Gold</strong> &{" "}
              <strong style={{ color: "#d1d5db" }}>Silver</strong> are in-game
              currencies — a fungible token is in development
            </li>
            <li>
              Burn mechanics (consumable combat gear, gold sinks) are designed
              to prevent inflation
            </li>
            <li>
              Player-driven marketplace with true on-chain ownership via
              Immutable zkEVM
            </li>
            <li>
              Gas-free transactions through Immutable Passport — no wallet
              fees for players
            </li>
          </ul>
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
          <LinkCard
            label="Full Wiki & Item Guide"
            href="/nomstead/wiki"
            internal
          />
          <LinkCard
            label="Play NomStead"
            href="https://play.immutable.com/games/nomstead/"
          />
          <LinkCard
            label="Sphere Marketplace"
            href="https://sphere.market/immutable/collection/0x213d44664cdf6c79abe73bf9310ec68e0329a2c6"
          />
          <LinkCard
            label="YouTube Trailer"
            href="https://www.youtube.com/watch?v=sdQtdwdVduY"
          />
        </div>

        {/* Roadmap */}
        <SectionTitle>Roadmap Highlights</SectionTitle>
        <div
          style={{
            background: THEME.cardBg,
            border: `1px solid ${THEME.secondary}`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                title: "Guilds",
                desc: "Cooperative resource sharing and group objectives",
              },
              {
                title: "PvP Combat",
                desc: "Battle other players in Stadium tiles",
              },
              {
                title: "Fungible Token",
                desc: "On-chain tradable currency launch",
              },
              {
                title: "Land Expansion",
                desc: "Expanded land tokenization and new biomes",
              },
            ].map((item) => (
              <div key={item.title} style={{ lineHeight: "1.5" }}>
                <div
                  style={{
                    fontFamily: THEME.font,
                    fontSize: "14px",
                    color: THEME.accent,
                    marginBottom: "4px",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: "13px" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  const content = (
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
          color: THEME.secondary,
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
          color: link ? THEME.primary : THEME.accent,
        }}
      >
        {value}
      </div>
    </div>
  );

  if (link)
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        {content}
      </a>
    );
  return content;
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

function LinkCard({ label, href, internal }: { label: string; href: string; internal?: boolean }) {
  const style = {
    display: "block",
    background: THEME.cardBg,
    border: `1px solid ${THEME.secondary}`,
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center" as const,
    textDecoration: "none",
    color: THEME.primary,
    fontFamily: THEME.font,
    fontSize: "14px",
  };

  if (internal) {
    return (
      <Link href={href} style={style}>
        {label} →
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      {label} →
    </a>
  );
}
