import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for now (will be replaced with database later)
// In production, use Vercel KV or another database
interface ScoreEntry {
  username: string;
  game: string;
  score: number;
  timestamp: number;
  // Common stats (used by multiple games)
  kills?: number;
  highestLevel?: number;
  // Alien Catacombs specific stats
  crystals?: number;
  healthDrops?: number;
  roomsExplored?: number;
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

    // Check if user already has a score for this game
    const existingScoreIndex = scores.findIndex(
      s => s.username.toLowerCase() === username.toLowerCase() && s.game === game
    );

    // Create new score entry
    const scoreEntry: ScoreEntry = {
      username,
      game,
      score,
      timestamp: Date.now(),
    };

    // Add common stats (kills, highestLevel) for all games
    if (typeof kills === 'number') scoreEntry.kills = kills;
    if (typeof highestLevel === 'number') scoreEntry.highestLevel = highestLevel;

    // Add Catacombs-specific stats if present
    if (game === 'catacombs') {
      if (typeof crystals === 'number') scoreEntry.crystals = crystals;
      if (typeof healthDrops === 'number') scoreEntry.healthDrops = healthDrops;
      if (typeof roomsExplored === 'number') scoreEntry.roomsExplored = roomsExplored;
    }

    // Only keep the highest score per user per game
    if (existingScoreIndex !== -1) {
      const existingScore = scores[existingScoreIndex];
      if (score > existingScore.score) {
        // New high score! Replace the old entry
        scores[existingScoreIndex] = scoreEntry;
      }
      // If new score is lower, don't add it
    } else {
      // First time playing this game, add the score
      scores.push(scoreEntry);
    }

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
