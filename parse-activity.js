// parse-activity.js
// Usage: node parse-activity.js [path-to-log.txt]
// Parses NomStead activity logs and outputs per-player harvest/plant totals
// for FoxHole's tiles (Event 3 Tier A tracking).

const fs = require("fs");
const path = require("path");

const filePath = process.argv[2] || path.join(__dirname, "guild-updates.txt");
let raw = fs.readFileSync(filePath, "utf8");

// ── Pre-process: split concatenated lines ─────────────────────────────────────
// Some lines got merged together. Split them apart by injecting newlines
// before known action verbs at the start of a new sentence mid-line.
// Pattern: split before "PlayerName harvested/planted/cut" that appears mid-line.
raw = raw.replace(/([.!?])\s*([A-Z][a-z]+\s+(?:harvested|planted|cut)\s)/g, "$1\n$2");
raw = raw.replace(/(ago)\s*([A-Z][a-z]+\s+(?:harvested|planted|cut)\s)/g, "$1\n$2");

const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// ── Timestamp detection ────────────────────────────────────────────────────────
const isTimestamp = l =>
  /^\d+\s+(second|minute|hour|day)/.test(l) ||
  /^about\s+\d+\s+(second|minute|hour|day)/.test(l) ||
  /^just now/i.test(l);

// ── Action patterns ────────────────────────────────────────────────────────────
// "Nickoloy harvested Yellow flower in the tile of FoxHole and received 2 Yellow flower."
const harvestRe = /^(\S+) harvested (.+?) in the tile of (\S+) and received (\d+) (.+?)\.?$/;

// "Nickoloy planted Red flower seeds in the tile of FoxHole."
// "Nickoloy planted Fern spores in the tile of FoxHole."
const plantRe = /^(\S+) planted (.+?)\s+(?:seeds?|spores?|bulbs?|cuttings?|seedlings?) in the tile of (\S+)\.?$/;

// "Nickoloy cut a tree in the tile of FoxHole and received 3 wood."
const cutTreeRe = /^(\S+) cut a tree in the tile of (\S+) and received (\d+) (\w+)\.?$/;

// "Nickoloy mined a rock in the tile of FoxHole and received 3 stone."  (if it exists)
const mineRe = /^(\S+) mined (?:a )?(?:rock|stone|ore) in the tile of (\S+) and received (\d+) (.+?)\.?$/;

// "Nickoloy fished in the tile of FoxHole and received 2 Blue bluegill."
const fishRe = /^(\S+) fished in the tile of (\S+) and received (\d+) (.+?)\.?$/;

