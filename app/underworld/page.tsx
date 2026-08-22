"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import bs58 from "bs58";
import TerritoryMap from "./TerritoryMap";
import type { PlayerSave, OperativeCard, Rarity, TerritoryTileState, Stats, EquippedItems, BountyState, MarketListing, Faction } from "./types";
import {
  THEME,
  DISTRICTS,
  JOBS,
  RACKETS,
  PRODUCT_TIERS,
  ITEMS,
  ROLES,
  RARITIES,
  TRAITS,
  CHARACTER_PORTRAITS,
  RECRUIT_COST,
  effectiveStats,
  levelForXp,
  RANK_LABELS,
  PROMOTIONS,
  meetsPromotionRequirement,
  MAX_TRAINABLE_STAT,
  DAILY_TRAIN_LIMIT,
  trainCost,
  TERRITORY_TILES,
  ItemKind,
  EQUIPMENT_RECIPES,
  FORGE_TIERS,
  RARITY_ORDER,
  craftedItemId,
  STARTER_BENCH_COUNT,
  MAX_BENCH_COUNT,
  BENCH_UNLOCK_COSTS,
  STORE_PACKS,
  type StorePackDef,
  FACTIONS,
  garrisonPower,
  BOUNTY_MIN_CONTRIBUTION,
  BOUNTY_MAX_HUNT_CREW,
  MARKET_MIN_PRICE,
} from "./data";

type Market = Record<string, Record<string, number>>;
type Tab = "roster" | "jobs" | "rackets" | "trade" | "recruit" | "gear" | "workshop" | "store" | "territory" | "bounties" | "market";

const TOTAL_RARITY_WEIGHT = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);

