import { readFileSync, writeFileSync } from 'fs';

const LOG = readFileSync('scripts/member-log.txt', 'utf-8').trim().split('\n');
const TODAY = new Date('2026-05-30');

function daysAgo(str) {
  str = str.trim();
  if (str === 'about 1 month ago') return 30;
  if (str === 'about 2 months ago') return 60;
  const m = str.match(/^(\d+) days? ago$/);
  if (m) return parseInt(m[1], 10);
  return 0;
}

function toISODate(daysBack) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

// Parse pairs: action line + date line
const events = [];
for (let i = 0; i < LOG.length - 1; i += 2) {
  const action = LOG[i].trim();
  const dateStr = LOG[i + 1]?.trim() || '';
  const days = daysAgo(dateStr);
  const date = toISODate(days);

  const accepted = action.match(/^Mrfaf accepted (.+?) as a member\.$/);
  const kicked   = action.match(/^Mrfaf kicked (.+?) from the guild\.$/);

  if (accepted) events.push({ name: accepted[1], type: 'accepted', date, days });
  if (kicked)   events.push({ name: kicked[1],   type: 'kicked',   date, days });
}

// Build per-player state: list is most-recent-first, so first event = current state
const playerState = {};
for (const ev of events) {
  if (!playerState[ev.name]) {
    playerState[ev.name] = { status: ev.type, lastEvent: ev.date };
  }
  // Track earliest accepted date as join date
  if (ev.type === 'accepted') {
    playerState[ev.name].joinDate = ev.date;
  }
}

// Update activity-data.json
const dataPath = 'app/guildevents/activity-data.json';
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

for (const player of data.players) {
  const state = playerState[player.name];
  if (state) {
    player.joinDate = state.joinDate || null;
    player.guildStatus = state.status; // 'accepted' or 'kicked'
  } else {
    player.joinDate = null;
    player.guildStatus = null;
  }
}

writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('Done. Member states:');
for (const [name, s] of Object.entries(playerState)) {
  const inData = data.players.find(p => p.name === name);
  console.log(`  ${s.status === 'kicked' ? '❌' : '✅'} ${name} — joined ${s.joinDate || '?'}${inData ? '' : ' (not in activity data)'}`);
}
