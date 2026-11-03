import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../../lib/points";
import { randomUUID } from "crypto";

const MAIL_KEY_PREFIX = "farm:mail:inbox:";

interface MailItem {
  item_id: string;
  count: number;
}

interface MailMessage {
  id: string;
  from: string;
  to: string;
  items: MailItem[];
  note: string;
  sent_at: number;
  collected: boolean;
}

function inboxKey(wallet: string): string {
  return `${MAIL_KEY_PREFIX}${wallet.toLowerCase()}`;
}

// GET /api/foxstead/farm-mail?wallet=0x...
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ success: false, error: "Missing wallet" }, { status: 400 });
  }
  try {
    const redis = getRedis();
    const messages: MailMessage[] = (await redis.get<MailMessage[]>(inboxKey(wallet))) ?? [];
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("farm-mail GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch mail" }, { status: 500 });
  }
}

// POST /api/foxstead/farm-mail — send mail
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, items, note } = body;

    if (!from || !to) {
      return NextResponse.json({ success: false, error: "Missing from/to" }, { status: 400 });
    }

    const fromAddr = String(from).toLowerCase();
    const toAddr = String(to).toLowerCase();

    if (fromAddr === toAddr) {
      return NextResponse.json({ success: false, error: "Cannot send mail to yourself" }, { status: 400 });
    }

    const mailItems: MailItem[] = Array.isArray(items)
      ? items.map((it: { item_id: string; count: number }) => ({
          item_id: String(it.item_id ?? ""),
          count: Math.max(1, Number(it.count) || 1),
        }))
      : [];

    const message: MailMessage = {
      id: randomUUID(),
      from: fromAddr,
      to: toAddr,
      items: mailItems,
      note: typeof note === "string" ? note.slice(0, 200) : "",
      sent_at: Date.now(),
      collected: false,
    };

    const redis = getRedis();
    const inbox: MailMessage[] = (await redis.get<MailMessage[]>(inboxKey(toAddr))) ?? [];
    inbox.unshift(message);
    if (inbox.length > 100) inbox.splice(100);
    await redis.set(inboxKey(toAddr), inbox);

    return NextResponse.json({ success: true, message_id: message.id });
  } catch (error) {
    console.error("farm-mail POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to send mail" }, { status: 500 });
  }
}

// PATCH /api/foxstead/farm-mail — collect mail items
export async function PATCH(request: NextRequest) {
  try {
    const { wallet, mail_id } = await request.json();

    if (!wallet || !mail_id) {
      return NextResponse.json({ success: false, error: "Missing wallet or mail_id" }, { status: 400 });
    }

    const redis = getRedis();
    const inbox: MailMessage[] = (await redis.get<MailMessage[]>(inboxKey(wallet))) ?? [];

    const msg = inbox.find((m) => m.id === mail_id);
    if (!msg) {
      return NextResponse.json({ success: false, error: "Mail not found" }, { status: 404 });
    }
    if (msg.collected) {
      return NextResponse.json({ success: false, error: "Already collected" }, { status: 400 });
    }

    msg.collected = true;
    await redis.set(inboxKey(wallet), inbox);

    return NextResponse.json({ success: true, items: msg.items });
  } catch (error) {
    console.error("farm-mail PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to collect mail" }, { status: 500 });
  }
}
