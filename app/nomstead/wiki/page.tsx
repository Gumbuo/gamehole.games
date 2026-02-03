"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// ============== THEME ==============
const THEME = {
  bg: "#0b0c10",
  panel: "rgba(31, 40, 51, 0.9)",
  primary: "#4ade80",
  secondary: "#45a29e",
  accent: "#66fcf1",
  gold: "#fbbf24",
  silver: "#d1d5db",
  textMuted: "#c5c6c7",
  font: "Orbitron, sans-serif",
};

// ============== DATA ==============
type ItemCategory = "fishing" | "tools" | "food" | "ingredients" | "decorations" | "materials";
type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string;
  description: string;
  obtainedFrom?: string;
  craftingRecipe?: { item: string; quantity: number }[];
  sellPrice?: { gold?: number; gems?: number };
  stats?: Record<string, string | number>;
}

interface NPC {
  id: string;
  name: string;
  role: string;
  icon: string;
  description: string;
  location: string;
  questTypes: string[];
}

interface TileType {
  id: string;
  name: string;
  rarity: ItemRarity;
  icon: string;
  description: string;
  resources: string[];
  buildingSlots: number;
}

// Game Items Database
const ITEMS: GameItem[] = [
  // Fishing Rods
  {
    id: "basic-rod",
    name: "Basic Fishing Rod",
    category: "fishing",
    rarity: "common",
    icon: "\uD83C\uDFA3",
    description: "A simple wooden rod for catching common fish.",
    craftingRecipe: [
      { item: "Wood", quantity: 5 },
      { item: "String", quantity: 2 },
    ],
    stats: { "Catch Rate": "1x", "Durability": 50 },
  },
  {
    id: "bronze-rod",
    name: "Bronze Fishing Rod",
    category: "fishing",
    rarity: "uncommon",
    icon: "\uD83C\uDFA3",
    description: "A sturdy bronze rod with improved catch rates.",
    craftingRecipe: [
      { item: "Bronze Ingot", quantity: 3 },
      { item: "String", quantity: 3 },
      { item: "Wood", quantity: 2 },
    ],
    stats: { "Catch Rate": "1.5x", "Durability": 100 },
  },
  {
    id: "silver-rod",
    name: "Silver Fishing Rod",
    category: "fishing",
    rarity: "rare",
    icon: "\uD83C\uDFA3",
    description: "An elegant silver rod that attracts rare fish.",
    craftingRecipe: [
      { item: "Silver Ingot", quantity: 5 },
      { item: "Enchanted String", quantity: 2 },
    ],
    stats: { "Catch Rate": "2x", "Durability": 150, "Rare Fish Chance": "+15%" },
  },
  {
    id: "golden-rod",
    name: "Golden Fishing Rod",
    category: "fishing",
    rarity: "epic",
    icon: "\uD83C\uDFA3",
    description: "A magnificent golden rod fit for royalty.",
    craftingRecipe: [
      { item: "Gold Ingot", quantity: 8 },
      { item: "Enchanted String", quantity: 4 },
      { item: "Magic Crystal", quantity: 1 },
    ],
    stats: { "Catch Rate": "3x", "Durability": 250, "Rare Fish Chance": "+30%" },
  },
  // Tools
  {
    id: "workbench",
    name: "Workbench",
    category: "tools",
    rarity: "common",
    icon: "\uD83D\uDEE0\uFE0F",
    description: "Essential crafting station for creating items.",
    craftingRecipe: [
      { item: "Wood", quantity: 10 },
      { item: "Nails", quantity: 5 },
    ],
    stats: { "Crafting Speed": "1x" },
  },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "tools",
    rarity: "uncommon",
    icon: "\uD83D\uDCE6",
    description: "Sell items to other players through the marketplace.",
    craftingRecipe: [
      { item: "Wood", quantity: 8 },
      { item: "Iron Ingot", quantity: 3 },
      { item: "Lock", quantity: 1 },
    ],
    stats: { "Listing Slots": 5 },
  },
  {
    id: "advanced-workbench",
    name: "Advanced Workbench",
    category: "tools",
    rarity: "rare",
    icon: "\uD83D\uDEE0\uFE0F",
    description: "Upgraded workbench for complex crafting recipes.",
    craftingRecipe: [
      { item: "Workbench", quantity: 1 },
      { item: "Iron Ingot", quantity: 10 },
      { item: "Gears", quantity: 5 },
    ],
    stats: { "Crafting Speed": "1.5x", "Advanced Recipes": "Unlocked" },
  },
  // Food & Cooking
  {
    id: "basic-cake",
    name: "Basic Cake",
    category: "food",
    rarity: "common",
    icon: "\uD83C\uDF82",
    description: "A simple but delicious cake.",
    craftingRecipe: [
      { item: "Flour", quantity: 3 },
      { item: "Eggs", quantity: 2 },
      { item: "Sugar", quantity: 2 },
    ],
    sellPrice: { gold: 15 },
    stats: { "Energy Restored": 20 },
  },
  {
    id: "fruit-cake",
    name: "Fruit Cake",
    category: "food",
    rarity: "uncommon",
    icon: "\uD83C\uDF70",
    description: "Cake topped with fresh seasonal fruits.",
    craftingRecipe: [
      { item: "Flour", quantity: 3 },
      { item: "Eggs", quantity: 2 },
      { item: "Mixed Fruits", quantity: 4 },
      { item: "Sugar", quantity: 3 },
    ],
    sellPrice: { gold: 35 },
    stats: { "Energy Restored": 40, "Speed Boost": "5 min" },
  },
  {
    id: "royal-cake",
    name: "Royal Cake",
    category: "food",
    rarity: "epic",
    icon: "\uD83C\uDF82",
    description: "An extravagant multi-tier cake worthy of celebrations.",
    craftingRecipe: [
      { item: "Flour", quantity: 8 },
      { item: "Eggs", quantity: 6 },
      { item: "Cream", quantity: 4 },
      { item: "Gold Dust", quantity: 1 },
      { item: "Rare Berries", quantity: 3 },
    ],
    sellPrice: { gold: 150, gems: 5 },
    stats: { "Energy Restored": 100, "All Stats Boost": "10 min" },
  },
  {
    id: "grilled-fish",
    name: "Grilled Fish",
    category: "food",
    rarity: "common",
    icon: "\uD83C\uDF7D\uFE0F",
    description: "Simple grilled fish cooked over a bonfire.",
    craftingRecipe: [
      { item: "Common Fish", quantity: 1 },
      { item: "Herbs", quantity: 1 },
    ],
    sellPrice: { gold: 8 },
    stats: { "Energy Restored": 15 },
  },
  // Ingredients
  {
    id: "flour",
    name: "Flour",
    category: "ingredients",
    rarity: "common",
    icon: "\uD83C\uDF3E",
    description: "Ground wheat used for baking.",
    obtainedFrom: "Farming wheat, then milling",
    sellPrice: { gold: 2 },
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "ingredients",
    rarity: "common",
    icon: "\uD83E\uDD5A",
    description: "Fresh eggs from chickens.",
    obtainedFrom: "Chicken coop",
    sellPrice: { gold: 1 },
  },
  {
    id: "sugar",
    name: "Sugar",
    category: "ingredients",
    rarity: "common",
    icon: "\uD83C\uDF6C",
    description: "Sweetener for baking and cooking.",
    obtainedFrom: "Sugar cane farming",
    sellPrice: { gold: 2 },
  },
  {
    id: "common-fish",
    name: "Common Fish",
    category: "ingredients",
    rarity: "common",
    icon: "\uD83D\uDC1F",
    description: "Standard fish found in most ponds.",
    obtainedFrom: "Fishing at pond tiles",
    sellPrice: { gold: 5 },
  },
  {
    id: "rare-fish",
    name: "Rare Fish",
    category: "ingredients",
    rarity: "rare",
    icon: "\uD83D\uDC20",
    description: "Colorful rare fish with special properties.",
    obtainedFrom: "Fishing with silver+ rod at pond tiles",
    sellPrice: { gold: 25 },
  },
  {
    id: "magic-crystal",
    name: "Magic Crystal",
    category: "materials",
    rarity: "epic",
    icon: "\uD83D\uDC8E",
    description: "A crystal pulsing with magical energy.",
    obtainedFrom: "Mountain tiles, rare drop",
    sellPrice: { gold: 100, gems: 2 },
  },
  // Decorations
  {
    id: "flower-pot",
    name: "Flower Pot",
    category: "decorations",
    rarity: "common",
    icon: "\uD83C\uDF3B",
    description: "A decorative pot for growing flowers.",
    craftingRecipe: [
      { item: "Clay", quantity: 3 },
      { item: "Seeds", quantity: 1 },
    ],
    sellPrice: { gold: 5 },
  },
  {
    id: "garden-bench",
    name: "Garden Bench",
    category: "decorations",
    rarity: "uncommon",
    icon: "\uD83E\uDE91",
    description: "A comfortable bench for your garden.",
    craftingRecipe: [
      { item: "Wood", quantity: 8 },
      { item: "Nails", quantity: 4 },
    ],
    sellPrice: { gold: 20 },
  },
  {
    id: "fountain",
    name: "Fountain",
    category: "decorations",
    rarity: "rare",
    icon: "\u26F2",
    description: "An elegant fountain that adds beauty to your land.",
    craftingRecipe: [
      { item: "Stone", quantity: 20 },
      { item: "Water Pump", quantity: 1 },
      { item: "Silver Ingot", quantity: 2 },
    ],
    sellPrice: { gold: 80 },
  },
  // Materials
  {
    id: "wood",
    name: "Wood",
    category: "materials",
    rarity: "common",
    icon: "\uD83E\uDEB5",
    description: "Basic building material from trees.",
    obtainedFrom: "Chopping trees on forest tiles",
    sellPrice: { gold: 1 },
  },
  {
    id: "stone",
    name: "Stone",
    category: "materials",
    rarity: "common",
    icon: "\uD83E\uDEA8",
    description: "Sturdy stone for construction.",
    obtainedFrom: "Mining on mountain tiles",
    sellPrice: { gold: 2 },
  },
  {
    id: "iron-ingot",
    name: "Iron Ingot",
    category: "materials",
    rarity: "uncommon",
    icon: "\uD83D\uDFEB",
    description: "Refined iron for crafting tools and structures.",
    craftingRecipe: [
      { item: "Iron Ore", quantity: 3 },
      { item: "Coal", quantity: 1 },
    ],
    sellPrice: { gold: 8 },
  },
  {
    id: "gold-ingot",
    name: "Gold Ingot",
    category: "materials",
    rarity: "rare",
    icon: "\uD83D\uDFE8",
    description: "Precious gold for valuable crafting.",
    craftingRecipe: [
      { item: "Gold Ore", quantity: 5 },
      { item: "Coal", quantity: 2 },
    ],
    sellPrice: { gold: 50 },
  },
];

