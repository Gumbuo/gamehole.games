import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '../lib/points';

interface ScoreEntry {
  username: string;
  game: string;
  score: number;
  timestamp: number;
  kills?: number;
  highestLevel?: number;
  crystals?: number;
  healthDrops?: number;
  roomsExplored?: number;
}

const SCORES_KEY = (game: string) => `foxstead:scores:${game}`;
const GAMES_KEY = 'foxstead:games';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');
  const limit = parseInt(searchParams.get('limit') || '10');
  const redis = getRedis();

  let allScores: ScoreEntry[] = [];

  const games: string[] = game
    ? [game]
    : ((await redis.smembers(GAMES_KEY)) as string[]) ?? [];

  for (const g of games) {
    const raw = await redis.hgetall<Record<string, ScoreEntry>>(SCORES_KEY(g));
    if (raw) {
      allScores.push(...Object.values(raw));
    }
  }

  const topScores = allScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({ success: true, scores: topScores });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, game, score, kills, crystals, healthDrops, roomsExplored, highestLevel } = body;

    if (!username || !game || typeof score !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const userKey = username.toLowerCase();

    const existing = await redis.hget<ScoreEntry>(SCORES_KEY(game), userKey);
    if (existing && existing.score >= score) {
      return NextResponse.json({ success: true, message: 'Score not a new high score' });
    }

    const scoreEntry: ScoreEntry = {
      username,
      game,
      score,
      timestamp: Date.now(),
    };
    if (typeof kills === 'number') scoreEntry.kills = kills;
    if (typeof highestLevel === 'number') scoreEntry.highestLevel = highestLevel;
    if (game === 'catacombs') {
      if (typeof crystals === 'number') scoreEntry.crystals = crystals;
      if (typeof healthDrops === 'number') scoreEntry.healthDrops = healthDrops;
      if (typeof roomsExplored === 'number') scoreEntry.roomsExplored = roomsExplored;
    }

    await redis.hset(SCORES_KEY(game), { [userKey]: scoreEntry });
    await redis.sadd(GAMES_KEY, game);

    return NextResponse.json({ success: true, message: 'Score submitted successfully' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
