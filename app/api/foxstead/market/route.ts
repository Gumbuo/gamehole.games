import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '../../lib/points';

// Foxstead marketplace — ported from the dead foxstead.xyz Vercel function.
// GET                                     → { listings: [...] }
// POST { action: "list",   listing: {...} } → upsert listing by id
// POST { action: "remove", id: "..." }      → delete listing by id

type Listing = { id: string; [k: string]: unknown };

const KV_KEY = 'foxstead_market_listings';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function readListings(): Promise<Listing[]> {
  const listings = await getRedis().get<Listing[]>(KV_KEY);
  return Array.isArray(listings) ? listings : [];
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET() {
  try {
    return NextResponse.json({ listings: await readListings() }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ listings: [], error: String(err) }, { headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body?.action || '';
  try {
    if (action === 'list') {
      const listing = body.listing;
      if (!listing?.id) {
        return NextResponse.json({ error: 'missing listing or listing.id' }, { status: 400, headers: CORS });
      }
      const listings = await readListings();
      const idx = listings.findIndex((l) => l.id === listing.id);
      if (idx >= 0) listings[idx] = listing; else listings.push(listing);
      await getRedis().set(KV_KEY, listings);
      return NextResponse.json({ ok: true, count: listings.length }, { headers: CORS });
    }

    if (action === 'remove') {
      if (!body.id) return NextResponse.json({ error: 'missing id' }, { status: 400, headers: CORS });
      const filtered = (await readListings()).filter((l) => l.id !== body.id);
      await getRedis().set(KV_KEY, filtered);
      return NextResponse.json({ ok: true, count: filtered.length }, { headers: CORS });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ error: 'unknown action: ' + action }, { status: 400, headers: CORS });
}
