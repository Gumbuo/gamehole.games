import { NextResponse } from "next/server";

interface NomsteadStats {
  totalNFTs: number | null;
  activeListings: number | null;
  floorPrice: string | null;
  lastUpdated: number;
}

// In-memory cache with 10-minute TTL
let cachedStats: NomsteadStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const NOMSTEAD_COLLECTION = "nomstead";
const IMX_API_BASE = "https://api.immutable.com/v1";

export async function GET() {
  try {
    const now = Date.now();
    if (cachedStats && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, stats: cachedStats, cached: true });
    }

    // Fetch collection metadata and active listings in parallel
    const [collectionRes, listingsRes] = await Promise.allSettled([
      fetch(`${IMX_API_BASE}/chains/imtbl-zkevm-mainnet/collections/${NOMSTEAD_COLLECTION}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`${IMX_API_BASE}/chains/imtbl-zkevm-mainnet/collections/${NOMSTEAD_COLLECTION}/listings?page_size=1&status=active`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    let totalNFTs: number | null = null;
    let activeListings: number | null = null;
    let floorPrice: string | null = null;

    // Parse collection data
    if (collectionRes.status === "fulfilled" && collectionRes.value.ok) {
      const data = await collectionRes.value.json();
      // Immutable zkEVM collection response may have different shapes
      // Try common field names for total supply
      totalNFTs = data.total_supply ?? data.total_count ?? null;
    }

    // Parse listings data
    if (listingsRes.status === "fulfilled" && listingsRes.value.ok) {
      const data = await listingsRes.value.json();
      // result array and page info
      if (data.page?.total_count != null) {
        activeListings = data.page.total_count;
      } else if (data.result) {
        activeListings = data.result.length;
      }
      // Floor price from first listing (sorted by price ascending by default)
      if (data.result?.[0]?.amount?.value) {
        const raw = data.result[0].amount.value;
        const decimals = data.result[0].amount.decimals ?? 18;
        floorPrice = (Number(raw) / Math.pow(10, decimals)).toFixed(4);
      }
    }

    const stats: NomsteadStats = {
      totalNFTs,
      activeListings,
      floorPrice,
      lastUpdated: now,
    };

    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json({ success: true, stats, cached: false });
  } catch (error) {
    console.error("Error fetching Nomstead data:", error);

    // Return stale cache if available
    if (cachedStats) {
      return NextResponse.json({ success: true, stats: cachedStats, cached: true, stale: true });
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch Nomstead data", stats: null },
      { status: 500 }
    );
  }
}
