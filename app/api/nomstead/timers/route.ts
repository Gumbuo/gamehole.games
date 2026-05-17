import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KV_KEY = "nomstead:timers";

type TimerEntry = { expiry: number; label: string; note?: string };

export async function GET() {
  const timers = await kv.get<Record<string, TimerEntry>>(KV_KEY) ?? {};
  // Drop timers that expired more than 1 hour ago
  const now = Date.now();
  const cleaned: Record<string, TimerEntry> = {};
  for (const [url, t] of Object.entries(timers)) {
    if (t.expiry > now - 3600000) cleaned[url] = t;
  }
  return NextResponse.json({ timers: cleaned });
}

export async function POST(req: NextRequest) {
  const { url, label, expiry, note } = await req.json();
  if (!url || !label || !expiry) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const timers = await kv.get<Record<string, TimerEntry>>(KV_KEY) ?? {};
  timers[url] = { expiry, label, ...(note ? { note } : {}) };
  await kv.set(KV_KEY, timers);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  const timers = await kv.get<Record<string, TimerEntry>>(KV_KEY) ?? {};
  delete timers[url];
  await kv.set(KV_KEY, timers);
  return NextResponse.json({ ok: true });
}
