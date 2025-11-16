import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for now (will be replaced with database later)
// In production, use Vercel KV or another database
interface ScoreEntry {
  username: string;
  game: string;
  score: number;
  timestamp: number;
  // Alien Catacombs specific stats
  kills?: number;
  crystals?: number;
  healthDrops?: number;
  roomsExplored?: number;
  highestLevel?: number;
}

let scores: ScoreEntry[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Filter by game if specified
  let gameScores = game
    ? scores.filter(s => s.game === game)
    : scores;

  // Sort by score descending and get top scores
  const topScores = gameScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    success: true,
    scores: topScores
  });
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

    // Add new score with optional Catacombs stats
    const scoreEntry: ScoreEntry = {
      username,
      game,
      score,
      timestamp: Date.now(),
    };

    // Add Catacombs-specific stats if present
    if (game === 'catacombs') {
      if (typeof kills === 'number') scoreEntry.kills = kills;
      if (typeof crystals === 'number') scoreEntry.crystals = crystals;
      if (typeof healthDrops === 'number') scoreEntry.healthDrops = healthDrops;
      if (typeof roomsExplored === 'number') scoreEntry.roomsExplored = roomsExplored;
      if (typeof highestLevel === 'number') scoreEntry.highestLevel = highestLevel;
    }

    scores.push(scoreEntry);

    // Keep only top 100 scores per game to prevent memory issues
    const gameScores = scores.filter(s => s.game === game);
    if (gameScores.length > 100) {
      const topGameScores = gameScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      scores = [
        ...scores.filter(s => s.game !== game),
        ...topGameScores
      ];
    }

    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
