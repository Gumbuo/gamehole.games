/**
 * merge-daily-log.mjs
 * Usage: node scripts/merge-daily-log.mjs <log-file> [--dry-run]
 *
 * Parses wood/mining/fishing/contributions from a cumulative guild log file
 * and ADDS the new totals onto existing player records in activity-data.json.
 * Farming (planted/harvested) is intentionally left untouched.
 */

import { readFileSync, writeFileSync } from 'fs';

const logPath = process.argv[2];
if (!logPath) {
  console.error('Usage: node scripts/merge-daily-log.mjs <log-file> [--dry-run]');
  process.exit(1);
}
const dryRun = process.argv.includes('--dry-run');

const dataPath = 'app/guildevents/activity-data.json';
const raw = readFileSync(logPath, 'utf-8');
const existing = JSON.parse(readFileSync(dataPath, 'utf-8'));

function cleanLine(line) {
  return line.replace(/^\d+\t/, '').replace(/\s+about \d+ hours? ago\s*$/, '').trim();
}

const CUT_TREE = /^(.+?) cut a tree in the tile of (.+?) and received (\d+) wood\.$/;
const MINED    = /^(.+?) mined a rock in the tile of (.+?) and received (\d+) (.+?)\.$/;
const FISHED   = /^(.+?) fished in the tile of (.+?) and received (\d+) (.+?)\.$/;
const QUEST    = /^(.+?) contributed (\d+) (.+?) to the daily quest\.$/;

// Deltas keyed by player name (exact case from log)
const deltas = {};
function getDelta(name) {
  if (!deltas[name]) deltas[name] = { trees: 0, treeChops: 0, mined: {}, mineSwings: 0, fished: {}, fishCasts: 0, quests: {}, questContributions: 0 };
  return deltas[name];
}

for (const rawLine of raw.split('\n')) {
  const line = cleanLine(rawLine);
  if (!line) continue;
  let m;

  if ((m = CUT_TREE.exec(line))) {
    const [, player, , qty] = m;
    const d = getDelta(player);
    d.trees += parseInt(qty, 10);
    d.treeChops += 1;

  } else if ((m = MINED.exec(line))) {
    const [, player, , qty, mineral] = m;
    const d = getDelta(player);
    d.mined[mineral] = (d.mined[mineral] || 0) + parseInt(qty, 10);
    d.mineSwings += 1;

  } else if ((m = FISHED.exec(line))) {
    const [, player, , qty, fish] = m;
    const d = getDelta(player);
    d.fished[fish] = (d.fished[fish] || 0) + parseInt(qty, 10);
    d.fishCasts += 1;

  } else if ((m = QUEST.exec(line))) {
    const [, player, qty, item] = m;
    const d = getDelta(player);
    d.quests[item] = (d.quests[item] || 0) + parseInt(qty, 10);
    d.questContributions += 1;
  }
}

// Build a lookup map from existing players (lowercase key)
const playerMap = new Map(existing.players.map(p => [p.name.toLowerCase(), p]));

let newPlayers = 0;
for (const [logName, d] of Object.entries(deltas)) {
  const key = logName.toLowerCase();
  let player = playerMap.get(key);

  if (!player) {
    // New player not in existing data — add them
    player = {
      name: logName,
      score: 0,
      planted: {},
      harvested: {},
      trees: 0,
      treeTiles: {},
      mined: {},
      fished: {},
      quests: {},
      unplanted: {},
      joinDate: null,
      guildStatus: "unknown",
      treeChops: 0,
      mineSwings: 0,
      fishCasts: 0,
      questContributions: 0,
      goldEarned: 0,
      vaultDonated: 0,
    };
    existing.players.push(player);
    playerMap.set(key, player);
    newPlayers++;
    console.log(`  [NEW] ${logName}`);
  }

  player.trees += d.trees;
  player.treeChops += d.treeChops;
  player.mineSwings += d.mineSwings;
  player.fishCasts += d.fishCasts;
  player.questContributions += d.questContributions;

  for (const [mineral, qty] of Object.entries(d.mined)) {
    player.mined[mineral] = (player.mined[mineral] || 0) + qty;
  }
  for (const [fish, qty] of Object.entries(d.fished)) {
    player.fished[fish] = (player.fished[fish] || 0) + qty;
  }
  for (const [item, qty] of Object.entries(d.quests)) {
    player.quests[item] = (player.quests[item] || 0) + qty;
  }
}

// Recalculate score for each player (farming fields unchanged, gold unchanged)
function sum(obj) { return Object.values(obj).reduce((a, b) => a + b, 0); }
for (const p of existing.players) {
  p.score = sum(p.harvested) + sum(p.planted) + p.trees + sum(p.mined) + sum(p.fished) + sum(p.quests);
}

// Sort by score descending
existing.players.sort((a, b) => b.score - a.score);

// Recalculate totals (keep gold/vault as-is)
existing.totals.totalWood   = existing.players.reduce((a, p) => a + p.trees, 0);
existing.totals.totalMined  = existing.players.reduce((a, p) => a + sum(p.mined), 0);
existing.totals.totalFish   = existing.players.reduce((a, p) => a + sum(p.fished), 0);
existing.totals.totalQuest  = existing.players.reduce((a, p) => a + sum(p.quests), 0);
existing.totals.totalHarvested = existing.players.reduce((a, p) => a + sum(p.harvested), 0);
existing.totals.totalPlanted   = existing.players.reduce((a, p) => a + sum(p.planted), 0);

existing.date = '2026-06-01';

// Summary
const uniqueInLog = Object.keys(deltas).length;
console.log(`\nLog players with activity: ${uniqueInLog}`);
console.log(`New players added: ${newPlayers}`);
console.log(`\nNew totals:`);
console.log(`  Wood:          ${existing.totals.totalWood.toLocaleString()}`);
console.log(`  Mined:         ${existing.totals.totalMined.toLocaleString()}`);
console.log(`  Fish:          ${existing.totals.totalFish.toLocaleString()}`);
console.log(`  Quest items:   ${existing.totals.totalQuest.toLocaleString()}`);

if (dryRun) {
  console.log('\n[DRY RUN] No file written.');
} else {
  writeFileSync(dataPath, JSON.stringify(existing, null, 2), 'utf-8');
  console.log(`\nWritten to ${dataPath}`);
}
