import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '../../lib/points';

// Foxstead live player presence — ported from the dead foxstead.xyz Vercel
// function. Short-poll model: clients POST their own position every ~1.2s and
// GET everyone else on the same tile; stale entries are filtered at read time.
// Every POST also refreshes the caller in a global last-seen hash, which backs
// the HUD's "players online" count.
//
// POST { tile_id, wallet, name, x, y, facing }  → { ok: true }
// POST { wallet }  (no tile_id — HUD heartbeat)  → { ok: true }
// POST { action: "leave", tile_id, wallet }      → { ok: true }
// GET  ?tile_id=xxx&wallet=yyy (yyy excluded)    → { players: [...] }
// GET  ?online=1                                 → { online: N }

type PresenceEntry = { wallet: string; name: string; x: number; y: number; facing: string; ts: number };

const STALE_MS = 8000;
const HASH_TTL_SEC = 30;
const GLOBAL_KEY = 'foxstead_presence_global';
const GLOBAL_STALE_MS = 300000; // 5 min — HUD heartbeat fires every 2 min
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const presenceKey = (tileId: string) => `foxstead_presence:${tileId}`;

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const redis = getRedis();
  const now = Date.now();

  if (params.get('online') === '1') {
    try {
      const raw = (await redis.hgetall<Record<string, number>>(GLOBAL_KEY)) ?? {};
      const online = Object.values(raw).filter((ts) => now - Number(ts) <= GLOBAL_STALE_MS).length;
      return NextResponse.json({ online }, { headers: CORS });
    } catch (err) {
      return NextResponse.json({ online: 0, error: String(err) }, { headers: CORS });
    }
  }

  const tileId = params.get('tile_id') || '';
  const wallet = (params.get('wallet') || '').toLowerCase();
  if (!tileId) return NextResponse.json({ error: 'missing tile_id' }, { status: 400, headers: CORS });
  try {
    const raw = (await redis.hgetall<Record<string, PresenceEntry>>(presenceKey(tileId))) ?? {};
    const players = Object.entries(raw)
      .filter(([w, e]) => w !== wallet && e && now - (e.ts || 0) <= STALE_MS)
      .map(([, e]) => e);
    return NextResponse.json({ players }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ players: [], error: String(err) }, { headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const redis = getRedis();

  if (body?.action === 'leave') {
    const wallet = String(body.wallet || '').toLowerCase();
    if (!body.tile_id || !wallet) {
      return NextResponse.json({ error: 'missing tile_id/wallet' }, { status: 400, headers: CORS });
    }
    try {
      await redis.hdel(presenceKey(body.tile_id), wallet);
      return NextResponse.json({ ok: true }, { headers: CORS });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
    }
  }

  const { tile_id, wallet, name, x, y, facing } = body || {};
  if (!wallet) return NextResponse.json({ error: 'missing wallet' }, { status: 400, headers: CORS });
  const addr = String(wallet).toLowerCase();
  try {
    await redis.hset(GLOBAL_KEY, { [addr]: Date.now() });
  } catch {
    // Non-fatal — the online count is a nice-to-have; don't fail the
    // tile-position update below over it.
  }

  // Heartbeat-only call from the HUD (no tile_id).
  if (!tile_id) return NextResponse.json({ ok: true }, { headers: CORS });

  try {
    const key = presenceKey(tile_id);
    const entry: PresenceEntry = {
      wallet: addr,
      name: name || 'Player',
      x: Number(x) || 0,
      y: Number(y) || 0,
      facing: facing || 'south',
      ts: Date.now(),
    };
    await redis.hset(key, { [addr]: entry });
    await redis.expire(key, HASH_TTL_SEC);
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}
