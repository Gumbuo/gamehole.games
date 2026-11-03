import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '../../lib/points';

// Foxstead XP leaderboard — ported from the dead foxstead.xyz Vercel function.
// POST { wallet, name, level, xp } → { ok: true }
// GET                              → { leaderboard: [{wallet,name,level,xp,rank}, ...] }

type XpEntry = { wallet: string; name: string; level: number; xp: number };

const XP_KEY = 'foxstead_xp';
const MAX_ENTRIES = 100;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET() {
  try {
    const raw = (await getRedis().hgetall<Record<string, XpEntry>>(XP_KEY)) ?? {};
    const entries = Object.values(raw).filter((e) => e && typeof e === 'object');
    entries.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const leaderboard = entries.slice(0, MAX_ENTRIES).map((e, i) => ({
      wallet: e.wallet, name: e.name, level: e.level, xp: e.xp, rank: i + 1,
    }));
    return NextResponse.json({ leaderboard }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ leaderboard: [], error: String(err) }, { headers: CORS });
  }
}

export async function POST(request: NextRequest) {
  const { wallet, name, level, xp } = await request.json().catch(() => ({}));
  if (!wallet) return NextResponse.json({ error: 'missing wallet' }, { status: 400, headers: CORS });
  const addr = String(wallet).toLowerCase();
  try {
    const entry: XpEntry = {
      wallet: addr,
      name: name || 'Player',
      level: Number(level) || 1,
      xp: Number(xp) || 0,
    };
    await getRedis().hset(XP_KEY, { [addr]: entry });
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500, headers: CORS });
  }
}