function fmtCash(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtDuration(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

// Matches the roster card's flat Syndicate-style look (dark background,
// thin gold hairline border) — shared by every list-style card (Job,
// Racket, Trade, Gear, Workshop) so the whole app reads as one consistent
// card language instead of mixing this with the ornate PixelLab frame.
function panelStyle(): React.CSSProperties {
  return {
    background: "#0a0808",
    border: `1px solid ${THEME.accent}66`,
    padding: 10,
  };
}

function buttonStyle(disabled?: boolean): React.CSSProperties {
  return {
    // border-image proved unreliable for buttons in this app (clipped bottom
    // edge in real browsers, not just a screenshot artifact — confirmed by
    // user report). Plain background-image stretch is the one technique that
    // rendered correctly in every test, including inside flex rows.
    appearance: "none",
    WebkitAppearance: "none",
    padding: "10px 16px",
    border: "none",
    borderRadius: 4,
    background: "url(/underworld/ui/button-frame-v2.png) center / 100% 100% no-repeat",
    color: disabled ? "#999" : "#fff",
    fontFamily: THEME.font,
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: 0.5,
    // Uniform dimming (not grayscale+darken) keeps the frame's own gold/red
    // detail legible instead of crushing it to a near-invisible outline —
    // that crush was being misread as a rendering/clipping bug.
    opacity: disabled ? 0.5 : 1,
  };
}

export default function UnderworldPage() {
  const { wallet, wallets, select, connect, disconnect, connected, connecting, publicKey, signMessage } = useWallet();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [save, setSave] = useState<PlayerSave | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const [tab, setTab] = useState<Tab>("roster");
  const [district, setDistrict] = useState("southside");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recruited, setRecruited] = useState<OperativeCard | null>(null);
  const [dossierOpId, setDossierOpId] = useState<string | null>(null);
  const [jobPicks, setJobPicks] = useState<Record<string, string[]>>({});
  const [tradeQty, setTradeQty] = useState<Record<string, string>>({});
  const [territoryTiles, setTerritoryTiles] = useState<TerritoryTileState[] | null>(null);
  const [bounties, setBounties] = useState<BountyState[] | null>(null);
  const [listings, setListings] = useState<MarketListing[] | null>(null);

  const now = clock + serverOffset;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 3500);
  };

  const callApi = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      if (!sessionToken) return null;
      setBusy(true);
      try {
        const res = await fetch("/api/underworld", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ action, ...params }),
        });
        const data = await res.json();
        if (!data.success) {
          flash(data.error || "Something went wrong");
          return null;
        }
        setSave(data.save);
        setMarket(data.market);
        setServerOffset(data.now - Date.now());
        return data;
      } catch {
        flash("Network error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [sessionToken]
  );

  // Territory is shared/global state, served from its own endpoint —
  // successful actions also return the caller's updated save (garrisoning
  // etc. changes operative status), so this stays in sync with `save` too.
  const callTerritoryApi = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      if (!sessionToken) return null;
      setBusy(true);
      try {
        const res = await fetch("/api/underworld/territory", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ action, ...params }),
        });
        const data = await res.json();
        if (!data.success) {
          flash(data.error || "Something went wrong");
          return null;
        }
        if (data.tiles) setTerritoryTiles(data.tiles);
        if (data.tile) {
          setTerritoryTiles((prev) => {
            const next = (prev || []).filter((t) => t.id !== data.tile.id);
            next.push(data.tile);
            return next;
          });
        }
        if (data.save) setSave(data.save);
        return data;
      } catch {
        flash("Network error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [sessionToken]
  );

  useEffect(() => {
    if (walletAddress && sessionToken) callTerritoryApi("getTerritory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, sessionToken]);

  useEffect(() => {
    if (!walletAddress || !sessionToken) return;
    const t = setInterval(() => callTerritoryApi("getTerritory"), 20000);
    return () => clearInterval(t);
  }, [walletAddress, sessionToken, callTerritoryApi]);

  // Bounty Board is also shared/global state, same pattern as Territory —
  // its own endpoint, successful actions return the caller's updated save.
  const callBountyApi = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      if (!sessionToken) return null;
      setBusy(true);
      try {
        const res = await fetch("/api/underworld/bounty", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ action, ...params }),
        });
        const data = await res.json();
        if (!data.success) {
          flash(data.error || "Something went wrong");
          return null;
        }
        if (data.bounties) setBounties(data.bounties);
        if (data.bounty) {
          setBounties((prev) => {
            const next = (prev || []).filter((b) => b.targetWallet !== data.bounty.targetWallet);
            next.push(data.bounty);
            return next;
          });
        }
        if (data.save) setSave(data.save);
        return data;
      } catch {
        flash("Network error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [sessionToken]
  );

  useEffect(() => {
    if (walletAddress && sessionToken) callBountyApi("listBounties");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, sessionToken]);

  useEffect(() => {
    if (!walletAddress || !sessionToken) return;
    const t = setInterval(() => callBountyApi("listBounties"), 20000);
    return () => clearInterval(t);
  }, [walletAddress, sessionToken, callBountyApi]);

  // Marketplace is also shared/global state, same pattern as Territory and
  // Bounty — its own endpoint, successful actions return the caller's
  // updated save (listing/buying/cancelling all move operatives around).
  const callMarketApi = useCallback(
    async (action: string, params: Record<string, unknown> = {}) => {
      if (!sessionToken) return null;
      setBusy(true);
      try {
        const res = await fetch("/api/underworld/market", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ action, ...params }),
        });
        const data = await res.json();
        if (!data.success) {
          flash(data.error || "Something went wrong");
          return null;
        }
        if (data.listings) setListings(data.listings);
        if (data.listing) {
          setListings((prev) => [...(prev || []), data.listing]);
        }
        if (data.save) setSave(data.save);
        return data;
      } catch {
        flash("Network error");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [sessionToken]
  );

  useEffect(() => {
    if (walletAddress && sessionToken) callMarketApi("listMarketplace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, sessionToken]);

  useEffect(() => {
    if (!walletAddress || !sessionToken) return;
    const t = setInterval(() => callMarketApi("listMarketplace"), 20000);
    return () => clearInterval(t);
  }, [walletAddress, sessionToken, callMarketApi]);

  // Restore a saved session on load — sign-in only needs to happen once,
  // not on every visit, the token carries the wallet's proven identity.
  useEffect(() => {
    const token = localStorage.getItem("underworld_wallet_token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    fetch("/api/underworld/auth", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSessionToken(token);
          setWalletAddress(data.walletAddress);
        } else {
          localStorage.removeItem("underworld_wallet_token");
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (walletAddress && sessionToken) callApi("getState");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, sessionToken]);

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!walletAddress || !sessionToken) return;
    const t = setInterval(() => callApi("getState"), 20000);
    return () => clearInterval(t);
  }, [walletAddress, sessionToken, callApi]);

  // Reputation is monotonically increasing, so it doubles as this game's
  // leaderboard "score" — the shared /api/scores endpoint already keeps
  // only a player's personal best per game, same as every other game here.
  useEffect(() => {
    if (!walletAddress || !save || save.reputation <= 0) return;
    const highestLevel = save.operatives.reduce((max, o) => Math.max(max, o.level), 0);
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: walletAddress, game: "underworld", score: save.reputation, highestLevel }),
    }).catch(() => {});
  }, [walletAddress, save?.reputation]);

  // Once a wallet is selected, connect immediately — one deliberate click
  // (picking the wallet) rather than two (pick, then connect).
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch((e: unknown) => setAuthError(e instanceof Error ? e.message : "Failed to connect wallet"));
    }
  }, [wallet, connected, connecting, connect]);

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) {
      setAuthError("This wallet doesn't support message signing.");
      return;
    }
    setAuthError(null);
    setSigningIn(true);
    try {
      const address = publicKey.toBase58();
      const challengeRes = await fetch("/api/underworld/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", walletAddress: address }),
      });
      const challengeData = await challengeRes.json();
      if (!challengeData.success) throw new Error(challengeData.error || "Could not start sign-in");

      const signature = await signMessage(new TextEncoder().encode(challengeData.message));

      const verifyRes = await fetch("/api/underworld/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", walletAddress: address, signature: bs58.encode(signature) }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.error || "Signature verification failed");

      localStorage.setItem("underworld_wallet_token", verifyData.token);
      setSessionToken(verifyData.token);
      setWalletAddress(verifyData.walletAddress);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = () => {
    if (sessionToken) {
      fetch("/api/underworld/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout", token: sessionToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("underworld_wallet_token");
    setSessionToken(null);
    setWalletAddress(null);
    setSave(null);
    disconnect().catch(() => {});
  };

  if (authLoading) {
    return <FullScreen>Loading...</FullScreen>;
  }

  if (!walletAddress || !sessionToken) {
    return (
      <FullScreen>
        <div
          style={{
            background: THEME.cardBg,
            border: "24px solid transparent",
            borderImageSource: "url(/underworld/ui/panel-big-v2.png)",
            borderImageSlice: "48",
            borderImageWidth: "24px",
            borderImageRepeat: "stretch",
            padding: 12,
            width: 360,
            maxWidth: "90vw",
          }}
        >
          <h1 style={{ fontFamily: THEME.font, color: THEME.accent, fontSize: 22, marginBottom: 6 }}>
            UNDERWORLD INC.
          </h1>
          <p style={{ color: THEME.textMuted, fontFamily: THEME.bodyFont, fontSize: 12, marginBottom: 18 }}>
            Build a Family. Run the streets. Connect a Solana wallet to get in — that's the only login here.
          </p>
          {!connected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {wallets.map((w) => {
                const installed = w.readyState === WalletReadyState.Installed;
                return (
                  <button
                    key={w.adapter.name}
                    disabled={!installed}
                    onClick={() => select(w.adapter.name)}
                    style={buttonStyle(!installed)}
                  >
                    {installed ? `Connect ${w.adapter.name}` : `${w.adapter.name} not installed`}
                  </button>
                );
              })}
            </div>
          ) : (
            <button disabled={signingIn} onClick={handleSignIn} style={{ ...buttonStyle(signingIn), width: "100%" }}>
              {signingIn
                ? "Check your wallet..."
                : `Sign in as ${publicKey?.toBase58().slice(0, 4)}…${publicKey?.toBase58().slice(-4)}`}
            </button>
          )}
          {authError && <div style={{ color: "#ff6b6b", fontSize: 12, marginTop: 10 }}>{authError}</div>}
          <p style={{ fontSize: 10, color: "#666", marginTop: 14 }}>
            Signing is free — it proves wallet ownership, no transaction is sent and nothing is minted.
          </p>
          <Link href="/" style={{ display: "block", marginTop: 10, color: "#888", fontSize: 11 }}>
            ← Back to Game Hole
          </Link>
        </div>
      </FullScreen>
    );
  }

  if (!save || !market) {
    return <FullScreen>Loading your Family...</FullScreen>;
  }

  const unlockedDistricts = DISTRICTS.filter((d) => save.reputation >= d.repRequired);
  const idleOperatives = save.operatives.filter((o) => o.status === "idle");

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.textMuted, fontFamily: THEME.bodyFont }}>
      <header
        style={{
          background: THEME.headerGradient,
          borderBottom: `2px solid ${THEME.secondary}`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{ color: THEME.accent, fontSize: 12, textDecoration: "none" }}>
            ← Game Hole
          </Link>
          <h1 style={{ fontFamily: THEME.font, color: THEME.accent, fontSize: 20, margin: 0 }}>
            UNDERWORLD INC.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Stat label="Cash" value={fmtCash(save.cash)} color="#4ade80" />
          <Stat label="Rep" value={String(save.reputation)} color="#60a5fa" />
          <Stat label="Heat" value={`${save.heat}/100`} color={save.heat > 60 ? "#ff6b6b" : "#f5d76e"} />
          <span style={{ fontSize: 11, color: "#888" }}>
            {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
          </span>
          <button onClick={handleLogout} style={{ ...buttonStyle(), padding: "6px 10px" }}>
            LOG OUT
          </button>
        </div>
      </header>

      {toast && (
        <div style={{ background: "#3a0f0f", color: "#ffb4b4", padding: "8px 20px", fontSize: 12, textAlign: "center" }}>
          {toast}
        </div>
      )}

      <nav style={{ display: "flex", gap: 6, padding: "12px 20px", flexWrap: "wrap" }}>
        {(["roster", "jobs", "rackets", "trade", "recruit", "gear", "workshop", "store", "territory", "bounties", "market"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px",
              background: tab === t ? THEME.primary : "transparent",
              border: `1px solid ${THEME.secondary}`,
              borderRadius: 8,
              color: tab === t ? "#fff" : THEME.textMuted,
              fontFamily: THEME.font,
              fontSize: 12,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 20px 60px" }}>
        {tab === "roster" && (
          <RosterTab
            save={save}
            now={now}
            busy={busy}
            onCollect={(id) => callApi("collectJob", { operativeId: id })}
            onOpen={(id) => setDossierOpId(id)}
          />
        )}

        {tab === "jobs" && (
          <JobsTab
            save={save}
            now={now}
            district={district}
            setDistrict={setDistrict}
            unlockedDistricts={unlockedDistricts}
            idleOperatives={idleOperatives}
            jobPicks={jobPicks}
            setJobPicks={setJobPicks}
            busy={busy}
            onStart={(operativeIds, jobId) => callApi("startJob", { operativeIds, jobId })}
          />
        )}

        {tab === "rackets" && (
          <RacketsTab
            save={save}
            now={now}
            busy={busy}
            onBuy={(racketId) => callApi("buyRacket", { racketId })}
            onCollect={(racketId) =>
              callApi("collectRacket", { racketId }).then((d) => {
                if (d?.collected) flash(`Collected ${fmtCash(d.collected)}`);
              })
            }
            onUpgrade={(racketId) => callApi("upgradeRacket", { racketId })}
          />
        )}

        {tab === "trade" && (
          <TradeTab
            save={save}
            market={market}
            district={district}
            setDistrict={setDistrict}
            unlockedDistricts={unlockedDistricts}
            tradeQty={tradeQty}
            setTradeQty={setTradeQty}
            busy={busy}
            onTrade={(districtId, tierId, side, qty) =>
              callApi("trade", { districtId, tierId, side, qty })
            }
          />
        )}

        {tab === "recruit" && (
          <RecruitTab
            save={save}
            busy={busy}
            recruited={recruited}
            onRecruit={() =>
              callApi("recruit").then((d) => {
                if (d?.recruited) setRecruited(d.recruited);
              })
            }
          />
        )}

        {tab === "gear" && (
          <GearTab
            save={save}
            busy={busy}
            onEquip={(operativeId, itemId) => callApi("equipItem", { operativeId, itemId })}
            onUnequip={(operativeId, slot) => callApi("unequipItem", { operativeId, slot })}
          />
        )}

        {tab === "workshop" && (
          <WorkshopTab
            save={save}
            now={now}
            busy={busy}
            onStartCraft={(benchId, recipeId, tier) => callApi("startCraft", { benchId, recipeId, tier })}
            onCollectCraft={(benchId) =>
              callApi("collectCraft", { benchId }).then((d) => {
                if (d?.crafted) {
                  const def = ITEMS.find((i) => i.id === d.crafted.itemId);
                  flash(`Crafted ${def?.name || d.crafted.itemId}${d.crafted.upgraded ? " (bonus upgrade!)" : ""}`);
                }
              })
            }
            onUnlockBench={() => callApi("unlockBench")}
          />
        )}

        {tab === "store" && (
          <StoreTab
            save={save}
            busy={busy}
            onBuy={(packId) => callApi("buyPack", { packId }).then((d) => d?.recruited ?? null)}
          />
        )}

        {tab === "territory" && (
          <TerritoryMap
            save={save}
            walletAddress={walletAddress}
            tiles={territoryTiles}
            now={now}
            busy={busy}
            onGarrison={(tileId, operativeIds) => callTerritoryApi("garrison", { tileId, operativeIds })}
            onAttack={(tileId, operativeIds) =>
              callTerritoryApi("attack", { tileId, operativeIds }).then((d) => {
                if (d) flash(d.won ? "Tile taken!" : "Attack failed — crew is injured and needs to recover.");
              })
            }
            onRecall={(tileId) => callTerritoryApi("recall", { tileId })}
            onCollect={(tileId) =>
              callTerritoryApi("collectTerritory", { tileId }).then((d) => {
                if (d?.collected) flash(`Collected ${fmtCash(d.collected)}`);
              })
            }
          />
        )}

        {tab === "bounties" && (
          <BountiesTab
            save={save}
            walletAddress={walletAddress}
            bounties={bounties}
            now={now}
            busy={busy}
            onContribute={(targetWallet, amount) => callBountyApi("contribute", { targetWallet, amount })}
            onHunt={(targetWallet, operativeIds) =>
              callBountyApi("hunt", { targetWallet, operativeIds }).then((d) => {
                if (!d) return;
                if (d.won) {
                  // The server already deleted this bounty — prune it locally
                  // too instead of waiting on the next 20s poll, otherwise it
                  // stays visible (and re-huntable-looking) for a bit.
                  setBounties((prev) => (prev || []).filter((b) => b.targetWallet !== targetWallet));
                }
                flash(d.won ? `Hit confirmed — collected ${fmtCash(d.collected)}` : "Hunt failed — crew is injured and needs to recover.");
              })
            }
          />
        )}

        {tab === "market" && (
          <MarketTab
            save={save}
            walletAddress={walletAddress}
            listings={listings}
            busy={busy}
            onList={(operativeId, price) => callMarketApi("listOperative", { operativeId, price })}
            onBuy={(listingId) =>
              callMarketApi("buyListing", { listingId }).then((d) => {
                if (d) setListings((prev) => (prev || []).filter((l) => l.id !== listingId));
              })
            }
            onCancel={(listingId) =>
              callMarketApi("cancelListing", { listingId }).then((d) => {
                if (d) setListings((prev) => (prev || []).filter((l) => l.id !== listingId));
              })
            }
          />
        )}
      </main>
      {dossierOpId &&
        (() => {
          const op = save.operatives.find((o) => o.id === dossierOpId);
          if (!op) return null;
          return (
            <OperativeDossier
              key={op.id}
              op={op}
              save={save}
              busy={busy}
              now={now}
              onClose={() => setDossierOpId(null)}
              onTrain={(stat) => callApi("trainStat", { operativeId: op.id, stat })}
              onPromote={() => callApi("promote", { operativeId: op.id })}
              onSetNote={(note) => callApi("setFieldNote", { operativeId: op.id, note }).then(() => flash("Note saved"))}
              onEquip={(slot, itemId) => callApi("equipItem", { operativeId: op.id, itemId })}
              onUnequip={(slot) => callApi("unequipItem", { operativeId: op.id, slot })}
            />
          );
        })()}
    </div>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.textMuted,
        fontFamily: THEME.bodyFont,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "rgba(0,0,0,0.4)",
  border: `1px solid ${THEME.secondary}`,
  borderRadius: 6,
  color: "#fff",
  fontFamily: THEME.bodyFont,
  fontSize: 13,
};

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: "6px 12px",
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${THEME.secondary}`,
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      <span style={{ color: "#888", marginRight: 6 }}>{label}</span>
      <span style={{ color, fontWeight: "bold" }}>{value}</span>
    </div>
  );
}

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

const STAT_ROWS: { key: keyof Stats; label: string }[] = [
  { key: "power", label: "PWR" },
  { key: "cunning", label: "CUN" },
  { key: "charm", label: "CHA" },
  { key: "stealth", label: "STL" },
  { key: "nerve", label: "NRV" },
];

const EQUIP_SLOTS: { key: keyof EquippedItems; label: string }[] = [
  { key: "headwear", label: "HEAD" },
  { key: "torso", label: "TORSO" },
  { key: "hands", label: "HANDS" },
  { key: "footwear", label: "FEET" },
];

// Flat dark-card style copied from a reference game's dossier ("Syndicate"):
// thin gold hairline border, rarity tag + corner mark, a rarity-tinted glow
// around the hex portrait (via drop-shadow, which — unlike box-shadow —
// follows the clip-path shape instead of the square bounding box), a solid
// name banner, and a compact equipment-slot row. Clicking the card opens the
// full Dossier modal (training/promotion/equip/field note).
function OperativeCardView({ op, now, onOpen }: { op: OperativeCard; now: number; onOpen?: () => void }) {
  const rarity = RARITIES[op.rarity];
  const stats = effectiveStats(op);
  const remaining = op.jobEndsAt ? op.jobEndsAt - now : 0;
  const portrait = CHARACTER_PORTRAITS[op.name];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        onClick={onOpen}
        style={{
          background: "#0a0808",
          border: `1px solid ${THEME.accent}66`,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          cursor: onOpen ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: 9, color: rarity.color, textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1 }}>
            {rarity.label}
          </span>
          <span style={{ fontSize: 9, color: FACTIONS[op.faction].color, textTransform: "uppercase", fontWeight: "bold", letterSpacing: 0.5 }}>
            {FACTIONS[op.faction].label}
          </span>
        </div>
        <div
          style={{
            width: "58%",
            aspectRatio: "1",
            clipPath: HEX_CLIP,
            filter: `drop-shadow(0 0 5px ${rarity.color})`,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {portrait && (
            <img src={portrait} alt={op.name} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
          )}
        </div>
        <div style={{ width: "100%", background: "#000", padding: "5px 4px" }}>
          <div style={{ fontFamily: THEME.font, fontSize: 13, color: "#fff", fontWeight: "bold", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {op.name}
          </div>
        </div>
        <div style={{ fontSize: 9, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
          {RANK_LABELS[op.rank]} · {ROLES[op.role].label}
          {op.trait ? ` · ${TRAITS[op.trait as keyof typeof TRAITS]?.label}` : ""}
        </div>
        <div style={{ fontSize: 9, color: "#f0d9a8", textAlign: "center", fontFamily: THEME.bodyFont }}>
          {STAT_ROWS.map((s) => `${s.label} ${stats[s.key]}`).join(" · ")}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {EQUIP_SLOTS.map(({ key, label }) => {
            const itemId = op.equipped?.[key];
            const item = itemId ? ITEMS.find((i) => i.id === itemId) : null;
            return (
              <div
                key={key}
                title={item ? item.name : `${label} slot — empty`}
                style={{
                  width: 22,
                  height: 22,
                  border: `1px solid ${THEME.accent}55`,
                  background: "#151010",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: item ? THEME.accent : "#555",
                }}
              >
                {item ? "●" : "+"}
              </div>
            );
          })}
        </div>
      </div>
      {op.status === "idle" && <div style={{ fontSize: 11, color: "#4ade80" }}>Idle</div>}
      {op.status === "injured" && op.injuredUntil && (
        <div style={{ fontSize: 11, color: "#ff6b6b" }}>
          Injured — back in {fmtDuration(op.injuredUntil - now)}
        </div>
      )}
      {op.status === "on_job" && (
        <div style={{ fontSize: 11, color: "#f5d76e" }}>
          {remaining > 0 ? `On a job — ${fmtDuration(remaining)}` : "Job complete — collect on the Jobs tab"}
        </div>
      )}
      {op.status === "garrisoned" && (
        <div style={{ fontSize: 11, color: THEME.accent }}>Garrisoning territory — see the Territory tab</div>
      )}
    </div>
  );
}

const DOSSIER_SECTION_HEADER: React.CSSProperties = {
  fontFamily: THEME.font,
  fontSize: 13,
  color: THEME.accent,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 8,
};

// The "Dossier" detail modal — training ledger (spend cash to permanently
// raise a base stat), promotion ladder, equipment, and a free-text field
// note. Keyed by op.id at the call site so switching operatives always
// remounts this (resets the local note-draft state) instead of carrying
// stale text over from whichever operative was open before.
function OperativeDossier({
  op,
  save,
  busy,
  now,
  onClose,
  onTrain,
  onPromote,
  onSetNote,
  onEquip,
  onUnequip,
}: {
  op: OperativeCard;
  save: PlayerSave;
  busy: boolean;
  now: number;
  onClose: () => void;
  onTrain: (stat: keyof Stats) => void;
  onPromote: () => void;
  onSetNote: (note: string) => void;
  onEquip: (slot: keyof EquippedItems, itemId: string) => void;
  onUnequip: (slot: keyof EquippedItems) => void;
}) {
  const [note, setNote] = useState(op.fieldNote || "");
  const rarity = RARITIES[op.rarity];
  const stats = effectiveStats(op);
  const portrait = CHARACTER_PORTRAITS[op.name];
  const promo = PROMOTIONS[op.rank];
  const eligible = meetsPromotionRequirement(op);
  const dailyLimitHit = op.trainedToday >= DAILY_TRAIN_LIMIT && now <= op.trainedResetAt;
  const tile = op.garrisonTileId ? TERRITORY_TILES.find((t) => t.id === op.garrisonTileId) : null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0a0808",
          border: `1px solid ${THEME.accent}88`,
          padding: 24,
          width: "92vw",
          maxWidth: 900,
          maxHeight: "88vh",
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
        }}
      >
        <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontSize: 11, color: rarity.color, textTransform: "uppercase", fontWeight: "bold", letterSpacing: 1 }}>
              {rarity.label}
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
          <div
            style={{
              width: "70%",
              aspectRatio: "1",
              clipPath: HEX_CLIP,
              filter: `drop-shadow(0 0 8px ${rarity.color})`,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {portrait && (
              <img src={portrait} alt={op.name} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
            )}
          </div>
          <div style={{ width: "100%", background: "#000", padding: "6px 4px" }}>
            <div style={{ fontFamily: THEME.font, fontSize: 16, color: "#fff", fontWeight: "bold", textAlign: "center" }}>{op.name}</div>
          </div>
          <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
            {RANK_LABELS[op.rank]} · {ROLES[op.role].label} · Lv{op.level}
            {op.trait ? ` · ${TRAITS[op.trait as keyof typeof TRAITS]?.label}` : ""}
          </div>
          <div style={{ fontSize: 11, color: FACTIONS[op.faction].color, textAlign: "center" }}>{FACTIONS[op.faction].label}</div>
          {tile && <div style={{ fontSize: 11, color: THEME.accent, textAlign: "center" }}>Garrisoning: {tile.name}</div>}

          <div style={{ width: "100%" }}>
            <div style={DOSSIER_SECTION_HEADER}>Equipment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EQUIP_SLOTS.map(({ key, label }) => {
                const equippedId = op.equipped?.[key];
                const owned = (id: string) => save.items.find((i) => i.itemId === id)?.quantity || 0;
                const options = ITEMS.filter((i) => i.kind === key && (owned(i.id) > 0 || i.id === equippedId));
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 32, fontSize: 10, color: "#999" }}>{label}</span>
                    <select
                      value={equippedId || ""}
                      disabled={busy}
                      onChange={(e) => (e.target.value ? onEquip(key, e.target.value) : onUnequip(key))}
                      style={{ flex: 1, background: "#151010", color: "#fff", border: `1px solid ${THEME.accent}55`, fontSize: 11, padding: "4px 6px" }}
                    >
                      <option value="">None</option>
                      {options.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ width: "100%" }}>
            <div style={DOSSIER_SECTION_HEADER}>Field Note</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Keep it brief, keep it true."
              style={{ width: "100%", background: "#151010", color: "#fff", border: `1px solid ${THEME.accent}55`, fontFamily: THEME.bodyFont, fontSize: 11, padding: 6, resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "#666" }}>{note.length}/200</span>
              <button disabled={busy} onClick={() => onSetNote(note)} style={{ ...buttonStyle(busy), padding: "4px 10px", fontSize: 10 }}>
                SAVE NOTE
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: "2 1 380px" }}>
          <div style={DOSSIER_SECTION_HEADER}>
            Training Ledger <span style={{ color: "#666", fontWeight: "normal", fontSize: 11 }}>({op.trainedToday}/{DAILY_TRAIN_LIMIT} today)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {STAT_ROWS.map((s) => {
              const current = op.stats[s.key];
              const cost = trainCost(current);
              const maxed = current >= MAX_TRAINABLE_STAT;
              const disabled = busy || maxed || dailyLimitHit || save.cash < cost || op.status !== "idle";
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, fontSize: 11, color: THEME.accent }}>{s.label}</span>
                  <div style={{ flex: 1, height: 8, background: "#222", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${Math.min(100, (current / MAX_TRAINABLE_STAT) * 100)}%`, background: THEME.primary }} />
                  </div>
                  <span style={{ width: 44, fontSize: 11, textAlign: "right", color: "#ccc" }}>{current}/{MAX_TRAINABLE_STAT}</span>
                  <button
                    disabled={disabled}
                    onClick={() => onTrain(s.key)}
                    style={{ ...buttonStyle(disabled), padding: "4px 8px", fontSize: 10, whiteSpace: "nowrap" }}
                  >
                    +1 ({fmtCash(cost)})
                  </button>
                </div>
              );
            })}
          </div>
          {op.status !== "idle" && (
            <div style={{ fontSize: 11, color: "#ff9f9f", marginBottom: 20 }}>Operative must be idle to train.</div>
          )}

          <div style={DOSSIER_SECTION_HEADER}>Promotion</div>
          <div style={{ fontSize: 14, marginBottom: 6, color: "#fff" }}>
            {RANK_LABELS[op.rank]}
            {promo.next && <span style={{ color: "#999" }}> → {RANK_LABELS[promo.next]}</span>}
          </div>
          {promo.next ? (
            <>
              <div style={{ fontSize: 12, color: eligible ? "#4ade80" : "#999", marginBottom: 4 }}>
                {eligible ? "✓" : "○"} {promo.requirement}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>Fee: {fmtCash(promo.fee)}</div>
              <button
                disabled={busy || !eligible || save.cash < promo.fee}
                onClick={onPromote}
                style={buttonStyle(busy || !eligible || save.cash < promo.fee)}
              >
                PROMOTE
              </button>
            </>
          ) : (
            <div style={{ fontSize: 12, color: THEME.accent }}>Top rank reached.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RosterTab({
  save,
  now,
  busy,
  onCollect,
  onOpen,
}: {
  save: PlayerSave;
  now: number;
  busy: boolean;
  onCollect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <h2 style={sectionTitle}>Your Crew</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {save.operatives.map((op) => (
          <div key={op.id}>
            <OperativeCardView op={op} now={now} onOpen={() => onOpen(op.id)} />
            {op.status === "on_job" && op.jobEndsAt && op.jobEndsAt <= now && (
              <button
                onClick={() => onCollect(op.id)}
                disabled={busy}
                style={{
                  ...buttonStyle(busy),
                  background: "url(/underworld/ui/claim-button.png) center / 100% 100% no-repeat",
                  width: "100%",
                  marginTop: 6,
                }}
              >
                CLAIM
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function estimateChance(job: (typeof JOBS)[number], crew: OperativeCard[]): number {
  if (crew.length === 0) return job.baseSuccessChance;
  const statBonuses = crew.map((op) => (effectiveStats(op)[job.stat] - job.statReq) * 0.02);
  const bestStatBonus = Math.max(...statBonuses);
  const roleBonus = crew.some((op) => op.role === job.roleBonus) ? 0.1 : 0;
  const crewSynergy = job.crewSize === 2 ? 0.05 : 0;
  const traitDelta = crew.reduce((sum, op) => {
    if (op.trait === "quick_hands") return sum + 0.1;
    if (op.trait === "cautious") return sum - 0.1;
    return sum;
  }, 0);
  return Math.max(0.05, Math.min(0.97, job.baseSuccessChance + bestStatBonus + roleBonus + crewSynergy + traitDelta));
}

function JobsTab({
  save,
  now,
  district,
  setDistrict,
  unlockedDistricts,
  idleOperatives,
  jobPicks,
  setJobPicks,
  busy,
  onStart,
}: {
  save: PlayerSave;
  now: number;
  district: string;
  setDistrict: (d: string) => void;
  unlockedDistricts: typeof DISTRICTS;
  idleOperatives: OperativeCard[];
  jobPicks: Record<string, string[]>;
  setJobPicks: (fn: (p: Record<string, string[]>) => Record<string, string[]>) => void;
  busy: boolean;
  onStart: (operativeIds: string[], jobId: string) => void;
}) {
  const jobs = JOBS.filter((j) => j.districtId === district);
  return (
    <div>
      <h2 style={sectionTitle}>Jobs</h2>
      <DistrictPicker district={district} setDistrict={setDistrict} unlockedDistricts={unlockedDistricts} />
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {jobs.map((job) => {
          const picks = jobPicks[job.id] || [];
          const crew = picks.map((id) => save.operatives.find((o) => o.id === id)).filter(Boolean) as OperativeCard[];
          const chance = estimateChance(job, crew);
          const ready = crew.length === job.crewSize && new Set(picks).size === job.crewSize;

          const setSlot = (slotIdx: number, opId: string) => {
            setJobPicks((p) => {
              const next = [...(p[job.id] || [])];
              next[slotIdx] = opId;
              return { ...p, [job.id]: next.slice(0, job.crewSize) };
            });
          };

          return (
            <div key={job.id} style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 14 }}>
                    {job.name} {job.crewSize === 2 && <span style={{ color: THEME.accent, fontSize: 10 }}>· CREW OF 2</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#999" }}>{job.description}</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: THEME.accent }}>
                    Needs {job.stat.toUpperCase()} {job.statReq}+ · best role: {ROLES[job.roleBonus].label} ·{" "}
                    {fmtDuration(job.durationMs)}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11 }}>
                  <div style={{ color: "#4ade80" }}>{fmtCash(job.cashReward)}</div>
                  <div style={{ color: "#60a5fa" }}>+{job.repReward} rep</div>
                  <div style={{ color: "#ff9f43" }}>+{job.heatGain} heat</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                {Array.from({ length: job.crewSize }).map((_, slotIdx) => (
                  <select
                    key={slotIdx}
                    value={picks[slotIdx] || ""}
                    onChange={(e) => setSlot(slotIdx, e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">{job.crewSize === 2 ? `Crew slot ${slotIdx + 1}...` : "Choose operative..."}</option>
                    {idleOperatives
                      .filter((o) => !picks.includes(o.id) || picks[slotIdx] === o.id)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({ROLES[o.role].label}, Lv{o.level})
                        </option>
                      ))}
                  </select>
                ))}
                {crew.length > 0 && <span style={{ fontSize: 11, color: "#999" }}>Est. {Math.round(chance * 100)}% success</span>}
                <button
                  disabled={!ready || busy}
                  onClick={() => onStart(picks, job.id)}
                  style={buttonStyle(!ready || busy)}
                >
                  SEND
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RacketsTab({
  save,
  now,
  busy,
  onBuy,
  onCollect,
  onUpgrade,
}: {
  save: PlayerSave;
  now: number;
  busy: boolean;
  onBuy: (id: string) => void;
  onCollect: (id: string) => void;
  onUpgrade: (id: string) => void;
}) {
  return (
    <div>
      <h2 style={sectionTitle}>Rackets</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {RACKETS.map((def) => {
          const state = save.rackets.find((r) => r.id === def.id);
          const district = DISTRICTS.find((d) => d.id === def.districtId)!;
          const locked = save.reputation < Math.max(def.repRequired, district.repRequired);
          const rate = state ? def.baseRatePerHour * Math.pow(1.5, state.level - 1) : def.baseRatePerHour;
          const accrued = state
            ? Math.round(rate * Math.min(24, (now - state.lastCollectedAt) / 3_600_000))
            : 0;
          const upgradeCost = state ? Math.round(def.baseCost * Math.pow(2, state.level)) : 0;
          return (
            <div key={def.id} style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 14 }}>
                    {def.name} — {district.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#999" }}>{def.description}</div>
                  <div style={{ fontSize: 11, color: THEME.accent }}>{Math.round(rate)}/hr at Lv{state?.level || 1}</div>
                </div>
                {!state ? (
                  <button
                    disabled={locked || save.cash < def.baseCost || busy}
                    onClick={() => onBuy(def.id)}
                    style={buttonStyle(locked || save.cash < def.baseCost || busy)}
                  >
                    {locked ? `NEEDS ${Math.max(def.repRequired, district.repRequired)} REP` : `BUY — ${fmtCash(def.baseCost)}`}
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#4ade80" }}>+{fmtCash(accrued)} ready</span>
                    <button disabled={busy || accrued <= 0} onClick={() => onCollect(def.id)} style={buttonStyle(busy || accrued <= 0)}>
                      COLLECT
                    </button>
                    <button disabled={busy || save.cash < upgradeCost} onClick={() => onUpgrade(def.id)} style={buttonStyle(busy || save.cash < upgradeCost)}>
                      UPGRADE — {fmtCash(upgradeCost)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DistrictPicker({
  district,
  setDistrict,
  unlockedDistricts,
}: {
  district: string;
  setDistrict: (d: string) => void;
  unlockedDistricts: typeof DISTRICTS;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {DISTRICTS.map((d) => {
        const unlocked = unlockedDistricts.some((u) => u.id === d.id);
        return (
          <button
            key={d.id}
            disabled={!unlocked}
            onClick={() => unlocked && setDistrict(d.id)}
            title={unlocked ? d.description : `Needs ${d.repRequired} reputation`}
            style={{
              padding: "8px 14px",
              background: district === d.id ? THEME.primary : "transparent",
              border: `1px solid ${THEME.secondary}`,
              borderRadius: 8,
              color: unlocked ? "#fff" : "#555",
              fontFamily: THEME.font,
              fontSize: 11,
              cursor: unlocked ? "pointer" : "not-allowed",
            }}
          >
            {d.name} {!unlocked && `🔒 ${d.repRequired}`}
          </button>
        );
      })}
    </div>
  );
}

function TradeTab({
  save,
  market,
  district,
  setDistrict,
  unlockedDistricts,
  tradeQty,
  setTradeQty,
  busy,
  onTrade,
}: {
  save: PlayerSave;
  market: Market;
  district: string;
  setDistrict: (d: string) => void;
  unlockedDistricts: typeof DISTRICTS;
  tradeQty: Record<string, string>;
  setTradeQty: (fn: (p: Record<string, string>) => Record<string, string>) => void;
  busy: boolean;
  onTrade: (districtId: string, tierId: string, side: "buy" | "sell", qty: number) => void;
}) {
  return (
    <div>
      <h2 style={sectionTitle}>Product Trafficking</h2>
      <DistrictPicker district={district} setDistrict={setDistrict} unlockedDistricts={unlockedDistricts} />
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {PRODUCT_TIERS.map((tier) => {
          const price = market[district]?.[tier.id] ?? 0;
          const held = save.product[tier.id] || 0;
          const qtyStr = tradeQty[tier.id] || "1";
          const qty = Math.max(1, parseInt(qtyStr) || 1);
          const buyCost = price * qty;
          const sellRevenue = price * qty;
          return (
            <div key={tier.id} style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {tier.image && (
                    <img
                      src={tier.image}
                      alt={tier.name}
                      style={{ width: 36, height: 36, imageRendering: "pixelated", flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 14 }}>{tier.name}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>Held: {held}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, color: THEME.accent, fontFamily: THEME.font }}>${price}/unit</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="number"
                  min={1}
                  value={qtyStr}
                  onChange={(e) => setTradeQty((p) => ({ ...p, [tier.id]: e.target.value }))}
                  style={{ ...inputStyle, width: 70 }}
                />
                <button
                  disabled={busy || save.cash < buyCost}
                  onClick={() => onTrade(district, tier.id, "buy", qty)}
                  style={buttonStyle(busy || save.cash < buyCost)}
                >
                  BUY — {fmtCash(buyCost)}
                </button>
                <button
                  disabled={busy || held < qty}
                  onClick={() => onTrade(district, tier.id, "sell", qty)}
                  style={buttonStyle(busy || held < qty)}
                >
                  SELL — {fmtCash(sellRevenue)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecruitTab({
  save,
  busy,
  recruited,
  onRecruit,
}: {
  save: PlayerSave;
  busy: boolean;
  recruited: OperativeCard | null;
  onRecruit: () => void;
}) {
  return (
    <div>
      <h2 style={sectionTitle}>Recruit</h2>
      <div style={panelStyle()}>
        <p style={{ fontSize: 12, color: "#999" }}>
          Every recruit costs {fmtCash(RECRUIT_COST)}. Rarity is rolled the moment you recruit — no way to
          influence it, odds shown below.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
          {(Object.entries(RARITIES) as [Rarity, (typeof RARITIES)[Rarity]][]).map(([id, r]) => (
            <span key={id} style={{ fontSize: 11, color: r.color }}>
              {r.label}: {((r.weight / TOTAL_RARITY_WEIGHT) * 100).toFixed(1)}%
            </span>
          ))}
        </div>
        <button
          disabled={busy || save.cash < RECRUIT_COST}
          onClick={onRecruit}
          style={buttonStyle(busy || save.cash < RECRUIT_COST)}
        >
          RECRUIT — {fmtCash(RECRUIT_COST)}
        </button>
      </div>
      {recruited && (
        <div style={{ marginTop: 16, maxWidth: 240 }}>
          <div style={{ fontSize: 12, color: THEME.accent, marginBottom: 6 }}>New recruit:</div>
          <OperativeCardView op={recruited} now={Date.now()} />
        </div>
      )}
    </div>
  );
}

// A reference game sells these "packs" for real money; per the user's call
// this Store stays cash-only — same tiered-odds/bonus-currency idea, no
// payment processor, consistent with items being earned rather than sold.
const PACK_ANIMATION_STYLE = `
@keyframes packShake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15% { transform: translateX(-8px) rotate(-4deg); }
  30% { transform: translateX(8px) rotate(4deg); }
  45% { transform: translateX(-6px) rotate(-3deg); }
  60% { transform: translateX(6px) rotate(3deg); }
  75% { transform: translateX(-3px) rotate(-1deg); }
  90% { transform: translateX(3px) rotate(1deg); }
}
@keyframes packFlash {
  0% { opacity: 0; transform: scale(0.4); }
  40% { opacity: 1; transform: scale(1.4); }
  100% { opacity: 0; transform: scale(2.2); }
}
@keyframes cardRevealPop {
  0% { opacity: 0; transform: scale(0.3) rotateY(90deg); }
  60% { opacity: 1; transform: scale(1.08) rotateY(0deg); }
  100% { opacity: 1; transform: scale(1) rotateY(0deg); }
}
@keyframes glowPulse {
  0% { opacity: 0; transform: scale(0.6); }
  50% { opacity: 0.9; }
  100% { opacity: 0.5; transform: scale(1.15); }
}
`;

type PackOpenState = { pack: StorePackDef; phase: "opening" | "revealed"; card: OperativeCard | null };

// Shake the pack art, flash, then pop the revealed card in with a rarity-
// tinted glow behind it. Purely CSS keyframes (defined once via
// PACK_ANIMATION_STYLE) — no new art needed beyond the pack image itself.
function PackOpenOverlay({ state, onDone }: { state: PackOpenState; onDone: () => void }) {
  const rarity = state.card ? RARITIES[state.card.rarity] : null;
  return (
    <div
      onClick={state.phase === "revealed" ? onDone : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        cursor: state.phase === "revealed" ? "pointer" : "default",
      }}
    >
      <style>{PACK_ANIMATION_STYLE}</style>
      {state.phase === "opening" && (
        <img
          src={state.pack.image}
          alt={state.pack.name}
          style={{ width: 140, imageRendering: "pixelated", animation: "packShake 1.1s ease-in-out" }}
        />
      )}
      {state.phase === "revealed" && state.card && rarity && (
        <div style={{ position: "relative", width: 240 }}>
          <div
            style={{
              position: "absolute",
              inset: -50,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${rarity.color}66, transparent 70%)`,
              animation: "glowPulse 1s ease-out forwards",
            }}
          />
          <div style={{ position: "relative", animation: "cardRevealPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <OperativeCardView op={state.card} now={Date.now()} />
          </div>
          <div style={{ textAlign: "center", marginTop: 14, color: "#999", fontSize: 11 }}>Tap to continue</div>
        </div>
      )}
    </div>
  );
}

function StoreTab({
  save,
  busy,
  onBuy,
}: {
  save: PlayerSave;
  busy: boolean;
  onBuy: (packId: string) => Promise<OperativeCard | null>;
}) {
  const [openState, setOpenState] = useState<PackOpenState | null>(null);

  const handleBuy = async (pack: StorePackDef) => {
    setOpenState({ pack, phase: "opening", card: null });
    const [card] = await Promise.all([onBuy(pack.id), new Promise((r) => setTimeout(r, 1100))]);
    setOpenState({ pack, phase: "revealed", card });
  };

  return (
    <div>
      <h2 style={sectionTitle}>Store</h2>
      <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
        Cash-only packs — each rolls a new operative at that pack's odds, plus any bonus resources listed.
      </p>
      {(Object.keys(FACTIONS) as Faction[]).map((faction) => (
        <div key={faction} style={{ marginBottom: 24 }}>
          <h3 style={{ ...sectionTitle, fontSize: 15, color: FACTIONS[faction].color, marginBottom: 4 }}>{FACTIONS[faction].label}</h3>
          <p style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>{FACTIONS[faction].description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {STORE_PACKS.filter((pack) => pack.faction === faction).map((pack) => (
              <div key={pack.id} style={panelStyle()}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <img src={pack.image} alt={pack.name} style={{ width: 56, imageRendering: "pixelated", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 14 }}>{pack.name}</div>
                    <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>{pack.description}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {(Object.entries(pack.rarityWeights) as [Rarity, number][]).map(([tier, weight]) => {
                    const total = Object.values(pack.rarityWeights).reduce((s, w) => s + (w || 0), 0);
                    return (
                      <span key={tier} style={{ fontSize: 10, color: RARITIES[tier].color }}>
                        {RARITIES[tier].label}: {((weight / total) * 100).toFixed(0)}%
                      </span>
                    );
                  })}
                </div>
                {(pack.bonusScrap > 0 || pack.bonusBullion > 0) && (
                  <div style={{ fontSize: 10, color: THEME.accent, marginBottom: 8 }}>
                    Bonus: {pack.bonusScrap > 0 && `${pack.bonusScrap} Scrap`}
                    {pack.bonusScrap > 0 && pack.bonusBullion > 0 && " · "}
                    {pack.bonusBullion > 0 && `${pack.bonusBullion} Bullion`}
                  </div>
                )}
                <button
                  disabled={busy || save.cash < pack.cost || !!openState}
                  onClick={() => handleBuy(pack)}
                  style={{ ...buttonStyle(busy || save.cash < pack.cost || !!openState), width: "100%" }}
                >
                  BUY — {fmtCash(pack.cost)}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {openState && <PackOpenOverlay state={openState} onDone={() => setOpenState(null)} />}
    </div>
  );
}

function fmtExpiry(ms: number): string {
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Bounty Board — place cash on a rival wallet, anyone can top up the pool,
// anyone can hunt it. The target's top operatives (by Power) auto-defend;
// they don't opt in, so there's no garrison-style setup step like Territory.
function BountiesTab({
  save,
  walletAddress,
  bounties,
  now,
  busy,
  onContribute,
  onHunt,
}: {
  save: PlayerSave;
  walletAddress: string | null;
  bounties: BountyState[] | null;
  now: number;
  busy: boolean;
  onContribute: (targetWallet: string, amount: number) => void;
  onHunt: (targetWallet: string, operativeIds: string[]) => void;
}) {
  const [placeWallet, setPlaceWallet] = useState("");
  const [placeAmount, setPlaceAmount] = useState("500");
  const [huntingWallet, setHuntingWallet] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const list = bounties || [];
  const totalPool = list.reduce((s, b) => s + b.pool, 0);
  const biggest = list.reduce((max, b) => Math.max(max, b.pool), 0);
  const onYou = list.find((b) => b.targetWallet === walletAddress);

  const idleOperatives = save.operatives.filter((o) => o.status === "idle");
  const pickedPower = garrisonPower(save.operatives.filter((o) => picked.includes(o.id)));

  const togglePick = (id: string) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < BOUNTY_MAX_HUNT_CREW ? [...prev, id] : prev));
  };

  return (
    <div>
      <h2 style={sectionTitle}>Bounties</h2>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ ...panelStyle(), minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>Open</div>
          <div style={{ fontSize: 18, color: "#fff" }}>{list.length}</div>
        </div>
        <div style={{ ...panelStyle(), minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>Total Pool</div>
          <div style={{ fontSize: 18, color: THEME.accent }}>{fmtCash(totalPool)}</div>
        </div>
        <div style={{ ...panelStyle(), minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>Biggest</div>
          <div style={{ fontSize: 18, color: THEME.accent }}>{fmtCash(biggest)}</div>
        </div>
        <div style={{ ...panelStyle(), minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase" }}>Bounty On You</div>
          <div style={{ fontSize: 18, color: onYou ? "#ff6b6b" : "#4ade80" }}>{onYou ? fmtCash(onYou.pool) : "$0"}</div>
        </div>
      </div>

      <div style={{ ...panelStyle(), marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: THEME.accent, marginBottom: 8, textTransform: "uppercase" }}>Place a Bounty</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={placeWallet}
            onChange={(e) => setPlaceWallet(e.target.value.trim())}
            placeholder="Target wallet address"
            style={{ ...inputStyle, flex: "1 1 260px" }}
          />
          <input
            value={placeAmount}
            onChange={(e) => setPlaceAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Amount"
            style={{ ...inputStyle, width: 110 }}
          />
          <button
            disabled={
              busy ||
              !placeWallet ||
              placeWallet === walletAddress ||
              Number(placeAmount) < BOUNTY_MIN_CONTRIBUTION ||
              save.cash < Number(placeAmount)
            }
            onClick={() => {
              onContribute(placeWallet, Number(placeAmount));
              setPlaceWallet("");
            }}
            style={buttonStyle(
              busy || !placeWallet || placeWallet === walletAddress || Number(placeAmount) < BOUNTY_MIN_CONTRIBUTION || save.cash < Number(placeAmount)
            )}
          >
            PLACE
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>Minimum {fmtCash(BOUNTY_MIN_CONTRIBUTION)}. Can't target yourself.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 && <p style={{ fontSize: 12, color: "#666" }}>No open bounties.</p>}
        {list
          .slice()
          .sort((a, b) => b.pool - a.pool)
          .map((b) => (
            <div key={b.targetWallet} style={panelStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 14 }}>
                    {b.targetWallet.slice(0, 4)}…{b.targetWallet.slice(-4)}
                    {b.targetWallet === walletAddress && <span style={{ color: "#ff6b6b", fontSize: 11 }}> (you)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#999" }}>
                    {b.contributorCount} contrib{b.contributorCount === 1 ? "" : "s"} · Exp {fmtExpiry(b.expiresAt - now)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, color: THEME.accent }}>{fmtCash(b.pool)}</div>
                  <div style={{ fontSize: 10, color: "#999" }}>pool</div>
                </div>
              </div>
              {b.targetWallet !== walletAddress && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    disabled={busy || save.cash < BOUNTY_MIN_CONTRIBUTION}
                    onClick={() => onContribute(b.targetWallet, BOUNTY_MIN_CONTRIBUTION)}
                    style={buttonStyle(busy || save.cash < BOUNTY_MIN_CONTRIBUTION)}
                  >
                    CONTRIBUTE {fmtCash(BOUNTY_MIN_CONTRIBUTION)}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => {
                      setHuntingWallet(huntingWallet === b.targetWallet ? null : b.targetWallet);
                      setPicked([]);
                    }}
                    style={buttonStyle(busy)}
                  >
                    {huntingWallet === b.targetWallet ? "CANCEL" : "HUNT"}
                  </button>
                </div>
              )}
              {huntingWallet === b.targetWallet && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${THEME.accent}33`, paddingTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>Pick up to {BOUNTY_MAX_HUNT_CREW} operatives to hunt with:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                    {idleOperatives.length === 0 && <span style={{ fontSize: 12, color: "#666" }}>No idle operatives available.</span>}
                    {idleOperatives.map((op) => {
                      const rarity = RARITIES[op.rarity];
                      const checked = picked.includes(op.id);
                      return (
                        <label key={op.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, cursor: "pointer" }}>
                          <input type="checkbox" checked={checked} onChange={() => togglePick(op.id)} />
                          <span style={{ color: rarity.color }}>{op.name}</span>
                          <span style={{ color: "#888" }}>
                            {ROLES[op.role].label} · PWR {effectiveStats(op).power}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {picked.length > 0 && (
                    <div style={{ fontSize: 12, color: THEME.accent, margin: "8px 0" }}>Combined power: ~{Math.round(pickedPower)}</div>
                  )}
                  <button
                    disabled={busy || picked.length === 0}
                    onClick={() => {
                      onHunt(b.targetWallet, picked);
                      setHuntingWallet(null);
                      setPicked([]);
                    }}
                    style={buttonStyle(busy || picked.length === 0)}
                  >
                    CONFIRM HUNT
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// Player-to-player Marketplace — operatives only (per the user's call: gear
// stays crafted-only). Listing removes the operative from the seller's own
// roster (see the market route) so it can't be used/trained/equipped while
// for sale, and a sale transfers it WITH its trained stats/rank/field note
// intact — the seller sets the price, buyer pays in Cash, never real money.
function MarketTab({
  save,
  walletAddress,
  listings,
  busy,
  onList,
  onBuy,
  onCancel,
}: {
  save: PlayerSave;
  walletAddress: string | null;
  listings: MarketListing[] | null;
  busy: boolean;
  onList: (operativeId: string, price: number) => void;
  onBuy: (listingId: string) => void;
  onCancel: (listingId: string) => void;
}) {
  const [selectedOpId, setSelectedOpId] = useState("");
  const [price, setPrice] = useState("500");

  const list = listings || [];
  const mine = list.filter((l) => l.sellerWallet === walletAddress);
  const others = list.filter((l) => l.sellerWallet !== walletAddress);
  const idleOperatives = save.operatives.filter((o) => o.status === "idle");

  return (
    <div>
      <h2 style={sectionTitle}>Marketplace</h2>
      <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
        List an operative for other players to buy — Cash only, never real money. It leaves your roster the moment it's listed.
      </p>

      <div style={{ ...panelStyle(), marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: THEME.accent, marginBottom: 8, textTransform: "uppercase" }}>List an Operative</div>
        {save.operatives.length <= 1 ? (
          <p style={{ fontSize: 12, color: "#666" }}>You need at least one other operative before you can sell one.</p>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={selectedOpId} onChange={(e) => setSelectedOpId(e.target.value)} style={{ ...inputStyle, flex: "1 1 220px" }}>
              <option value="">Choose an idle operative...</option>
              {idleOperatives.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} — {RARITIES[op.rarity].label} {ROLES[op.role].label} Lv{op.level}
                </option>
              ))}
            </select>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Price"
              style={{ ...inputStyle, width: 110 }}
            />
            <button
              disabled={busy || !selectedOpId || Number(price) < MARKET_MIN_PRICE}
              onClick={() => {
                onList(selectedOpId, Number(price));
                setSelectedOpId("");
              }}
              style={buttonStyle(busy || !selectedOpId || Number(price) < MARKET_MIN_PRICE)}
            >
              LIST — {fmtCash(Number(price) || 0)}
            </button>
          </div>
        )}
        <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>Minimum {fmtCash(MARKET_MIN_PRICE)}.</div>
      </div>

      {mine.length > 0 && (
        <>
          <h3 style={{ ...sectionTitle, fontSize: 14 }}>Your Listings</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            {mine.map((l) => (
              <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <OperativeCardView op={l.operative} now={Date.now()} />
                <div style={{ fontSize: 13, color: THEME.accent, textAlign: "center" }}>{fmtCash(l.price)}</div>
                <button disabled={busy} onClick={() => onCancel(l.id)} style={buttonStyle(busy)}>
                  CANCEL LISTING
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ ...sectionTitle, fontSize: 14 }}>For Sale</h3>
      {others.length === 0 ? (
        <p style={{ fontSize: 12, color: "#666" }}>No listings from other players right now.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {others.map((l) => (
            <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <OperativeCardView op={l.operative} now={Date.now()} />
              <div style={{ fontSize: 11, color: "#999", textAlign: "center" }}>
                Seller: {l.sellerWallet.slice(0, 4)}…{l.sellerWallet.slice(-4)}
              </div>
              <button
                disabled={busy || save.cash < l.price}
                onClick={() => onBuy(l.id)}
                style={buttonStyle(busy || save.cash < l.price)}
              >
                BUY — {fmtCash(l.price)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Gear is crafted-only now (see WorkshopTab) — this tab is purely for
// assigning owned gear to the crew, plus a running inventory list.
function GearTab({
  save,
  busy,
  onEquip,
  onUnequip,
}: {
  save: PlayerSave;
  busy: boolean;
  onEquip: (operativeId: string, itemId: string) => void;
  onUnequip: (operativeId: string, slot: string) => void;
}) {
  const owned = (itemId: string) => save.items.find((i) => i.itemId === itemId)?.quantity || 0;
  const inventory = save.items.filter((i) => i.quantity > 0);

  return (
    <div>
      <h2 style={sectionTitle}>Gear</h2>
      <p style={{ fontSize: 12, color: "#999" }}>
        Gear is crafted on the Workshop tab, then assigned here. Owned but unequipped pieces sit in your inventory below.
      </p>

      <h3 style={{ ...sectionTitle, fontSize: 14, marginTop: 18 }}>Inventory</h3>
      {inventory.length === 0 ? (
        <p style={{ fontSize: 12, color: "#666" }}>Nothing crafted yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {inventory.map((stack) => {
            const def = ITEMS.find((i) => i.id === stack.itemId);
            if (!def) return null;
            return (
              <div key={stack.itemId} style={{ ...panelStyle(), padding: "6px 10px", fontSize: 11 }}>
                <span style={{ color: RARITIES[def.tier].color }}>{def.name}</span> × {stack.quantity}
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ ...sectionTitle, marginTop: 24 }}>Equip Crew</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {save.operatives.map((op) => (
          <div key={op.id} style={panelStyle()}>
            <div style={{ fontFamily: THEME.font, color: "#fff", fontSize: 13, marginBottom: 8 }}>
              {op.name} <span style={{ color: "#999", fontSize: 11 }}>({ROLES[op.role].label})</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {EQUIP_SLOTS.map(({ key: slot, label }) => {
                const equippedId = op.equipped?.[slot];
                const availableItems = ITEMS.filter((i) => i.kind === slot && (owned(i.id) > 0 || i.id === equippedId));
                return (
                  <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>{label}</label>
                    <select
                      value={equippedId || ""}
                      disabled={busy}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) onUnequip(op.id, slot);
                        else onEquip(op.id, val);
                      }}
                      style={inputStyle}
                    >
                      <option value="">None</option>
                      {availableItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<ItemKind, string> = { headwear: "Headwear", torso: "Torso", hands: "Hands", footwear: "Footwear" };

function fmtBenchTime(ms: number): string {
  const hours = ms / 3_600_000;
  if (hours >= 1) return `${hours % 1 === 0 ? hours : hours.toFixed(1)}h`;
  return `${Math.round(ms / 60_000)}m`;
}

// The crafting "Workshop": pick a category, pick a recipe, then a rarity
// tier to forge it at. Each craft ties up one bench for real time (like a
// Job) rather than resolving instantly. Higher tiers consume copies of the
// tier below (same recipe) plus Scrap/Bullion — a reference game's "forge
// chain," adapted onto our own Rarity ladder (common..legendary) instead of
// inventing a separate tier system just for gear.
function WorkshopTab({
  save,
  now,
  busy,
  onStartCraft,
  onCollectCraft,
  onUnlockBench,
}: {
  save: PlayerSave;
  now: number;
  busy: boolean;
  onStartCraft: (benchId: string, recipeId: string, tier: Rarity) => void;
  onCollectCraft: (benchId: string) => void;
  onUnlockBench: () => void;
}) {
  const [category, setCategory] = useState<ItemKind>("headwear");
  const [recipeId, setRecipeId] = useState<string>(EQUIPMENT_RECIPES.find((r) => r.kind === "headwear")!.id);
  const owned = (itemId: string) => save.items.find((i) => i.itemId === itemId)?.quantity || 0;

  const categoryRecipes = EQUIPMENT_RECIPES.filter((r) => r.kind === category);
  const recipe = EQUIPMENT_RECIPES.find((r) => r.id === recipeId) || categoryRecipes[0];

  const idleBench = save.craftingBenches.find((b) => !b.job);
  const nextBenchCost =
    save.craftingBenches.length < MAX_BENCH_COUNT ? BENCH_UNLOCK_COSTS[save.craftingBenches.length - STARTER_BENCH_COUNT] : null;

  return (
    <div>
      <h2 style={sectionTitle}>Workshop</h2>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
        Scrap: <span style={{ color: THEME.accent }}>{save.scrap}</span> · Bullion:{" "}
        <span style={{ color: THEME.accent }}>{save.bullion}</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {save.craftingBenches.map((bench, i) => {
          const job = bench.job;
          const def = job ? EQUIPMENT_RECIPES.find((r) => r.id === job.recipeId) : null;
          const done = !!job && now >= job.endsAt;
          return (
            <div key={bench.id} style={{ ...panelStyle(), minWidth: 180 }}>
              <div style={{ fontSize: 11, color: THEME.accent, marginBottom: 4 }}>Bench {i + 1}</div>
              {job && def ? (
                <>
                  <div style={{ fontSize: 12, color: "#fff" }}>
                    {RARITIES[job.tier].label} {def.name}
                  </div>
                  <div style={{ fontSize: 11, color: done ? "#4ade80" : "#999", margin: "4px 0" }}>
                    {done ? "Ready" : fmtDuration(job.endsAt - now)}
                  </div>
                  <button disabled={!done || busy} onClick={() => onCollectCraft(bench.id)} style={buttonStyle(!done || busy)}>
                    COLLECT
                  </button>
                </>
              ) : (
                <div style={{ fontSize: 11, color: "#666" }}>Empty bench</div>
              )}
            </div>
          );
        })}
        {nextBenchCost != null && (
          <div
            style={{
              ...panelStyle(),
              minWidth: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 11, color: "#999" }}>Unlock bench {save.craftingBenches.length + 1}</div>
            <button
              disabled={busy || save.cash < nextBenchCost}
              onClick={onUnlockBench}
              style={buttonStyle(busy || save.cash < nextBenchCost)}
            >
              {fmtCash(nextBenchCost)}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ minWidth: 140 }}>
          {(["headwear", "torso", "hands", "footwear"] as ItemKind[]).map((k) => (
            <div
              key={k}
              onClick={() => {
                setCategory(k);
                const first = EQUIPMENT_RECIPES.find((r) => r.kind === k);
                if (first) setRecipeId(first.id);
              }}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                background: category === k ? "rgba(212,175,55,0.12)" : "transparent",
                color: category === k ? THEME.accent : "#999",
                fontSize: 12,
                textTransform: "uppercase",
                borderLeft: category === k ? `2px solid ${THEME.accent}` : "2px solid transparent",
              }}
            >
              {CATEGORY_LABELS[k]}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start", flex: "1 1 260px" }}>
          {categoryRecipes.map((r) => (
            <div
              key={r.id}
              onClick={() => setRecipeId(r.id)}
              style={{
                ...panelStyle(),
                cursor: "pointer",
                minWidth: 120,
                borderColor: r.id === recipeId ? THEME.accent : undefined,
              }}
            >
              <div style={{ fontSize: 12, color: "#fff" }}>{r.name}</div>
              <div style={{ fontSize: 10, color: "#999" }}>{r.description}</div>
            </div>
          ))}
        </div>

        {recipe && (
          <div style={{ flex: "2 1 340px" }}>
            <h3 style={{ ...sectionTitle, fontSize: 15 }}>{recipe.name}</h3>
            <p style={{ fontSize: 11, color: "#999" }}>{recipe.description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {RARITY_ORDER.map((tier) => {
                const ft = FORGE_TIERS[tier];
                const prereqOwned = ft.prereqTier ? owned(craftedItemId(recipe.id, ft.prereqTier)) : 0;
                const prereqOk = !ft.prereqTier || prereqOwned >= ft.prereqQty;
                const affordable = save.cash >= ft.cashCost && save.scrap >= ft.scrapCost && save.bullion >= ft.bullionCost;
                const canCraft = prereqOk && affordable && !!idleBench;
                return (
                  <div key={tier} style={panelStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: RARITIES[tier].color, fontWeight: "bold", fontSize: 12 }}>{RARITIES[tier].label}</span>
                      <span style={{ fontSize: 10, color: "#999" }}>{fmtBenchTime(ft.benchMs)} bench time</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#ccc", margin: "4px 0" }}>
                      {fmtCash(ft.cashCost)}
                      {ft.scrapCost > 0 && ` · ${ft.scrapCost} Scrap`}
                      {ft.bullionCost > 0 && ` · ${ft.bullionCost} Bullion`}
                      {ft.prereqTier && (
                        <>
                          {" "}
                          · needs {ft.prereqQty}× {RARITIES[ft.prereqTier].label} {recipe.name} (
                          <span style={{ color: prereqOk ? "#4ade80" : "#ff6b6b" }}>
                            {prereqOwned}/{ft.prereqQty} owned
                          </span>
                          )
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: THEME.accent, marginBottom: 6 }}>
                      +{ft.statBonus} {recipe.stat.toUpperCase()}
                      {ft.bonusUpgradeChance > 0 && ` · ${Math.round(ft.bonusUpgradeChance * 100)}% chance to bonus-upgrade a tier`}
                    </div>
                    <button
                      disabled={busy || !canCraft}
                      onClick={() => idleBench && onStartCraft(idleBench.id, recipe.id, tier)}
                      style={buttonStyle(busy || !canCraft)}
                    >
                      {idleBench ? "CREATE" : "NO FREE BENCH"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: THEME.font,
  color: THEME.accent,
  fontSize: 18,
  marginBottom: 12,
};
