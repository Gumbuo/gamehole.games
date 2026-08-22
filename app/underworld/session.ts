import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

// Shared wallet-session helpers for Underworld's API routes. Not a route
// file itself — Next.js route handlers may only export HTTP method
// functions, so this lives outside app/api and is imported by both
// app/api/underworld/auth/route.ts and app/api/underworld/route.ts.

export const NONCE_KEY = (wallet: string) => `underworld:nonce:${wallet}`;
export const SESSION_KEY = (token: string) => `underworld:session:${token}`;
export const NONCE_TTL_SECONDS = 5 * 60;
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

let _redis: Redis | null = null;
export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}

// Resolves the caller's wallet address from a Bearer session token, or null
// if missing/invalid/expired. Used by every gameplay action to replace the
// old (spoofable) "trust a client-supplied userId string" pattern.
export async function resolveSessionWallet(request: NextRequest): Promise<string | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const walletAddress = await getRedis().get<string>(SESSION_KEY(token));
  return walletAddress || null;
}