// NPCs Database
const NPCS: NPC[] = [
  {
    id: "gus",
    name: "Gus",
    role: "Chef & Quest Giver",
    icon: "\uD83D\uDC68\u200D\uD83C\uDF73",
    description: "The friendly chef who runs the bonfire. Teaches cooking and assigns food-related quests.",
    location: "Central Bonfire",
    questTypes: ["Cooking", "Ingredient Gathering", "Recipe Discovery"],
  },
  {
    id: "lily",
    name: "Lily",
    role: "Farmer & Botanist",
    icon: "\uD83D\uDC69\u200D\uD83C\uDF3E",
    description: "Expert in farming and plant cultivation. Helps players grow crops efficiently.",
    location: "Farm Area",
    questTypes: ["Farming", "Plant Collection", "Harvest Goals"],
  },
  {
    id: "sarah",
    name: "Sarah",
    role: "Merchant & Trader",
    icon: "\uD83D\uDC69\u200D\uD83D\uDCBC",
    description: "Runs the marketplace and helps players understand trading mechanics.",
    location: "Marketplace",
    questTypes: ["Trading", "Marketplace Sales", "Economy Goals"],
  },
  {
    id: "tom",
    name: "Tom",
    role: "Builder & Craftsman",
    icon: "\uD83D\uDC77",
    description: "Master builder who teaches crafting and construction techniques.",
    location: "Workshop",
    questTypes: ["Crafting", "Building", "Tool Creation"],
  },
];

