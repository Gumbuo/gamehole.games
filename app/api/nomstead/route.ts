import { NextRequest, NextResponse } from "next/server";

// Stats shape returned for any Immutable game
interface GameStats {
  gameId: string;
  totalCards?: number;
  totalPlayers?: number;
  collectionSize?: number;
  lastUpdated: number;
}

// In-memory cache keyed by gameId, 10-minute TTL
const cache = new Map<string, { stats: GameStats; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

// Gods Unchained dedicated public API (no auth, 5/s rate limit)
const GU_API = "https://api.godsunchained.com/v0";

async function fetchGodsUnchained(): Promise<GameStats> {
  // Fetch card count and player count in parallel
  const [protoRes, playersRes] = await Promise.allSettled([
    fetch(`${GU_API}/proto?perPage=1`, {
      signal: AbortSignal.timeout(8000),
    }),
    fetch(`${GU_API}/properties?perPage=1`, {
      signal: AbortSignal.timeout(8000),
    }),
  ]);

  let totalCards: number | undefined;
  let totalPlayers: number | undefined;

  if (protoRes.status === "fulfilled" && protoRes.value.ok) {
    const data = await protoRes.value.json();
    totalCards = data.total ?? undefined;
  }

  if (playersRes.status === "fulfilled" && playersRes.value.ok) {
    const data = await playersRes.value.json();
    totalPlayers = data.total ?? undefined;
  }

  return {
    gameId: "godsunchained",
    totalCards,
    totalPlayers,
    lastUpdated: Date.now(),
  };
}

// Supported games and their fetch functions
const GAME_FETCHERS: Record<string, () => Promise<GameStats>> = {
  godsunchained: fetchGodsUnchained,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game") || "all";

    // If requesting a specific game
    if (gameId !== "all") {
      const cached = cache.get(gameId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({ success: true, stats: cached.stats, cached: true });
      }

      const fetcher = GAME_FETCHERS[gameId];
      if (!fetcher) {
        return NextResponse.json(
          { success: false, error: `Unknown game: ${gameId}`, stats: null },
          { status: 404 }
        );
      }

      const stats = await fetcher();
      cache.set(gameId, { stats, timestamp: Date.now() });
      return NextResponse.json({ success: true, stats, cached: false });
    }

    // Fetch all games
    const allStats: Record<string, GameStats> = {};
    const fetches = Object.entries(GAME_FETCHERS).map(async ([id, fetcher]) => {
      const cached = cache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        allStats[id] = cached.stats;
        return;
      }
      try {
        const stats = await fetcher();
        cache.set(id, { stats, timestamp: Date.now() });
        allStats[id] = stats;
      } catch {
        // Use stale cache if available
        if (cached) allStats[id] = cached.stats;
      }
    });

    await Promise.allSettled(fetches);

    return NextResponse.json({ success: true, stats: allStats, cached: false });
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch game stats" },
      { status: 500 }
    );
  }
}
