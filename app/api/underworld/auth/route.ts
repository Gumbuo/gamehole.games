import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { getRedis, NONCE_KEY, SESSION_KEY, NONCE_TTL_SECONDS, SESSION_TTL_SECONDS } from "../../../underworld/session";

// Wallet-signature login, scoped to Underworld only — separate from the
// site-wide username/password /api/auth used by every other game here.
// Nothing on-chain: signMessage is free, off-chain, no gas, no transaction.

function buildMessage(walletAddress: string, nonce: string): string {
  return `Sign in to Underworld Inc.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nThis signature is free and does not send a transaction.`;
}

function isValidBase58PublicKey(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 32 || value.length > 44) return false;
  try {
    return bs58.decode(value).length === 32;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const redis = getRedis();

    if (action === "challenge") {
      const { walletAddress } = body;
      if (!isValidBase58PublicKey(walletAddress)) {
        return NextResponse.json({ success: false, error: "Invalid wallet address" }, { status: 400 });
      }
      const nonce = bs58.encode(nacl.randomBytes(16));
      await redis.set(NONCE_KEY(walletAddress), nonce, { ex: NONCE_TTL_SECONDS });
      return NextResponse.json({ success: true, message: buildMessage(walletAddress, nonce) });
    }

    if (action === "verify") {
      const { walletAddress, signature } = body;
      if (!isValidBase58PublicKey(walletAddress) || typeof signature !== "string") {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
      }
      const nonce = await redis.get<string>(NONCE_KEY(walletAddress));
      if (!nonce) {
        return NextResponse.json({ success: false, error: "Challenge expired — try connecting again" }, { status: 400 });
      }

      const message = buildMessage(walletAddress, nonce);
      let verified = false;
      try {
        verified = nacl.sign.detached.verify(
          new TextEncoder().encode(message),
          bs58.decode(signature),
          bs58.decode(walletAddress)
        );
      } catch {
        verified = false;
      }

      if (!verified) {
        return NextResponse.json({ success: false, error: "Signature verification failed" }, { status: 401 });
      }

      await redis.del(NONCE_KEY(walletAddress));
      const token = bs58.encode(nacl.randomBytes(32));
      await redis.set(SESSION_KEY(token), walletAddress, { ex: SESSION_TTL_SECONDS });

      return NextResponse.json({ success: true, token, walletAddress });
    }

    if (action === "logout") {
      const { token } = body;
      if (typeof token === "string") await redis.del(SESSION_KEY(token));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Underworld auth error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
  }
  const walletAddress = await getRedis().get<string>(SESSION_KEY(token));
  if (!walletAddress) {
    return NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 });
  }
  return NextResponse.json({ success: true, walletAddress });
}