// Tile Types Database
const TILE_TYPES: TileType[] = [
  {
    id: "grassland",
    name: "Grassland",
    rarity: "common",
    icon: "\uD83C\uDF3F",
    description: "Standard tile perfect for farming and basic buildings.",
    resources: ["Grass", "Seeds", "Herbs"],
    buildingSlots: 4,
  },
  {
    id: "sparse-forest",
    name: "Sparse Forest",
    rarity: "uncommon",
    icon: "\uD83C\uDF33",
    description: "Light woodland with occasional trees for wood gathering.",
    resources: ["Wood", "Berries", "Mushrooms"],
    buildingSlots: 3,
  },
  {
    id: "dense-forest",
    name: "Dense Forest",
    rarity: "rare",
    icon: "\uD83C\uDF32",
    description: "Thick forest with abundant wood and rare flora.",
    resources: ["Wood", "Rare Herbs", "Forest Creatures", "Honey"],
    buildingSlots: 2,
  },
  {
    id: "fishing-pond",
    name: "Fishing Pond",
    rarity: "rare",
    icon: "\uD83C\uDFA3",
    description: "Water tile perfect for fishing activities.",
    resources: ["Fish", "Rare Fish", "Pearls", "Water Plants"],
    buildingSlots: 2,
  },
  {
    id: "mountain",
    name: "Mountain",
    rarity: "epic",
    icon: "\u26F0\uFE0F",
    description: "Rocky terrain rich in minerals and rare materials.",
    resources: ["Stone", "Iron Ore", "Gold Ore", "Magic Crystals"],
    buildingSlots: 1,
  },
  {
    id: "stadium",
    name: "Stadium",
    rarity: "legendary",
    icon: "\uD83C\uDFDF\uFE0F",
    description: "Ultra-rare PvP arena tile. Only 10 exist!",
    resources: ["Battle Rewards", "Tournament Prizes"],
    buildingSlots: 0,
  },
];

