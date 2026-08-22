import { NextRequest, NextResponse } from "next/server";
import type { MarketListing } from "../../../underworld/types";
import { getRedis, resolveSessionWallet } from "../../../underworld/session";
import { loadSave, writeSave, sweep } from "../../../underworld/save";
import { MARKET_MIN_PRICE } from "../../../underworld/data";

// Marketplace is shared/global state, same family as Territory and Bounty:
// any signed-in player's request can read the board, and buying writes to
// BOTH the buyer's and the seller's own PlayerSave in one request. Unlike
// Territory (fixed tile set) or Bounty (keyed by target wallet), listings
// are arbitrary and short-lived, so — same pattern as Bounty — a Redis SET
// tracks which listing ids are currently active so the board can be
// enumerated without scanning.

const LISTING_KEY = (id: string) => `underworld:market:${id}`;
const ACTIVE_SET_KEY = "underworld:market:active";

async function loadListing(id: string): Promise<MarketListing | null> {
  return (await getRedis().get<MarketListing>(LISTING_KEY(id))) || null;
}

async function writeListing(listing: MarketListing) {
  await getRedis().set(LISTING_KEY(listing.id), listing);
  await getRedis().sadd(ACTIVE_SET_KEY, listing.id);
}

async function clearListing(id: string) {
  await getRedis().del(LISTING_KEY(id));
  await getRedis().srem(ACTIVE_SET_KEY, id);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveSessionWallet(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
    }
    const body = await request.json();
    const { action } = body;
    const now = Date.now();

    if (action === "listMarketplace") {
      const ids = await getRedis().smembers(ACTIVE_SET_KEY);
      const listings = ids.length ? await getRedis().mget<(MarketListing | null)[]>(...ids.map(LISTING_KEY)) : [];
      const live = listings.filter((l): l is MarketListing => !!l);
      return NextResponse.json({ success: true, listings: live });
    }

    if (action === "listOperative") {
      const { operativeId } = body;
      const price = Math.floor(Number(body.price));
      if (!price || price < MARKET_MIN_PRICE) {
        return NextResponse.json({ success: false, error: `Minimum price is $${MARKET_MIN_PRICE}` }, { status: 400 });
      }
      const save = await loadSave(userId, now);
      sweep(save, now);
      const op = save.operatives.find((o) => o.id === operativeId);
      if (!op) {
        return NextResponse.json({ success: false, error: "Unknown operative" }, { status: 400 });
      }
      if (op.status !== "idle") {
        return NextResponse.json({ success: false, error: "Operative must be idle to list" }, { status: 400 });
      }
      if (save.operatives.length <= 1) {
        return NextResponse.json({ success: false, error: "Can't list your last operative" }, { status: 400 });
      }
      save.operatives = save.operatives.filter((o) => o.id !== operativeId);
      await writeSave(userId, save, now);

      const listing: MarketListing = { id: crypto.randomUUID(), sellerWallet: userId, operative: op, price, listedAt: now };
      await writeListing(listing);
      return NextResponse.json({ success: true, listing, save });
    }

    if (action === "buyListing") {
      const { listingId } = body;
      const listing = await loadListing(listingId);
      if (!listing) {
        return NextResponse.json({ success: false, error: "Listing no longer available" }, { status: 400 });
      }
      if (listing.sellerWallet === userId) {
        return NextResponse.json({ success: false, error: "You can't buy your own listing" }, { status: 400 });
      }
      const buyerSave = await loadSave(userId, now);
      sweep(buyerSave, now);
      if (buyerSave.cash < listing.price) {
        return NextResponse.json({ success: false, error: "Not enough cash" }, { status: 400 });
      }
      buyerSave.cash -= listing.price;
      buyerSave.operatives.push(listing.operative);
      await writeSave(userId, buyerSave, now);

      const sellerSave = await loadSave(listing.sellerWallet, now);
      sweep(sellerSave, now);
      sellerSave.cash += listing.price;
      await writeSave(listing.sellerWallet, sellerSave, now);

      await clearListing(listing.id);
      return NextResponse.json({ success: true, save: buyerSave });
    }

    if (action === "cancelListing") {
      const { listingId } = body;
      const listing = await loadListing(listingId);
      if (!listing) {
        return NextResponse.json({ success: false, error: "Listing no longer available" }, { status: 400 });
      }
      if (listing.sellerWallet !== userId) {
        return NextResponse.json({ success: false, error: "Not your listing" }, { status: 400 });
      }
      const save = await loadSave(userId, now);
      sweep(save, now);
      save.operatives.push(listing.operative);
      await writeSave(userId, save, now);
      await clearListing(listing.id);
      return NextResponse.json({ success: true, save });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Underworld market API error:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
