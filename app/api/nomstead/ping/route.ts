import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhook = process.env.NOMSTEAD_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const { label, tileUrl, note } = await req.json();
  if (!label || !tileUrl) {
    return NextResponse.json({ error: "Missing label or tileUrl" }, { status: 400 });
  }

  const msg = `⏱ **Timer ready!** ${label}${note ? " — " + note : ""}\n<${tileUrl}>`;

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: msg }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Discord ping failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