// Category labels and colors
const CATEGORIES: Record<ItemCategory, { label: string; color: string; icon: string }> = {
  fishing: { label: "Fishing", color: "#3b82f6", icon: "\uD83C\uDFA3" },
  tools: { label: "Tools", color: "#8b5cf6", icon: "\uD83D\uDEE0\uFE0F" },
  food: { label: "Food", color: "#f59e0b", icon: "\uD83C\uDF7D\uFE0F" },
  ingredients: { label: "Ingredients", color: "#22c55e", icon: "\uD83E\uDD5A" },
  decorations: { label: "Decorations", color: "#ec4899", icon: "\uD83C\uDF3B" },
  materials: { label: "Materials", color: "#6b7280", icon: "\uD83E\uDEB5" },
};

const RARITIES: Record<ItemRarity, { label: string; color: string }> = {
  common: { label: "Common", color: "#9ca3af" },
  uncommon: { label: "Uncommon", color: "#22c55e" },
  rare: { label: "Rare", color: "#3b82f6" },
  epic: { label: "Epic", color: "#a855f7" },
  legendary: { label: "Legendary", color: "#f59e0b" },
};

type WikiSection = "items" | "npcs" | "tiles" | "economy" | "guides";

export default function NomSteadWikiPage() {
  const [activeSection, setActiveSection] = useState<WikiSection>("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "all">("all");
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | "all">("all");
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return ITEMS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesRarity = selectedRarity === "all" || item.rarity === selectedRarity;
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [searchQuery, selectedCategory, selectedRarity]);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: THEME.bg,
      color: THEME.textMuted,
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(to bottom, #1f2833, #0b0c10)",
        borderBottom: `2px solid ${THEME.secondary}`,
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <Link href="/nomstead" style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: THEME.accent,
          textDecoration: "none",
          fontFamily: THEME.font,
          fontSize: "14px",
          padding: "8px 16px",
          background: "rgba(102, 252, 241, 0.1)",
          border: `1px solid ${THEME.secondary}`,
          borderRadius: "8px",
        }}>
          ← Back to Guide
        </Link>
        <h1 style={{
          fontFamily: THEME.font,
          fontSize: "24px",
          color: THEME.primary,
          margin: 0,
          textShadow: `0 0 10px rgba(74, 222, 128, 0.5)`,
        }}>
          NomStead Wiki
        </h1>
        <Link href="/" style={{
          color: THEME.accent,
          textDecoration: "none",
          fontFamily: THEME.font,
          fontSize: "12px",
          padding: "8px 16px",
          background: "rgba(102, 252, 241, 0.1)",
          border: `1px solid ${THEME.secondary}`,
          borderRadius: "8px",
        }}>
          Game Hole Home
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        padding: "15px 20px",
        background: "rgba(31, 40, 51, 0.5)",
        borderBottom: `1px solid ${THEME.secondary}`,
        flexWrap: "wrap",
      }}>
        {[
          { id: "items" as WikiSection, label: "Items", icon: "\uD83C\uDF92" },
          { id: "npcs" as WikiSection, label: "NPCs", icon: "\uD83D\uDC65" },
          { id: "tiles" as WikiSection, label: "Tiles", icon: "\uD83D\uDDFA\uFE0F" },
          { id: "economy" as WikiSection, label: "Economy", icon: "\uD83D\uDCB0" },
          { id: "guides" as WikiSection, label: "Guides", icon: "\uD83D\uDCD6" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              padding: "10px 20px",
              background: activeSection === tab.id ? THEME.primary : "rgba(102, 252, 241, 0.1)",
              color: activeSection === tab.id ? "#000" : THEME.primary,
              border: `1px solid ${activeSection === tab.id ? THEME.primary : THEME.secondary}`,
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: THEME.font,
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Items Section */}
        {activeSection === "items" && (
          <div>
            {/* Search and Filters */}
            <div style={{
              display: "flex",
              gap: "15px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 15px",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${THEME.secondary}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  minWidth: "200px",
                  flex: 1,
                }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | "all")}
                style={{
                  padding: "10px 15px",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${THEME.secondary}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.label}</option>
                ))}
              </select>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value as ItemRarity | "all")}
                style={{
                  padding: "10px 15px",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${THEME.secondary}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                <option value="all">All Rarities</option>
                {Object.entries(RARITIES).map(([key, rar]) => (
                  <option key={key} value={key}>{rar.label}</option>
                ))}
              </select>
            </div>

            {/* Items Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "15px",
            }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: THEME.panel,
                    border: `1px solid ${RARITIES[item.rarity].color}40`,
                    borderRadius: "12px",
                    padding: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = RARITIES[item.rarity].color;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = `${RARITIES[item.rarity].color}40`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "32px" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#fff", fontSize: "14px" }}>{item.name}</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        <span style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          background: `${CATEGORIES[item.category].color}30`,
                          color: CATEGORIES[item.category].color,
                          borderRadius: "4px",
                        }}>
                          {CATEGORIES[item.category].label}
                        </span>
                        <span style={{
                          fontSize: "10px",
                          padding: "2px 6px",
                          background: `${RARITIES[item.rarity].color}30`,
                          color: RARITIES[item.rarity].color,
                          borderRadius: "4px",
                        }}>
                          {RARITIES[item.rarity].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: THEME.textMuted, margin: 0, lineHeight: "1.5" }}>
                    {item.description}
                  </p>
                  {item.sellPrice && (
                    <div style={{ marginTop: "10px", fontSize: "11px" }}>
                      <span style={{ color: THEME.gold }}>
                        {item.sellPrice.gold && `${item.sellPrice.gold} Gold`}
                      </span>
                      {item.sellPrice.gems && (
                        <span style={{ color: "#a855f7", marginLeft: "8px" }}>
                          {item.sellPrice.gems} Gems
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: THEME.secondary }}>
                No items found matching your search.
              </div>
            )}
          </div>
        )}

        {/* NPCs Section */}
        {activeSection === "npcs" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {NPCS.map((npc) => (
              <div key={npc.id} style={{
                background: THEME.panel,
                border: `1px solid ${THEME.secondary}`,
                borderRadius: "12px",
                padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                  <span style={{ fontSize: "48px" }}>{npc.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, color: THEME.primary, fontFamily: THEME.font }}>{npc.name}</h3>
                    <div style={{ color: THEME.accent, fontSize: "12px" }}>{npc.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: "13px", lineHeight: "1.6", marginBottom: "15px" }}>{npc.description}</p>
                <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                  <span style={{ color: THEME.secondary }}>Location: </span>
                  <span style={{ color: "#fff" }}>{npc.location}</span>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: THEME.secondary }}>Quest Types:</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {npc.questTypes.map((qt) => (
                      <span key={qt} style={{
                        padding: "3px 8px",
                        background: `${THEME.primary}20`,
                        border: `1px solid ${THEME.primary}40`,
                        borderRadius: "4px",
                        color: THEME.primary,
                        fontSize: "11px",
                      }}>
                        {qt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tiles Section */}
        {activeSection === "tiles" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}>
            {TILE_TYPES.map((tile) => (
              <div key={tile.id} style={{
                background: THEME.panel,
                border: `1px solid ${RARITIES[tile.rarity].color}40`,
                borderRadius: "12px",
                padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                  <span style={{ fontSize: "48px" }}>{tile.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, color: "#fff", fontFamily: THEME.font }}>{tile.name}</h3>
                    <span style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      background: `${RARITIES[tile.rarity].color}30`,
                      color: RARITIES[tile.rarity].color,
                      borderRadius: "4px",
                    }}>
                      {RARITIES[tile.rarity].label}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", lineHeight: "1.6", marginBottom: "15px" }}>{tile.description}</p>
                <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                  <span style={{ color: THEME.secondary }}>Building Slots: </span>
                  <span style={{ color: THEME.primary }}>{tile.buildingSlots}</span>
                </div>
                <div style={{ fontSize: "12px" }}>
                  <span style={{ color: THEME.secondary }}>Resources:</span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                    {tile.resources.map((res) => (
                      <span key={res} style={{
                        padding: "3px 8px",
                        background: "rgba(0,0,0,0.3)",
                        border: `1px solid ${THEME.secondary}40`,
                        borderRadius: "4px",
                        color: "#fff",
                        fontSize: "11px",
                      }}>
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Economy Section */}
        {activeSection === "economy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Currency */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>Currencies</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                <div style={{ padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    <span style={{ color: THEME.gold }}>Gold</span>
                  </div>
                  <p style={{ fontSize: "13px", margin: 0 }}>
                    Primary currency earned from quests, selling items, and trading. Used for most purchases.
                  </p>
                </div>
                <div style={{ padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    <span style={{ color: "#a855f7" }}>Gems</span>
                  </div>
                  <p style={{ fontSize: "13px", margin: 0 }}>
                    Premium currency for rare items and special purchases. Harder to obtain.
                  </p>
                </div>
              </div>
            </div>

            {/* Marketplace */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>Marketplace System</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "2" }}>
                <li>Player-driven economy with true on-chain ownership via Immutable zkEVM</li>
                <li>Use <strong>Dropboxes</strong> to list items for sale</li>
                <li><strong>Visa Pass</strong> required to sell items (obtained from Genesis Chests)</li>
                <li>Gas-free transactions through Immutable Passport</li>
                <li>Burn mechanics prevent inflation (consumable gear, gold sinks)</li>
              </ul>
            </div>

            {/* Earning Gold */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>How to Earn Gold</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                {[
                  { icon: "\uD83D\uDCCB", method: "Daily Quests", desc: "Complete NPC tasks" },
                  { icon: "\uD83C\uDF7D\uFE0F", method: "Cooking & Selling", desc: "Craft food to sell" },
                  { icon: "\uD83C\uDFA3", method: "Fishing", desc: "Catch and sell fish" },
                  { icon: "\uD83D\uDCE6", method: "Trading", desc: "Sell items to players" },
                  { icon: "\uD83C\uDF3E", method: "Farming", desc: "Grow and harvest crops" },
                  { icon: "\uD83C\uDFC6", method: "Events", desc: "Participate in competitions" },
                ].map((item) => (
                  <div key={item.method} style={{
                    padding: "12px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>{item.icon}</div>
                    <div style={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>{item.method}</div>
                    <div style={{ color: THEME.textMuted, fontSize: "11px" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Guides Section */}
        {activeSection === "guides" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Getting Started */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>Getting Started</h3>
              <ol style={{ margin: 0, paddingLeft: "20px", lineHeight: "2.2" }}>
                <li>Create an account at <a href="https://play.immutable.com/games/nomstead/" target="_blank" rel="noopener noreferrer" style={{ color: THEME.accent }}>play.immutable.com</a></li>
                <li>Complete the tutorial with <strong>Gus</strong> at the bonfire</li>
                <li>Claim your first tile (Grassland) to start building</li>
                <li>Complete daily quests from NPCs to earn Gold</li>
                <li>Craft a <strong>Workbench</strong> to unlock more recipes</li>
                <li>Start farming and fishing to gather resources</li>
              </ol>
            </div>

            {/* Fishing Guide */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>Fishing Guide</h3>
              <p style={{ marginBottom: "15px" }}>Fishing is one of the best ways to earn resources and Gold early on.</p>
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "2" }}>
                <li>Requires a <strong>Fishing Rod</strong> (craft or purchase)</li>
                <li>Can only fish at <strong>Pond Tiles</strong></li>
                <li>Better rods have higher catch rates and rare fish chances</li>
                <li>Rare fish sell for significantly more Gold</li>
                <li>Fish can also be cooked for food items</li>
              </ul>
            </div>

            {/* Cooking Guide */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>Cooking Guide</h3>
              <p style={{ marginBottom: "15px" }}>Cook at <strong>Gus&apos;s Bonfire</strong> to create food items.</p>
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "2" }}>
                <li>Gather ingredients from farming, fishing, and foraging</li>
                <li>Food restores energy and can provide buffs</li>
                <li>Baked goods (cakes) are valuable for selling</li>
                <li>Participate in <strong>The Great NomStead Bake Off</strong> for NFT rewards</li>
                <li>Higher quality ingredients = better dishes</li>
              </ul>
            </div>

            {/* NFT Guide */}
            <div style={{
              background: THEME.panel,
              border: `1px solid ${THEME.secondary}`,
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: THEME.primary, fontFamily: THEME.font, marginTop: 0 }}>NFT Collections</h3>
              <p style={{ marginBottom: "15px" }}>NomStead features several NFT collections on Immutable zkEVM:</p>
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "2" }}>
                <li><strong>Tiles</strong> - Land plots that form the world map</li>
                <li><strong>Genesis Chests</strong> - Limited to 4,000 total (Wood, Emerald, Sapphire tiers)</li>
                <li><strong>Companions</strong> - Collectible creatures that accompany your character</li>
                <li>Trade on <a href="https://sphere.market" target="_blank" rel="noopener noreferrer" style={{ color: THEME.accent }}>Sphere Marketplace</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: THEME.panel,
              border: `2px solid ${RARITIES[selectedItem.rarity].color}`,
              borderRadius: "16px",
              padding: "25px",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
              <span style={{ fontSize: "56px" }}>{selectedItem.icon}</span>
              <div>
                <h2 style={{ margin: 0, color: "#fff", fontFamily: THEME.font }}>{selectedItem.name}</h2>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <span style={{
                    padding: "4px 10px",
                    background: `${CATEGORIES[selectedItem.category].color}30`,
                    color: CATEGORIES[selectedItem.category].color,
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}>
                    {CATEGORIES[selectedItem.category].label}
                  </span>
                  <span style={{
                    padding: "4px 10px",
                    background: `${RARITIES[selectedItem.rarity].color}30`,
                    color: RARITIES[selectedItem.rarity].color,
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}>
                    {RARITIES[selectedItem.rarity].label}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ color: THEME.textMuted, lineHeight: "1.6", marginBottom: "20px" }}>
              {selectedItem.description}
            </p>

            {selectedItem.stats && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: THEME.primary, margin: "0 0 10px 0", fontSize: "14px" }}>Stats</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {Object.entries(selectedItem.stats).map(([key, value]) => (
                    <div key={key} style={{
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}>
                      <span style={{ color: THEME.secondary }}>{key}: </span>
                      <span style={{ color: THEME.accent }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.craftingRecipe && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: THEME.primary, margin: "0 0 10px 0", fontSize: "14px" }}>Crafting Recipe</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {selectedItem.craftingRecipe.map((ing, i) => (
                    <div key={i} style={{
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      border: `1px solid ${THEME.secondary}40`,
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#fff",
                    }}>
                      {ing.quantity}x {ing.item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.obtainedFrom && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: THEME.primary, margin: "0 0 10px 0", fontSize: "14px" }}>Obtained From</h4>
                <p style={{ margin: 0, color: "#fff", fontSize: "13px" }}>{selectedItem.obtainedFrom}</p>
              </div>
            )}

            {selectedItem.sellPrice && (
              <div>
                <h4 style={{ color: THEME.primary, margin: "0 0 10px 0", fontSize: "14px" }}>Sell Price</h4>
                <div style={{ display: "flex", gap: "15px" }}>
                  {selectedItem.sellPrice.gold && (
                    <span style={{ color: THEME.gold, fontSize: "16px", fontWeight: "bold" }}>
                      {selectedItem.sellPrice.gold} Gold
                    </span>
                  )}
                  {selectedItem.sellPrice.gems && (
                    <span style={{ color: "#a855f7", fontSize: "16px", fontWeight: "bold" }}>
                      {selectedItem.sellPrice.gems} Gems
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px",
                background: THEME.primary,
                color: "#000",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: THEME.font,
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
