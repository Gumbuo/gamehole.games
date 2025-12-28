import { NextRequest, NextResponse } from "next/server";

// Types for the FreeToGame API
interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

// Cache games for 10 minutes to reduce API calls
let cachedGames: FreeGame[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "browser"; // browser, pc, or all
    const category = searchParams.get("category") || ""; // mmorpg, shooter, strategy, etc.
    const sort = searchParams.get("sort") || "popularity"; // popularity, release-date, alphabetical
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    // Check cache
    const now = Date.now();
    if (!cachedGames || now - cacheTimestamp > CACHE_DURATION) {
      // Fetch from FreeToGame API
      const apiUrl = new URL("https://www.freetogame.com/api/games");
      if (platform && platform !== "all") {
        apiUrl.searchParams.set("platform", platform);
      }
      if (category) {
        apiUrl.searchParams.set("category", category);
      }
      apiUrl.searchParams.set("sort-by", sort);

      const response = await fetch(apiUrl.toString(), {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 600 }, // Cache for 10 minutes
      });

      if (!response.ok) {
        throw new Error(`FreeToGame API error: ${response.status}`);
      }

      cachedGames = await response.json();
      cacheTimestamp = now;
    }

    let games = cachedGames || [];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      games = games.filter(
        (game) =>
          game.title.toLowerCase().includes(searchLower) ||
          game.genre.toLowerCase().includes(searchLower) ||
          game.short_description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter (if cached data doesn't match)
    if (category) {
      games = games.filter(
        (game) => game.genre.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply limit
    games = games.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games",
        games: [],
      },
      { status: 500 }
    );
  }
}
