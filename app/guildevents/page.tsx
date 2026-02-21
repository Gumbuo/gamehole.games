"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventStatus = "ACTIVE" | "UPCOMING" | "ENDED";

interface TierItem {
  name: string;
  qty: string;
  note?: string;
  cap?: string;
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
  banner?: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface GuildEvent {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  dateRange: string;
  startDate?: string;
  tiers: Tier[];
  rules: string[];
  faq?: FaqItem[];
  participants?: string[];
  banner?: string;
}

// ─── Event Data ───────────────────────────────────────────────────────────────

const EVENTS: GuildEvent[] = [
  // ── Event 2 (Upcoming — starts March 1) ──
  {
    id: "event-2",
    title: "NomStead Guild Item Exchange — Event 2",
    description:
      "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below. Now includes Tier D — Tools & Materials!",
    status: "UPCOMING",
    startDate: "2026-03-01T00:00:00",
    dateRange: "Mar 1 – Mar 31, 2026",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items — Active Low-Level Members Only",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "$0.0005",
        playerCap: "$5 max per player",
        totalCap: "10,000 items",
        items: [
          { name: "Cotton", qty: "2k", note: "$0.0005 each", cap: "$1.00 max" },
          { name: "Potatoes", qty: "2k", note: "$0.0005 each", cap: "$1.00 max" },
          { name: "Red Flower", qty: "2k", note: "$0.0005 each", cap: "$1.00 max" },
          { name: "Blue Flower", qty: "2k", note: "$0.0005 each", cap: "$1.00 max" },
          { name: "Yellow Flower", qty: "2k", note: "$0.0005 each", cap: "$1.00 max" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items — Active Low-Level Members Only",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "$0.001",
        playerCap: "$5.10 max per player",
        totalCap: "4,400 items",
        items: [
          { name: "Wrapped Potato", qty: "1.3k", note: "$0.001 each", cap: "$1.30 max" },
          { name: "Fries", qty: "1.3k", note: "$0.001 each", cap: "$1.30 max" },
          { name: "Veggie Salad", qty: "1.3k", note: "$0.001 each", cap: "$1.30 max" },
          { name: "Soil", qty: "x500", note: "$0.0024 each", cap: "$1.20 max" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items — OG Players Only",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "$0.167",
        playerCap: "$2.50 max per player",
        totalCap: "15 cakes",
        items: [
          { name: "Golden Potato Cake", qty: "x3", note: "$0.167 each", cap: "$0.50 max" },
          { name: "Pumpkin Spice Cake", qty: "x3", note: "$0.167 each", cap: "$0.50 max" },
          { name: "Carrot Cake", qty: "x3", note: "$0.167 each", cap: "$0.50 max" },
          { name: "Grape Tart Cake", qty: "x3", note: "$0.167 each", cap: "$0.50 max" },
          { name: "Upside-Down Tomato Cake", qty: "x3", note: "$0.167 each", cap: "$0.50 max" },
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials — OG Players Only",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "$0.00125–$0.001375",
        playerCap: "$15 max per player",
        totalCap: "11,000 items",
        banner: "READ RULES ON LOYALTY MULTIPLIER TO EARN MORE IN THIS TIER",
        items: [
          { name: "Wheat Flour", qty: "1k", note: "$0.00125 each", cap: "$1.25 max" },
          { name: "Wood", qty: "5k", note: "$0.001375 each", cap: "$6.88 max" },
          { name: "Stone", qty: "5k", note: "$0.001375 each", cap: "$6.88 max" },
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
        ],
      },
    ],
    participants: [
      "xidni_xazz",
      "DevilFirst",
      "Rachelle (KANIN)",
      "steemit",
      "abkhan",
      "Ongbak",
      "Alstar",
      "Axolotoi",
    ],
    rules: [
      "Each player can earn up to $27.60 total ($5 from A + $5.10 from B + $2.50 from C + $15 from D).",
      "Max event pool: $220.80 (8 players).",
      "PM FoxHole on Discord before dropping items in the dropbox to make sure activities are acknowledged and paid for.",
      "Tier D: Wheat Flour 1k × $0.00125, Wood & Stone 5k × $0.001375 each.",
      "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
      "LOYALTY MULTIPLIER: Complete a full Tier D hand-in (all wheat flour, wood & stone) to earn $15 this event and unlock a permanent 1.25x multiplier — earning $18.75 from Tier D every month from Event 3 through the July TGE Launch. Earn it once, keep it all season. Tier D participants only.",
    ],
    faq: [
      {
        q: "How does this work?",
        a: "You gather in-game items from NomStead and sell them to FoxHole's dropbox. PM FoxHole on Discord first to set up payment and arrange your drop-off. Pick any tier you want — you can participate in all four.",
      },
      {
        q: "How much can I earn?",
        a: "Up to $27.60 per player across all tiers: $5 from Tier A, $5.10 from Tier B, $2.50 from Tier C, and $15 from Tier D. You don't have to max every tier — earn as much or as little as you want.",
      },
      {
        q: "What are the tiers?",
        a: "Each tier has different items at different price points. Tier A is basic crops and flowers (cheap but high quantity). Tier B is crafted food items (higher value per item). Tier C is rare cakes. Tier D is wheat flour, wood, and stone — the biggest earner.",
      },
      {
        q: "What does 'per player cap' mean?",
        a: "It's the max dollar amount you can earn from a single tier. For example, Tier A maxes out at $5 if you sell all 5,000 items. Tier D is the biggest earner at $15. This ensures the pool is shared fairly across all players.",
      },
      {
        q: "What if I can't fill a whole tier?",
        a: "No problem! You get paid per item at the listed price, so every single item counts. Send what you can, even if it's just a few. There's no minimum. Any money left unspent rolls into the July TGE Launch Event pool.",
      },
      {
        q: "How do I get paid?",
        a: "PM FoxHole on Discord to coordinate. Once your items are verified in the dropbox, payment is sent to you. Details are arranged through Discord DMs.",
      },
      {
        q: "What's the Loyalty Multiplier?",
        a: "Complete a full Tier D hand-in (all 1k wheat flour, 5k wood, and 5k stone) and you unlock a 1.25x multiplier on Tier D. That means instead of earning $15 max from Tier D, you earn $18.75 — every month from Event 3 through the July TGE Launch. You only need to earn it once and it lasts all season. This is only available to Tier D participants.",
      },
      {
        q: "What's the total pool?",
        a: "$220.80 across 8 players. This is the max FoxHole will pay out. If not everyone maxes every tier, all leftover rolls into the July TGE Launch Event pool.",
      },
    ],
  },
  // ── Event 3 (Upcoming — April) ──
  {
    id: "event-3",
    title: "NomStead Guild Item Exchange — Event 3",
    description:
      "Monthly item exchange with all five tiers. Pricing and caps will be finalized based on Event 2 results.",
    status: "UPCOMING" as EventStatus,
    startDate: "2026-04-01T00:00:00",
    dateRange: "Apr 1 – Apr 30, 2026",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Cotton", qty: "TBD" },
          { name: "Potatoes", qty: "TBD" },
          { name: "Red Flower", qty: "TBD" },
          { name: "Blue Flower", qty: "TBD" },
          { name: "Yellow Flower", qty: "TBD" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wrapped Potato", qty: "TBD" },
          { name: "Fries", qty: "TBD" },
          { name: "Veggie Salad", qty: "TBD" },
          { name: "Soil", qty: "TBD" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Golden Potato Cake", qty: "TBD" },
          { name: "Pumpkin Spice Cake", qty: "TBD" },
          { name: "Carrot Cake", qty: "TBD" },
          { name: "Grape Tart Cake", qty: "TBD" },
          { name: "Upside-Down Tomato Cake", qty: "TBD" },
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wheat Flour", qty: "TBD" },
          { name: "Wood", qty: "TBD" },
          { name: "Stone", qty: "TBD" },
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
        ],
      },
      {
        name: "Tier E",
        subtitle: "Crafted Items & Structures",
        color: "#ff6b35",
        border: "#ff6b35",
        bg: "rgba(255, 107, 53, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Box", qty: "TBD" },
          { name: "Bench", qty: "TBD" },
          { name: "Big Bench", qty: "TBD" },
          { name: "Bonfire", qty: "TBD" },
          { name: "Dropbox", qty: "TBD" },
          { name: "Fence", qty: "TBD" },
          { name: "Gate", qty: "TBD" },
          { name: "Well", qty: "TBD" },

          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
        ],
      },
    ],
    rules: [
      "Pricing and caps will be set based on Event 2 feedback.",
      "PM FoxHole on Discord before dropping items in the dropbox.",
      "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    ],
  },
  // ── Event 4 (Upcoming — May) ──
  {
    id: "event-4",
    title: "NomStead Guild Item Exchange — Event 4",
    description:
      "Monthly item exchange with all five tiers. Pricing and caps will be finalized based on previous event results.",
    status: "UPCOMING" as EventStatus,
    startDate: "2026-05-01T00:00:00",
    dateRange: "May 1 – May 31, 2026",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Cotton", qty: "TBD" },
          { name: "Potatoes", qty: "TBD" },
          { name: "Red Flower", qty: "TBD" },
          { name: "Blue Flower", qty: "TBD" },
          { name: "Yellow Flower", qty: "TBD" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wrapped Potato", qty: "TBD" },
          { name: "Fries", qty: "TBD" },
          { name: "Veggie Salad", qty: "TBD" },
          { name: "Soil", qty: "TBD" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Golden Potato Cake", qty: "TBD" },
          { name: "Pumpkin Spice Cake", qty: "TBD" },
          { name: "Carrot Cake", qty: "TBD" },
          { name: "Grape Tart Cake", qty: "TBD" },
          { name: "Upside-Down Tomato Cake", qty: "TBD" },
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wheat Flour", qty: "TBD" },
          { name: "Wood", qty: "TBD" },
          { name: "Stone", qty: "TBD" },
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
        ],
      },
      {
        name: "Tier E",
        subtitle: "Crafted Items & Structures",
        color: "#ff6b35",
        border: "#ff6b35",
        bg: "rgba(255, 107, 53, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Box", qty: "TBD" },
          { name: "Bench", qty: "TBD" },
          { name: "Big Bench", qty: "TBD" },
          { name: "Bonfire", qty: "TBD" },
          { name: "Dropbox", qty: "TBD" },
          { name: "Fence", qty: "TBD" },
          { name: "Gate", qty: "TBD" },
          { name: "Well", qty: "TBD" },

          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
        ],
      },
    ],
    rules: [
      "Pricing and caps will be set based on previous event feedback.",
      "PM FoxHole on Discord before dropping items in the dropbox.",
      "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    ],
  },
  // ── Event 5 (Upcoming — June) ──
  {
    id: "event-5",
    title: "NomStead Guild Item Exchange — Event 5",
    description:
      "Monthly item exchange with all five tiers. Pricing and caps will be finalized based on previous event results.",
    status: "UPCOMING" as EventStatus,
    startDate: "2026-06-01T00:00:00",
    dateRange: "Jun 1 – Jun 30, 2026",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Cotton", qty: "TBD" },
          { name: "Potatoes", qty: "TBD" },
          { name: "Red Flower", qty: "TBD" },
          { name: "Blue Flower", qty: "TBD" },
          { name: "Yellow Flower", qty: "TBD" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wrapped Potato", qty: "TBD" },
          { name: "Fries", qty: "TBD" },
          { name: "Veggie Salad", qty: "TBD" },
          { name: "Soil", qty: "TBD" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Golden Potato Cake", qty: "TBD" },
          { name: "Pumpkin Spice Cake", qty: "TBD" },
          { name: "Carrot Cake", qty: "TBD" },
          { name: "Grape Tart Cake", qty: "TBD" },
          { name: "Upside-Down Tomato Cake", qty: "TBD" },
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wheat Flour", qty: "TBD" },
          { name: "Wood", qty: "TBD" },
          { name: "Stone", qty: "TBD" },
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
        ],
      },
      {
        name: "Tier E",
        subtitle: "Crafted Items & Structures",
        color: "#ff6b35",
        border: "#ff6b35",
        bg: "rgba(255, 107, 53, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Box", qty: "TBD" },
          { name: "Bench", qty: "TBD" },
          { name: "Big Bench", qty: "TBD" },
          { name: "Bonfire", qty: "TBD" },
          { name: "Dropbox", qty: "TBD" },
          { name: "Fence", qty: "TBD" },
          { name: "Gate", qty: "TBD" },
          { name: "Well", qty: "TBD" },

          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
        ],
      },
    ],
    rules: [
      "Pricing and caps will be set based on previous event feedback.",
      "PM FoxHole on Discord before dropping items in the dropbox.",
      "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    ],
  },
  // ── Event 6 (Upcoming — July TGE Launch) ──
  {
    id: "event-6",
    title: "NomStead Guild Item Exchange — TGE Launch Event",
    banner: "THE FUCKING FARMING BANGER",
    description:
      "The big one. Celebrating the NomStead Token Generation Event with our largest pool yet. All five tiers, boosted rewards, and special launch bonuses. This is the event we've been building toward.",
    status: "UPCOMING" as EventStatus,
    startDate: "2026-07-01T00:00:00",
    dateRange: "Jul 1 – Jul 31, 2026",
    tiers: [
      {
        name: "Tier A",
        subtitle: "Basic Items",
        color: "#00ff41",
        border: "#00ff41",
        bg: "rgba(0, 255, 65, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Cotton", qty: "TBD" },
          { name: "Potatoes", qty: "TBD" },
          { name: "Red Flower", qty: "TBD" },
          { name: "Blue Flower", qty: "TBD" },
          { name: "Yellow Flower", qty: "TBD" },
        ],
      },
      {
        name: "Tier B",
        subtitle: "Mid-Tier Crafted Items",
        color: "#00d9ff",
        border: "#00d9ff",
        bg: "rgba(0, 217, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wrapped Potato", qty: "TBD" },
          { name: "Fries", qty: "TBD" },
          { name: "Veggie Salad", qty: "TBD" },
          { name: "Soil", qty: "TBD" },
        ],
      },
      {
        name: "Tier C",
        subtitle: "High-Tier Items",
        color: "#b44dff",
        border: "#b44dff",
        bg: "rgba(180, 77, 255, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Golden Potato Cake", qty: "TBD" },
          { name: "Pumpkin Spice Cake", qty: "TBD" },
          { name: "Carrot Cake", qty: "TBD" },
          { name: "Grape Tart Cake", qty: "TBD" },
          { name: "Upside-Down Tomato Cake", qty: "TBD" },
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
      {
        name: "Tier D",
        subtitle: "Tools & Materials",
        color: "#ffd700",
        border: "#ffd700",
        bg: "rgba(255, 215, 0, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          { name: "Wheat Flour", qty: "TBD" },
          { name: "Wood", qty: "TBD" },
          { name: "Stone", qty: "TBD" },
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
        ],
      },
      {
        name: "Tier E",
        subtitle: "Crafted Items & Structures",
        color: "#ff6b35",
        border: "#ff6b35",
        bg: "rgba(255, 107, 53, 0.08)",
        pricePerItem: "TBD",
        playerCap: "TBD",
        totalCap: "TBD",
        items: [
          // Furniture & Decoration
          { name: "Box", qty: "TBD" },
          { name: "Bench", qty: "TBD" },
          { name: "Big Bench", qty: "TBD" },
          { name: "Small Bench", qty: "TBD" },
          { name: "Wood Table", qty: "TBD" },
          { name: "Wood Sign", qty: "TBD" },
          { name: "Arch with Yellow Flowers", qty: "TBD" },
          { name: "Compost", qty: "TBD" },
          { name: "Sundial", qty: "TBD" },
          { name: "Sleigh", qty: "TBD" },
          { name: "Round Plants Pot", qty: "TBD" },
          { name: "Square Plants Pot", qty: "TBD" },
          { name: "Valentine's Wood Bench", qty: "TBD" },
          { name: "Valentine's Stone Bench", qty: "TBD" },
          // Tents
          { name: "Brown Tent", qty: "TBD" },
          { name: "Big Brown Tent", qty: "TBD" },
          { name: "White Tent", qty: "TBD" },
          { name: "Big White Tent", qty: "TBD" },
          { name: "Tiny Brown Tent", qty: "TBD" },
          { name: "Tiny White Tent", qty: "TBD" },
          // Carpets & Pillows
          { name: "Carpet Brown", qty: "TBD" },
          { name: "Carpet Green", qty: "TBD" },
          { name: "Carpet Orange", qty: "TBD" },
          { name: "Carpet Red", qty: "TBD" },
          { name: "Pillow Green", qty: "TBD" },
          { name: "Pillow Grey", qty: "TBD" },
          { name: "Pillow Orange", qty: "TBD" },
          { name: "Pillow Red", qty: "TBD" },
          { name: "Pillow Yellow", qty: "TBD" },
          { name: "Pillows", qty: "TBD" },
          // Structures
          { name: "Bonfire", qty: "TBD" },
          { name: "Dropbox", qty: "TBD" },
          { name: "Fence", qty: "TBD" },
          { name: "Gate", qty: "TBD" },
          { name: "Well", qty: "TBD" },
          { name: "Stone Path", qty: "TBD" },
          { name: "Wood Path", qty: "TBD" },
          { name: "Blue Scarecrow", qty: "TBD" },
          { name: "Red Scarecrow", qty: "TBD" },
          { name: "Yellow Scarecrow", qty: "TBD" },
          { name: "Chicken Coop", qty: "TBD" },
          // Processing Stations
          { name: "Anvil", qty: "TBD" },
          { name: "Sawmill", qty: "TBD" },
          { name: "Stonecutter", qty: "TBD" },
          { name: "Furnace", qty: "TBD" },
          { name: "Spinning Wheel", qty: "TBD" },
          { name: "Barrel", qty: "TBD" },
          { name: "Bread Oven", qty: "TBD" },
          { name: "Dyeing Vat", qty: "TBD" },
          // Tools
          { name: "Fishing Rod", qty: "TBD" },
          { name: "Iron Axe", qty: "TBD" },
          { name: "Iron Pickaxe", qty: "TBD" },
          { name: "Gold Axe", qty: "TBD" },
          { name: "Gold Pickaxe", qty: "TBD" },
          // Processed Materials
          { name: "Wood Plank", qty: "TBD" },
          { name: "Stone Block", qty: "TBD" },
          { name: "Stone Brick", qty: "TBD" },
          { name: "Clay Brick", qty: "TBD" },
          { name: "Metal Bar", qty: "TBD" },
          { name: "Iron Ingot", qty: "TBD" },
          { name: "Silver Ingot", qty: "TBD" },
          { name: "Gold Ingot", qty: "TBD" },
          { name: "Wool", qty: "TBD" },
          { name: "Grape Must", qty: "TBD" },
          // Cotton Threads
          { name: "Cotton Thread", qty: "TBD" },
          { name: "Cotton Thread Blue", qty: "TBD" },
          { name: "Cotton Thread Brown", qty: "TBD" },
          { name: "Cotton Thread Green", qty: "TBD" },
          { name: "Cotton Thread Orange", qty: "TBD" },
          { name: "Cotton Thread Red", qty: "TBD" },
          { name: "Cotton Thread Yellow", qty: "TBD" },
          // Food
          { name: "Chicken Feed", qty: "TBD" },
          { name: "Mushroom Omelette", qty: "TBD" },
          { name: "Mushroom Soup", qty: "TBD" },
          { name: "Pumpkin Bread", qty: "TBD" },
          { name: "Tomato Omelette", qty: "TBD" },
        ],
      },
    ],
    rules: [
      "TGE Launch Event — biggest pool of the season!",
      "Pricing, caps, and bonuses will be announced closer to launch.",
      "PM FoxHole on Discord before dropping items in the dropbox.",
      "Caps are per player — unused budget rolls into the July TGE Launch Event pool.",
    ],
  },
  // ── Event 1 (Active — ends Feb 28) ──
  {
    id: "event-1",
    title: "NomStead Guild Item Exchange — Event 1",
    description:
      "Tiered item exchange event for NomStead guild members. Pick a tier, send your items, and receive payment based on the pricing below.",
    status: "ACTIVE",
    dateRange: "Feb 1 – Feb 28, 2026",
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

function CountdownTimer({ targetDate, label }: { targetDate: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const boxes = [
    { value: timeLeft.days, unit: "DAYS" },
    { value: timeLeft.hours, unit: "HRS" },
    { value: timeLeft.minutes, unit: "MIN" },
    { value: timeLeft.seconds, unit: "SEC" },
  ];

  return (
    <div
      style={{
        textAlign: "center",
        margin: "50px 0",
        padding: "30px 20px",
        background: "rgba(255,215,0,0.05)",
        border: "2px solid #ffd70040",
        borderRadius: "16px",
      }}
    >
      <p
        style={{
          color: "#ffd700",
          fontSize: "0.85rem",
          fontWeight: "bold",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginTop: 0,
          marginBottom: "20px",
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        {boxes.map((box) => (
          <div
            key={box.unit}
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "2px solid #ffd70060",
              borderRadius: "12px",
              padding: "16px 20px",
              minWidth: "80px",
            }}
          >
            <div
              style={{
                color: "#ffd700",
                fontSize: "2rem",
                fontWeight: "bold",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              {String(box.value).padStart(2, "0")}
            </div>
            <div
              style={{
                color: "#888",
                fontSize: "0.65rem",
                letterSpacing: "2px",
                marginTop: "4px",
                fontFamily: "Share Tech Mono, monospace",
              }}
            >
              {box.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      {/* Event banner */}
      {event.banner && (
        <div
          style={{
            textAlign: "center",
            margin: "10px auto 20px auto",
            maxWidth: "700px",
            padding: "16px 24px",
            background: "linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,100,0,0.2))",
            border: "3px solid #ff0000",
            borderRadius: "12px",
            color: "#ff4444",
            fontSize: "1.4rem",
            fontWeight: "bold",
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "4px",
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(255,0,0,0.5)",
          }}
        >
          {event.banner}
        </div>
      )}

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

      {/* Participants */}
      {event.participants && event.participants.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <h3
            style={{
              color: "#00d4ff",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "14px",
            }}
          >
            Registered Players ({event.participants.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {event.participants.map((name) => (
              <span
                key={name}
                style={{
                  padding: "6px 16px",
                  background: "rgba(0, 212, 255, 0.1)",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                  borderRadius: "20px",
                  color: "#00d4ff",
                  fontSize: "0.8rem",
                  fontFamily: "Share Tech Mono, monospace",
                  fontWeight: "bold",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

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

            {/* Banner */}
            {tier.banner && (
              <div
                style={{
                  background: "rgba(255, 0, 0, 0.15)",
                  border: "2px solid #ff0000",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  textAlign: "center",
                  color: "#ff4444",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  fontFamily: "Orbitron, sans-serif",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {tier.banner}
              </div>
            )}

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
                    {item.cap && (
                      <span
                        style={{
                          color: "#00ff99",
                          fontSize: "0.75rem",
                          background: "rgba(0,255,153,0.12)",
                          border: "1px solid rgba(0,255,153,0.3)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        {item.cap}
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

      {/* FAQ / How It Works */}
      {event.faq && event.faq.length > 0 && (
        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "2px solid #00ff9940",
            borderRadius: "12px",
            padding: "24px 20px",
            marginTop: "30px",
          }}
        >
          <h3
            style={{
              color: "#00ff99",
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            How It Works — FAQ
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {event.faq.map((item, i) => (
              <div key={i}>
                <p
                  style={{
                    color: "#00d4ff",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    margin: "0 0 6px 0",
                    fontFamily: "Share Tech Mono, monospace",
                  }}
                >
                  {item.q}
                </p>
                <p
                  style={{
                    color: "#aaa",
                    fontSize: "0.8rem",
                    lineHeight: "1.7",
                    margin: 0,
                    paddingLeft: "12px",
                    borderLeft: "2px solid #00ff9940",
                    fontFamily: "Share Tech Mono, monospace",
                  }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function GuildEventsPage() {
  const active = EVENTS.filter((e) => e.status === "ACTIVE");
  const upcoming = EVENTS.filter((e) => e.status === "UPCOMING").sort(
    (a, b) => new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime()
  );
  const ended = EVENTS.filter((e) => e.status === "ENDED");

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

        {/* Active events first */}
        {active.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}

        {/* Countdown + upcoming events */}
        {upcoming.map((event) => (
          <div key={event.id}>
            {event.startDate && (
              <CountdownTimer
                targetDate={event.startDate}
                label={`${event.title} starts in`}
              />
            )}
            <EventSection event={event} />
          </div>
        ))}

        {/* Ended events last */}
        {ended.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
