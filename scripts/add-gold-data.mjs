import { readFileSync, writeFileSync } from 'fs';

const logPath = process.argv[2];
if (!logPath) {
  console.error('Usage: node add-gold-data.mjs <gold-log-file>');
  process.exit(1);
}

const dataPath = 'app/guildevents/activity-data.json';
const raw = readFileSync(logPath, 'utf-8');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

const GOLD = /^(.+?) received ([\d.]+) gold as member share\.$/;

const goldByPlayer = {};

for (const rawLine of raw.split('\n')) {
  const line = rawLine.trim();
  const m = GOLD.exec(line);
  if (!m) continue;
  const [, player, amount] = m;
  const n = parseFloat(amount);
  goldByPlayer[player] = (goldByPlayer[player] || 0) + n;
}

const names = Object.keys(goldByPlayer);
console.log(`\nParsed ${names.length} players with gold earnings:`);
const sorted = names.sort((a, b) => goldByPlayer[b] - goldByPlayer[a]);
sorted.forEach(name => {
  console.log(`  ${name}: ${goldByPlayer[name].toFixed(4)} gold`);
});

// Update each tracked player
let matched = 0;
for (const player of data.players) {
  if (goldByPlayer[player.name] !== undefined) {
    player.goldEarned = parseFloat(goldByPlayer[player.name].toFixed(4));
    matched++;
  } else {
    player.goldEarned = 0;
  }
}

// Warn about players in gold log not in tracking
const existingNames = new Set(data.players.map(p => p.name));
for (const name of names) {
  if (!existingNames.has(name)) {
    console.log(`  NOTE: ${name} in gold log but not in activity-data — skipping`);
  }
}

const totalGold = data.players.reduce((a, p) => a + (p.goldEarned || 0), 0);
data.totals.totalGold = parseFloat(totalGold.toFixed(4));

writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nUpdated ${matched} players in activity-data.json`);
console.log(`  Total gold tracked: ${data.totals.totalGold}`);
