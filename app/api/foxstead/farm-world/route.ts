import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '../../lib/points';

// Foxstead world tiles — ported from the dead foxstead.xyz Vercel function.
// GET          → { tiles: [...] }
// GET ?ping=1  → { ok }
// POST tile    → upsert by id → { ok, count }
// POST { action: "remove", id } → delete tile → { ok, count }

type Tile = { id: string; [k: string]: unknown };

const KV_KEY = 'foxstead_world_tiles';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function readTiles(): Promise<Tile[]> {
  const tiles = await getRedis().get<Tile[]>(KV_KEY);
  return Array.isArray(tiles) ? tiles : [];
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('ping') === '1') {
    return NextResponse.json({ ok: true }, { headers: CORS });
  }
  try {
    return NextResponse.json({ tiles: await readTiles() }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ tiles: [], error: String(err) }, { headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  try {
    if (body?.action === 'remove') {
      if (!body.id) return NextResponse.json({ error: 'missing id' }, { status: 400, headers: CORS });
      const filtered = (await readTiles()).filter((t) => t.id !== body.id);
      await getRedis().set(KV_KEY, filtered);
      return NextResponse.json({ ok: true, count: filtered.length }, { headers: CORS });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'missing tile id' }, { status: 400, headers: CORS });
    }
    const tiles = await readTiles();
    const idx = tiles.findIndex((t) => t.id === body.id);
    if (idx >= 0) tiles[idx] = body; else tiles.push(body);
    await getRedis().set(KV_KEY, tiles);
    return NextResponse.json({ ok: true, count: tiles.length }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}
