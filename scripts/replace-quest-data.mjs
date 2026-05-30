import { readFileSync, writeFileSync } from 'fs';

const logPath = process.argv[2];
if (!logPath) {
  console.error('Usage: node replace-quest-data.mjs <guild-log-file>');
  process.exit(1);
}

const dataPath = 'app/guildevents/activity-data.json';
const raw = readFileSync(logPath, 'utf-8');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

const QUEST = /^(.+?) contributed (\d+) (.+?) to the daily quest\.$/;

const questsByPlayer = {};
const questCountByPlayer = {};

for (const rawLine of raw.split('\n')) {
  const line = rawLine.trim();
  const m = QUEST.exec(line);
  if (!m) continue;
  const [, player, qty, item] = m;
  const n = parseInt(qty, 10);
  if (!questsByPlayer[player]) {
    questsByPlayer[player] = {};
    questCountByPlayer[player] = 0;
  }
  questsByPlayer[player][item] = (questsByPlayer[player][item] || 0) + n;
  questCountByPlayer[player]++;
}

const names = Object.keys(questsByPlayer);
console.log(`\nParsed ${names.length} players with quest contributions:`);
const sorted = names.sort((a, b) => {
  const sumA = Object.values(questsByPlayer[a]).reduce((x, y) => x + y, 0);
  const sumB = Object.values(questsByPlayer[b]).reduce((x, y) => x + y, 0);
  return sumB - sumA;
});
sorted.forEach(name => {
  const total = Object.values(questsByPlayer[name]).reduce((x, y) => x + y, 0);
  const count = questCountByPlayer[name];
  console.log(`  ${name}: ${count} contributions, ${total} items`);
});

// Update each player in data
let newTotalQuest = 0;
for (const player of data.players) {
  const oldQuestTotal = Object.values(player.quests || {}).reduce((a, b) => a + b, 0);
  const newQuests = questsByPlayer[player.name] || {};
  const newQuestTotal = Object.values(newQuests).reduce((a, b) => a + b, 0);
  const newQuestCount = questCountByPlayer[player.name] || 0;

  // Recalculate score: subtract old quest total, add new quest total
  player.score = player.score - oldQuestTotal + newQuestTotal;
  player.quests = newQuests;
  player.questContributions = newQuestCount;

  newTotalQuest += newQuestTotal;
}

// Add quest data for players in the log who aren't in data yet (edge case)
const existingNames = new Set(data.players.map(p => p.name));
for (const name of names) {
  if (!existingNames.has(name)) {
    console.log(`  WARNING: ${name} found in log but not in activity-data.json — skipping`);
  }
}

// Re-sort by score descending
data.players.sort((a, b) => b.score - a.score);

// Update totals
data.totals.totalQuest = newTotalQuest;

writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nUpdated activity-data.json`);
console.log(`  New totalQuest: ${newTotalQuest}`);
console.log(`  Players updated: ${data.players.length}`);
