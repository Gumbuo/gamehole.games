"use client";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventStatus = "ACTIVE" | "UPCOMING" | "ENDED";

interface TierItem {
  name: string;
  qty: string;
  note?: string;
}

interface Tier {
  name: string;
  subtitle: string;
  color: string;
  border: string;
  bg: string;
  pricePerItem: string;
  playerCap: string;
  totalCap: string;
  items: TierItem[];
}

interface GuildEvent {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  dateRange: string;
  tiers: Tier[];
  rules: string[];
}

// ─── Event Data ───────────────────────────────────────────────────────────────

const EVENTS: GuildEvent[] = [
  // ── Event 2 (Active — shows on top) ──
  {
    id: "event-2",
    title: "NomStead Guild Item Exchange — Event 2",
    description:
      "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below. Now includes Tier D — Tools & Materials!",
    status: "ACTIVE",
    dateRange: "Mar 1 – Mar 31, 2025",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "$0.00083",
        playerCap: "$6 max per player",
        totalCap: "12,000 items",
        items: [
          { name: "Cotton", qty: "2k", note: "$0.00083 each" },
          { name: "Potatoes", qty: "2k", note: "$0.00083 each" },
          { name: "Red Flower", qty: "2k", note: "$0.00083 each" },
          { name: "Blue Flower", qty: "2k", note: "$0.00083 each" },
          { name: "Yellow Flower", qty: "2k", note: "$0.00083 each" },
          { name: "Grapes", qty: "2k", note: "$0.00083 each" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "$0.0009",
        playerCap: "$6 max per player",
        totalCap: "8,000 items",
        items: [
          { name: "Wrapped Potato", qty: "2k", note: "$0.0009 each" },
          { name: "Fries", qty: "2k", note: "$0.0009 each" },
          { name: "Veggie Salad", qty: "2k", note: "$0.0009 each" },
          { name: "Soil", qty: "2k", note: "$0.002 each" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "varies",
        playerCap: "$6 max per player",
        totalCap: "1,775 items",
        items: [
          { name: "Golden Potato Cake", qty: "x5", note: "$0.035 each" },
          { name: "Pumpkin Spice Cake", qty: "x5", note: "$0.035 each" },
          { name: "Carrot Cake", qty: "x5", note: "$0.035 each" },
          { name: "Grape Tart Cake", qty: "x5", note: "$0.035 each" },
          { name: "Upside-Down Tomato Cake", qty: "x5", note: "$0.035 each" },
          { name: "Wheat Flour", qty: "x250", note: "$0.035 each" },
          { name: "Wine", qty: "x1500", note: "$0.0025 each" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "$0.009",
        playerCap: "$7 max per player",
        totalCap: "3,000 items",
        items: [
          { name: "Wood", qty: "1.5k", note: "$0.009 each" },
          { name: "Stone", qty: "1.5k", note: "$0.009 each" },
        ],
      },
    ],
    rules: [
      "Each player can earn up to $25 total ($6 per tier A/B/C + $7 for tier D).",
      "Max event pool: $150.",
      "Items must be sent to the guild vault before payout.",
      "Soil in Tier B is priced at $0.002 each (double the base rate).",
      "Tier D: Wood and Stone at $0.009 each.",
      "Caps are per player — unused budget rolls into future event pools.",
      "PM FoxHole on Discord to coordinate your exchange.",
    ],
  },
  // ── Event 1 (Ended — shows below) ──
  {
    id: "event-1",
    title: "NomStead Guild Item Exchange — Event 1",
    description:
      "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below.",
    status: "ENDED",
    dateRange: "Feb 1 – Feb 28, 2025",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "$0.00083",
        playerCap: "$5 max per player",
        totalCap: "6,000 items",
        items: [
          { name: "Cotton", qty: "1k" },
          { name: "Potatoes", qty: "1k" },
          { name: "Red Flower", qty: "1k" },
          { name: "Blue Flower", qty: "1k" },
          { name: "Yellow Flower", qty: "1k" },
          { name: "Grapes", qty: "1k" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "$0.001",
        playerCap: "$5 max per player",
        totalCap: "5,000 items",
        items: [
          { name: "Wrapped Potato", qty: "1k" },
          { name: "Fries", qty: "1k" },
          { name: "Veggie Salad", qty: "1k" },
          { name: "Soil", qty: "1k", note: "$0.002 each" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "$0.10 / cake",
        playerCap: "$5 max per player",
        totalCap: "50 cakes",
        items: [
          { name: "Golden Potato Cake", qty: "x10" },
          { name: "Pumpkin Spice Cake", qty: "x10" },
          { name: "Carrot Cake", qty: "x10" },
          { name: "Grape Tart Cake", qty: "x10" },
          { name: "Upside-Down Tomato Cake", qty: "x10" },
        ],
      },
    ],
    rules: [
      "Each player is capped at $5 per tier.",
      "Items must be sent to the guild vault before payout.",
      "Soil in Tier B is priced at $0.002 each (double the base rate).",
      "Tier caps are first-come, first-served — once the total cap is hit, the tier closes.",
      "PM FoxHole on Discord to coordinate your exchange.",
    ],
  },
];

// ─── Status badge color map ────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: "rgba(0,255,65,0.15)", text: "#00ff41", border: "#00ff41" },
  UPCOMING: { bg: "rgba(255,215,0,0.15)", text: "#ffd700", border: "#ffd700" },
  ENDED: { bg: "rgba(255,71,87,0.15)", text: "#ff4757", border: "#ff4757" },
};

// ─── Sort: active/upcoming first, ended last ──────────────────────────────────
const STATUS_ORDER: Record<EventStatus, number> = { ACTIVE: 0, UPCOMING: 1, ENDED: 2 };

function EventSection({ event }: { event: GuildEvent }) {
  const statusStyle = STATUS_COLORS[event.status] ?? STATUS_COLORS.ACTIVE;
  const isEnded = event.status === "ENDED";

  return (
    <section
      style={{
        opacity: isEnded ? 0.5 : 1,
        filter: isEnded ? "saturate(0.4)" : "none",
        transition: "opacity 0.3s",
        marginBottom: "60px",
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: "1.8rem",
          textAlign: "center",
          background: isEnded
            ? "linear-gradient(90deg, #666, #888)"
            : "linear-gradient(90deg, #00d4ff, #00ff99)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {event.title}
      </h2>

      {/* Date range */}
      <p
        style={{
          textAlign: "center",
          color: "#666",
          fontSize: "0.8rem",
          fontFamily: "Share Tech Mono, monospace",
          letterSpacing: "1px",
          marginTop: 0,
          marginBottom: "12px",
        }}
      >
        {event.dateRange}
      </p>

      {/* Status badge */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 18px",
            border: `2px solid ${statusStyle.border}`,
            borderRadius: "20px",
            background: statusStyle.bg,
            color: statusStyle.text,
            fontSize: "0.75rem",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}
        >
          {event.status}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          textAlign: "center",
          color: "#888",
          fontSize: "0.85rem",
          lineHeight: "1.7",
          maxWidth: "650px",
          margin: "0 auto 40px auto",
          fontFamily: "Share Tech Mono, monospace",
        }}
      >
        {event.description}
      </p>

      {/* Tier Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "30px",
          marginBottom: "40px",
        }}
      >
        {event.tiers.map((tier) => (
          <div
            key={tier.name}
            style={{
              background: tier.bg,
              border: `2px solid ${tier.border}`,
              borderRadius: "16px",
              padding: "30px 26px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Tier header */}
            <div>
              <h3
                style={{
                  color: tier.color,
                  fontSize: "1.6rem",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                {tier.name}
              </h3>
              <span
                style={{
                  color: "#888",
                  fontSize: "0.9rem",
                  fontFamily: "Share Tech Mono, monospace",
                }}
              >
                {tier.subtitle}
              </span>
            </div>

            {/* Pricing info */}
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                borderRadius: "10px",
                padding: "14px 18px",
                fontSize: "0.9rem",
                color: "#aaa",
                fontFamily: "Share Tech Mono, monospace",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <span>
                Price: <strong style={{ color: tier.color }}>{tier.pricePerItem}</strong>
              </span>
              <span>
                Cap: <strong style={{ color: "#fff" }}>{tier.totalCap}</strong>
              </span>
              <span>
                Per player: <strong style={{ color: "#ffd700" }}>{tier.playerCap}</strong>
              </span>
            </div>

            {/* Item list */}
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {tier.items.map((item) => (
                <li
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    fontFamily: "Share Tech Mono, monospace",
                  }}
                >
                  <span style={{ color: "#e0e0e0" }}>{item.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: tier.color, fontWeight: "bold" }}>{item.qty}</span>
                    {item.note && (
                      <span
                        style={{
                          color: "#ffd700",
                          fontSize: "0.8rem",
                          background: "rgba(255,215,0,0.15)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {item.note}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "2px solid #00d4ff40",
          borderRadius: "12px",
          padding: "24px 20px",
        }}
      >
        <h3
          style={{
            color: "#00d4ff",
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginTop: 0,
            marginBottom: "16px",
          }}
        >
          Rules &amp; How to Participate
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {event.rules.map((rule, i) => (
            <li
              key={i}
              style={{
                color: "#aaa",
                fontSize: "0.8rem",
                lineHeight: "1.6",
                paddingLeft: "18px",
                position: "relative",
                fontFamily: "Share Tech Mono, monospace",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  color: "#00d4ff",
                  fontWeight: "bold",
                }}
              >
                &bull;
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function GuildEventsPage() {
  const sorted = [...EVENTS].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)",
        fontFamily: "Orbitron, sans-serif",
        color: "#00d4ff",
        overflowX: "hidden",
        paddingBottom: "60px",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "rgba(10, 10, 26, 0.95)",
          borderBottom: "2px solid #00d4ff",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#00d4ff",
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
            color: "#888",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Guild Events
        </span>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 16px" }}>
        {/* Page heading */}
        <h1
          style={{
            fontSize: "2rem",
            textAlign: "center",
            background: "linear-gradient(90deg, #00d4ff, #00ff99)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          Guild Events
        </h1>

        {sorted.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
