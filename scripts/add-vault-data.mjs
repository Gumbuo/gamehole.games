import { readFileSync, writeFileSync } from 'fs';

const logPath = process.argv[2];
if (!logPath) {
  console.error('Usage: node add-vault-data.mjs <vault-log-file>');
  process.exit(1);
}

const dataPath = 'app/guildevents/activity-data.json';
const raw = readFileSync(logPath, 'utf-8');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

const TRANSFER   = /^(.+?) transferred ([\d.]+) gold to the guild\.$/;
const REINVEST   = /^([\d.]+) gold was added to the guild vault for reinvestment\.$/;

const vaultByPlayer = {};
let totalReinvested = 0;

for (const rawLine of raw.split('\n')) {
  const line = rawLine.trim();

  let m;
  if ((m = TRANSFER.exec(line))) {
    const [, player, amount] = m;
    const n = parseFloat(amount);
    vaultByPlayer[player] = (vaultByPlayer[player] || 0) + n;
  } else if ((m = REINVEST.exec(line))) {
    totalReinvested += parseFloat(m[1]);
  }
}

const names = Object.keys(vaultByPlayer);
const sorted = names.sort((a, b) => vaultByPlayer[b] - vaultByPlayer[a]);
console.log(`\nParsed ${names.length} players with vault donations:`);
sorted.forEach(name => {
  console.log(`  ${name}: ${vaultByPlayer[name]} gold`);
});
console.log(`\nTotal reinvested (auto): ${totalReinvested.toFixed(4)} gold`);

let matched = 0;
for (const player of data.players) {
  if (vaultByPlayer[player.name] !== undefined) {
    player.vaultDonated = vaultByPlayer[player.name];
    matched++;
  } else {
    player.vaultDonated = 0;
  }
}

const existingNames = new Set(data.players.map(p => p.name));
for (const name of names) {
  if (!existingNames.has(name)) {
    console.log(`  NOTE: ${name} in log but not in activity-data — skipping`);
  }
}

const totalVaultDonated = data.players.reduce((a, p) => a + (p.vaultDonated || 0), 0);
data.totals.totalVaultDonated = totalVaultDonated;
data.totals.totalReinvested = parseFloat(totalReinvested.toFixed(4));

writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\nUpdated ${matched} players in activity-data.json`);
console.log(`  Total vault donated by players: ${totalVaultDonated} gold`);
