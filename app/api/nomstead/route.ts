import { NextRequest, NextResponse } from "next/server";

interface GameStats {
  gameId: string;
  totalCards?: number;
  totalPlayers?: number;
  nftCount?: number;
  activeListings?: number;
  floorPrice?: string;
  floorCurrency?: string;
  collectionName?: string;
  marketplaceUrl?: string;
  lastUpdated: number;
}

// In-memory cache keyed by gameId, 10-minute TTL
const cache = new Map<string, { stats: GameStats; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

// APIs
const GU_API = "https://api.godsunchained.com/v0";
const IMX_ZKEVM_API = "https://api.immutable.com/v1/chains/imtbl-zkevm-mainnet";

// NomStead collections on Immutable zkEVM
const NOMSTEAD_TILES = "0x213d44664cdf6c79abe73bf9310ec68e0329a2c6";
const NOMSTEAD_CHESTS = "0x80f2f7100e4155105c6ea4e3b822726cbe56cccc";
const NOMSTEAD_COMPANIONS = "0x3167dd54e6fe1b7d4a9688af031c7c00f1dcfdc9";

// Illuvium collections on Immutable zkEVM
const ILLUVIUM_ILLUVIALS = "0x0cf79ecde0c183b0cf3fe66b624e29b127bfc867";
const ILLUVIUM_LAND = "0x300a861089c28eb2b1604c24ef7c7360b7236bc0";

// USDC on Immutable zkEVM (6 decimals)
const USDC_DECIMALS = 6;
// Native IMX token (18 decimals)
const IMX_DECIMALS = 18;

async function fetchGodsUnchained(): Promise<GameStats> {
  const [protoRes, playersRes] = await Promise.allSettled([
    fetch(`${GU_API}/proto?perPage=1`, { signal: AbortSignal.timeout(8000) }),
    fetch(`${GU_API}/properties?perPage=1`, { signal: AbortSignal.timeout(8000) }),
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
    marketplaceUrl: "https://market.immutable.com/collections/0xacb3c6a43d15b907e8433077b6d38ae40936fe2c",
    lastUpdated: Date.now(),
  };
}

async function countNFTs(contractAddress: string): Promise<number> {
  // Page through to count - the API doesn't give a total, so fetch with large page
  let count = 0;
  let cursor: string | null = null;
  // Do up to 5 pages of 200 to get a count
  for (let i = 0; i < 5; i++) {
    const cursorParam = cursor ? `&page_cursor=${cursor}` : "";
    const url: string = `${IMX_ZKEVM_API}/collections/${contractAddress}/nfts?page_size=200${cursorParam}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) break;
    const data = await res.json();
    count += data.result?.length ?? 0;
    cursor = data.page?.next_cursor ?? null;
    if (!cursor || !data.result?.length) break;
  }
  return count;
}

async function getFloorListing(contractAddress: string): Promise<{ count: number; floorPrice?: string }> {
  // Fetch active listings sorted by price (lowest first is default)
  const url = `${IMX_ZKEVM_API}/orders/listings?sell_item_contract_address=${contractAddress}&status=ACTIVE&page_size=200`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return { count: 0 };

  const data = await res.json();
  const results = data.result ?? [];
  const count = results.length;

  // Find cheapest listing
  let cheapest: number | null = null;
  for (const listing of results) {
    const raw = Number(listing.buy?.[0]?.amount ?? 0);
    if (raw > 0 && (cheapest === null || raw < cheapest)) {
      cheapest = raw;
    }
  }

  const floorPrice = cheapest != null
    ? (cheapest / Math.pow(10, USDC_DECIMALS)).toFixed(2)
    : undefined;

  return { count, floorPrice };
}

async function fetchNomStead(): Promise<GameStats> {
  // Fetch all three collections: tiles, chests, companions
  const [tilesCount, chestsCount, companionsCount, tilesListings, chestsListings, companionsListings] = await Promise.all([
    countNFTs(NOMSTEAD_TILES).catch(() => 0),
    countNFTs(NOMSTEAD_CHESTS).catch(() => 0),
    countNFTs(NOMSTEAD_COMPANIONS).catch(() => 0),
    getFloorListing(NOMSTEAD_TILES).catch((): { count: number; floorPrice?: string } => ({ count: 0 })),
    getFloorListing(NOMSTEAD_CHESTS).catch((): { count: number; floorPrice?: string } => ({ count: 0 })),
    getFloorListing(NOMSTEAD_COMPANIONS).catch((): { count: number; floorPrice?: string } => ({ count: 0 })),
  ]);

  const totalNFTs = tilesCount + chestsCount + companionsCount;
  const totalListings = tilesListings.count + chestsListings.count + companionsListings.count;

  // Use the cheapest floor price across all collections
  const floors = [tilesListings.floorPrice, chestsListings.floorPrice, companionsListings.floorPrice]
    .filter((f): f is string => !!f)
    .map(f => parseFloat(f));
  const floorPrice = floors.length > 0 ? Math.min(...floors).toFixed(2) : undefined;

  return {
    gameId: "nomstead",
    nftCount: totalNFTs || undefined,
    activeListings: totalListings || undefined,
    floorPrice,
    floorCurrency: floorPrice ? "USDC" : undefined,
    collectionName: "NomStead",
    marketplaceUrl: `https://sphere.market/immutable/collection/${NOMSTEAD_TILES}`,
    lastUpdated: Date.now(),
  };
}

async function getFloorListingIMX(contractAddress: string): Promise<{ count: number; floorPrice?: string }> {
  // Fetch active listings for IMX-denominated collections
  const url = `${IMX_ZKEVM_API}/orders/listings?sell_item_contract_address=${contractAddress}&status=ACTIVE&page_size=200`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return { count: 0 };

  const data = await res.json();
  const results = data.result ?? [];
  const count = results.length;

  // Find cheapest listing (handle both native IMX and ERC20)
  let cheapest: number | null = null;
  for (const listing of results) {
    const buyItem = listing.buy?.[0];
    if (!buyItem) continue;
    const raw = Number(buyItem.amount ?? 0);
    // Determine decimals based on token type
    const decimals = buyItem.type === "NATIVE" ? IMX_DECIMALS : USDC_DECIMALS;
    const normalized = raw / Math.pow(10, decimals);
    if (normalized > 0 && (cheapest === null || normalized < cheapest)) {
      cheapest = normalized;
    }
  }

  const floorPrice = cheapest != null ? cheapest.toFixed(4) : undefined;
  return { count, floorPrice };
}

async function fetchIlluvium(): Promise<GameStats> {
  // Fetch Illuvials (main creatures) and Land collections
  const [illuvialsCount, landCount, illuvialsListings, landListings] = await Promise.all([
    countNFTs(ILLUVIUM_ILLUVIALS).catch(() => 0),
    countNFTs(ILLUVIUM_LAND).catch(() => 0),
    getFloorListingIMX(ILLUVIUM_ILLUVIALS).catch((): { count: number; floorPrice?: string } => ({ count: 0 })),
    getFloorListingIMX(ILLUVIUM_LAND).catch((): { count: number; floorPrice?: string } => ({ count: 0 })),
  ]);

  const totalNFTs = illuvialsCount + landCount;
  const totalListings = illuvialsListings.count + landListings.count;

  // Use the cheaper floor
  const floors = [illuvialsListings.floorPrice, landListings.floorPrice]
    .filter((f): f is string => !!f)
    .map(f => parseFloat(f));
  const floorPrice = floors.length > 0 ? Math.min(...floors).toFixed(4) : undefined;

  return {
    gameId: "illuvium",
    nftCount: totalNFTs || undefined,
    activeListings: totalListings || undefined,
    floorPrice,
    floorCurrency: floorPrice ? "IMX" : undefined,
    collectionName: "Illuvium",
    marketplaceUrl: `https://sphere.market/immutable/collection/${ILLUVIUM_ILLUVIALS}`,
    lastUpdated: Date.now(),
  };
}

async function fetchSpiderTanks(): Promise<GameStats> {
  // Spider Tanks: Cores of Chaos launched Dec 2025 on Immutable
  // NFTs are optional - the game focuses on gameplay-first
  // Link to the Immutable Play page
  return {
    gameId: "spidertanks",
    collectionName: "Spider Tanks: Cores of Chaos",
    marketplaceUrl: "https://play.immutable.com/games/spider-tanks-cores-of-chaos/",
    lastUpdated: Date.now(),
  };
}

const GAME_FETCHERS: Record<string, () => Promise<GameStats>> = {
  godsunchained: fetchGodsUnchained,
  nomstead: fetchNomStead,
  spidertanks: fetchSpiderTanks,
  illuvium: fetchIlluvium,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("game") || "all";

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
