// parse-activity.js
// Usage: node parse-activity.js [path-to-log.txt]
// Parses NomStead activity logs and outputs per-player breakdown of
// harvested crops, planted seeds, chopped trees, and mined resources.

const fs = require("fs");
const path = require("path");

const filePath = process.argv[2] || path.join(__dirname, "guild-updates.txt");
let raw = fs.readFileSync(filePath, "utf8");

// ── Pre-process: split concatenated lines ─────────────────────────────────────
raw = raw.replace(/([.!?])\s*([A-Z][a-z]+\s+(?:harvested|planted|cut|mined|fished)\s)/g, "$1\n$2");
raw = raw.replace(/(ago)\s*([A-Z][a-z]+\s+(?:harvested|planted|cut|mined|fished)\s)/g, "$1\n$2");

const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

// ── Timestamp detection ────────────────────────────────────────────────────────
const isTimestamp = l =>
  /^\d+\s+(second|minute|hour|day)/.test(l) ||
  /^about\s+\d+\s+(second|minute|hour|day)/.test(l) ||
  /^just now/i.test(l);

// ── Action patterns ────────────────────────────────────────────────────────────
const harvestRe = /^(.+?) harvested .+? in the tile of .+? and received (\d+) (.+?)\.?$/;
const plantRe   = /^(.+?) planted (.+?)\s+(?:seeds?|spores?|bulbs?|cuttings?|seedlings?) in the tile of .+?\.?$/;
const cutTreeRe = /^(.+?) cut a tree in the tile of .+? and received (\d+) (.+?)\.?$/;
const mineRe    = /^(.+?) mined (?:a )?(?:rock|stone|ore|iron|silver|gold) in the tile of .+? and received (\d+) (.+?)\.?$/;
const fishRe    = /^(.+?) fished in the tile of .+? and received (\d+) (.+?)\.?$/;

// ── Normalise item names ───────────────────────────────────────────────────────
function norm(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ── State: player → { harvested, planted, chopped, mined } each a Record<item, qty> ──
const players = {};

function get(player) {
  if (!players[player]) players[player] = { harvested: {}, planted: {}, chopped: {}, mined: {} };
  return players[player];
}

function add(bucket, item, qty) {
  bucket[item] = (bucket[item] || 0) + qty;
}

let harvestCount = 0, plantCount = 0, cutCount = 0, mineCount = 0, fishCount = 0, skipped = 0;
const unrecognised = new Set();

for (const line of lines) {
  if (isTimestamp(line)) continue;

  let m;

  m = cutTreeRe.exec(line);
  if (m) {
    const [, player, qty, item] = m;
    add(get(player).chopped, norm(item), parseInt(qty, 10));
    cutCount++;
    continue;
  }

  m = mineRe.exec(line);
  if (m) {
    const [, player, qty, item] = m;
    add(get(player).mined, norm(item), parseInt(qty, 10));
    mineCount++;
    continue;
  }

  m = harvestRe.exec(line);
  if (m) {
    const [, player, qty, item] = m;
    add(get(player).harvested, norm(item), parseInt(qty, 10));
    harvestCount++;
    continue;
  }

  m = fishRe.exec(line);
  if (m) {
    const [, player, qty, item] = m;
    add(get(player).harvested, norm(item), parseInt(qty, 10));
    fishCount++;
    continue;
  }

  m = plantRe.exec(line);
  if (m) {
    const [, player, seedItem] = m;
    add(get(player).planted, norm(seedItem), 1);
    plantCount++;
    continue;
  }

  if (unrecognised.size < 50) unrecognised.add(line.slice(0, 120));
  skipped++;
}

// ── Build sorted player list by total activity ────────────────────────────────
function sumBucket(b) { return Object.values(b).reduce((s, v) => s + v, 0); }

const playerList = Object.entries(players).map(([name, p]) => ({
  name,
  harvested: p.harvested,
  planted:   p.planted,
  chopped:   p.chopped,
  mined:     p.mined,
  totalH: sumBucket(p.harvested),
  totalP: sumBucket(p.planted),
  totalC: sumBucket(p.chopped),
  totalM: sumBucket(p.mined),
})).sort((a, b) => (b.totalH + b.totalC + b.totalM) - (a.totalH + a.totalC + a.totalM));

// ── Format output ─────────────────────────────────────────────────────────────
function fmtBucket(label, bucket, total) {
  if (total === 0) return [];
  const rows = [`   [${label}]`];
  for (const item of Object.keys(bucket).sort()) {
    rows.push(`      ${item}: ${bucket[item]}`);
  }
  rows.push(`      Total: ${total}`);
  return rows;
}

const out = [];
out.push("=== NomStead Guild Activity Record ===");
out.push(`Parsed: ${harvestCount} crop harvests, ${fishCount} fish, ${plantCount} plants, ${cutCount} tree cuts, ${mineCount} mines`);
out.push(`Unrecognised lines: ${skipped}`);
out.push(`Generated: ${new Date().toUTCString()}`);
out.push("");

for (const p of playerList) {
  out.push(`── ${p.name} ──`);
  out.push(...fmtBucket("Harvested", p.harvested, p.totalH));
  out.push(...fmtBucket("Planted",   p.planted,   p.totalP));
  out.push(...fmtBucket("Chopped Trees", p.chopped, p.totalC));
  out.push(...fmtBucket("Mined",     p.mined,     p.totalM));
  out.push("");
}

if (unrecognised.size > 0) {
  out.push("── Unrecognised lines (sample) ──");
  [...unrecognised].forEach(l => out.push("  " + l));
  out.push("");
}

const output = out.join("\n");
console.log(output);

// ── Save files ────────────────────────────────────────────────────────────────
const txtPath = path.join(path.dirname(filePath), "guild-activity-record.txt");
fs.writeFileSync(txtPath, output);
console.log(`Record saved to: ${txtPath}`);

const outPath = path.join(path.dirname(filePath), "activity-summary.json");
fs.writeFileSync(outPath, JSON.stringify(players, null, 2));
console.log(`JSON saved to: ${outPath}`);