// ── Normalise item names ───────────────────────────────────────────────────────
function norm(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // Capitalise first letter of each word
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ── State ──────────────────────────────────────────────────────────────────────
// player → item → { harvested, planted }
const stats = {};
// Also track by tile owner so we can filter for FoxHole only
// player → tileOwner → item → { harvested, planted }
const statsByOwner = {};

function getItem(player, item) {
  if (!stats[player]) stats[player] = {};
  if (!stats[player][item]) stats[player][item] = { harvested: 0, planted: 0 };
  return stats[player][item];
}

function getOwnerItem(player, owner, item) {
  if (!statsByOwner[player]) statsByOwner[player] = {};
  if (!statsByOwner[player][owner]) statsByOwner[player][owner] = {};
  if (!statsByOwner[player][owner][item]) statsByOwner[player][owner][item] = { harvested: 0, planted: 0 };
  return statsByOwner[player][owner][item];
}

let harvestCount = 0, plantCount = 0, cutCount = 0, mineCount = 0, skipped = 0;
const unrecognised = new Set();

for (const line of lines) {
  if (isTimestamp(line)) continue;

  let m;

  m = harvestRe.exec(line);
  if (m) {
    const [, player, , tileOwner, qty, item] = m;
    const key = norm(item);
    const owner = tileOwner.replace(/[.,]$/, "");
    getItem(player, key).harvested += parseInt(qty, 10);
    getOwnerItem(player, owner, key).harvested += parseInt(qty, 10);
    harvestCount++;
    continue;
  }

  m = plantRe.exec(line);
  if (m) {
    const [, player, seedItem, tileOwner] = m;
    const key = norm(seedItem);
    const owner = tileOwner.replace(/[.,]$/, "");
    getItem(player, key).planted += 1;
    getOwnerItem(player, owner, key).planted += 1;
    plantCount++;
    continue;
  }

  m = cutTreeRe.exec(line);
  if (m) {
    const [, player, tileOwner, qty, item] = m;
    const key = norm(item);
    const owner = tileOwner.replace(/[.,]$/, "");
    getItem(player, key).harvested += parseInt(qty, 10);
    getOwnerItem(player, owner, key).harvested += parseInt(qty, 10);
    cutCount++;
    continue;
  }

  m = mineRe.exec(line);
  if (m) {
    const [, player, tileOwner, qty, item] = m;
    const key = norm(item);
    const owner = tileOwner.replace(/[.,]$/, "");
    getItem(player, key).harvested += parseInt(qty, 10);
    getOwnerItem(player, owner, key).harvested += parseInt(qty, 10);
    mineCount++;
    continue;
  }

  m = fishRe.exec(line);
  if (m) {
    const [, player, tileOwner, qty, item] = m;
    const key = norm(item);
    const owner = tileOwner.replace(/[.,]$/, "");
    getItem(player, key).harvested += parseInt(qty, 10);
    getOwnerItem(player, owner, key).harvested += parseInt(qty, 10);
    harvestCount++;
    continue;
  }

  if (unrecognised.size < 50) unrecognised.add(line.slice(0, 120));
  skipped++;
}

// ── Output ────────────────────────────────────────────────────────────────────

console.log("=== NomStead Activity Log Summary ===");
console.log(`Events parsed: ${harvestCount} harvests, ${plantCount} plants, ${cutCount} tree cuts, ${mineCount} mines`);
console.log(`Unrecognised lines: ${skipped}`);
console.log();

// --- All players, all tiles ---
console.log("━━━ ALL ACTIVITY (all tiles) ━━━");
for (const player of Object.keys(stats).sort()) {
  const items = stats[player];
  console.log(`\n── ${player} ──`);
  let totalH = 0;
  for (const item of Object.keys(items).sort()) {
    const { harvested, planted } = items[item];
    totalH += harvested;
    const parts = [];
    if (harvested) parts.push(`harvested ${harvested}`);
    if (planted) parts.push(`planted ${planted}`);
    console.log(`   ${item}: ${parts.join(", ")}`);
  }
  console.log(`   TOTAL harvested: ${totalH}`);
}

// --- FoxHole tiles only (Tier A relevant) ---
console.log("\n\n━━━ FOXHOLE TILES ONLY (Tier A / passive system) ━━━");
for (const player of Object.keys(statsByOwner).sort()) {
  const foxItems = statsByOwner[player]?.FoxHole;
  if (!foxItems) continue;
  console.log(`\n── ${player} (on FoxHole's tiles) ──`);
  let totalH = 0;
  for (const item of Object.keys(foxItems).sort()) {
    const { harvested, planted } = foxItems[item];
    totalH += harvested;
    const parts = [];
    if (harvested) parts.push(`harvested ${harvested}`);
    if (planted) parts.push(`planted ${planted}`);
    console.log(`   ${item}: ${parts.join(", ")}`);
  }
  console.log(`   TOTAL harvested on FoxHole tiles: ${totalH}`);
}

if (unrecognised.size > 0) {
  console.log("\n\n━━━ SAMPLE UNRECOGNISED LINES (first 50) ━━━");
  [...unrecognised].forEach(l => console.log("  " + l));
}

// ── JSON output ───────────────────────────────────────────────────────────────
const out = { all: stats, foxholeOnly: {} };
for (const player of Object.keys(statsByOwner)) {
  if (statsByOwner[player]?.FoxHole) {
    out.foxholeOnly[player] = statsByOwner[player].FoxHole;
  }
}
const outPath = path.join(path.dirname(filePath), "activity-summary.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nFull JSON written to: ${outPath}`);
