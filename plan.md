# Underworld Inc. — Game Design Plan (working title)

Card-driven crime syndicate management game for gamehole.games. Built the way
1990s mafia games (classic Mafia Wars) and trafficking sims (Dope Wars) play —
recruit a crew, run jobs, buy low and sell high across turf, watch it all grind
passively while you're away — but presented as a collectible card game: every
crew member is a card with a portrait, rarity color, stat block, and traits.

## 1. Theme

**1990s American organized crime.** You run a Family out of a city, building a
crew of collectible "Operative" cards (enforcers, wheelmen, fixers, runners),
sending them on Jobs across city districts, and turning a profit two ways:
Rackets (passive-income business fronts) and Product trafficking (buy low in
one district, sell high in another — classic Dope Wars-style commodity
trading, real drug names for flavor, generic buy/sell numbers for mechanics —
see below).

Retro mob-movie flavor (Goodfellas/Casino era) over straight sci-fi — still
rendered in Game Hole's existing neon/Orbitron UI language, just with mob flavor
text and a noir-ish accent color instead of cyberpunk. "Operative" cards read
naturally as a card-rarity system (street thug → made member → boss) the way
MTG creature rarity does.

Product tiers use real-world drug names as flavor (Weed, Cocaine, Heroin,
Meth, Ecstasy, LSD, etc.) — same precedent as *Dope Wars* (which used exactly
this naming: Acid, Cocaine, Hashish, Heroin, Ludes, Speed, Weed...), a
commercially shipped, repeatedly re-released commodity-trading game. It's
still just a numbers-go-up trading minigame with generic buy/sell prices — no
real-world quantities, sourcing, or synthesis detail, same as that precedent.

Product and Items are designed as **real NFTs from day one** — earned only
through gameplay, never sold by the game, minted to the player's own wallet
when they claim them. See §3.9 for the earn-then-claim architecture and §10
for the contract design.

## 2. Core loop

1. **Collect** — recruit Operative cards via a recruitment pool (gacha-style,
   paid with in-game Cash or a premium currency later).
2. **Assign** — send Operatives on Jobs (timed missions) that consume time and
   pay out Cash, XP, and reputation. Jobs run in real time, including while
   offline (idle progression).
3. **Grow** — train Operatives (stat XP), unlock traits, level up Rackets
   (passive income buildings) with Cash, run Product between districts for a
   trafficking profit margin.
4. **Return** — come back, collect idle earnings, start new Jobs, check
   Product prices, spend Cash on recruitment or upgrades. Classic idle-game
   re-engagement loop.
5. **Progress** — Reputation/Heat unlocks new districts, tougher/better-paying
   Jobs, higher Product tiers, and rarer recruitment pools.

## 3. Systems

### 3.1 Operative Cards
Each Operative is the core "card" unit:
- **Rarity**: Common / Uncommon / Rare / Epic / Legendary — drives recruitment
  odds, base stats, and card frame color.
- **Role**: Muscle (enforcer), Driver (wheelman), Fixer (bribes/legal cover),
  Runner (Product trafficking), Consigliere (advisor — Heat reduction /
  recruitment bonus) — determines which Job types and which side of the
  economy (Jobs vs. Product runs) they're good at (bonus multipliers, not hard
  gates).
- **Stats**: Power, Cunning, Charm (or similar 3-stat spread) — Jobs check
  against one or a weighted mix.
- **Traits**: small modifiers (e.g. "Night Owl: +10% payout on night Jobs",
  "Loyal: never defects when Heat is high") — 1-2 per card, unlocked or rolled
  at recruitment.
- **Level**: XP from completed Jobs raises stats within the card's rarity band.
- **Status**: Idle / On a Job (with countdown) / Injured-Cooldown (risk/reward
  on high-Heat Jobs) / Burned (rare permanent loss — long-term risk stakes).

### 3.2 Jobs (missions)
- Listed per district, each with: duration, stat requirement, payout (Cash +
  Reputation + XP), and a success-chance band based on assigned Operative(s)
  vs. requirement.
- Longer/harder Jobs support multi-Operative crews (2-3 cards), rewarding team
  composition instead of just picking your single best card.
- Failure isn't just "no reward" — introduce Heat gain or Injured-Cooldown to
  give Jobs real stakes without being punishing enough to stall progression.

### 3.3 Rackets (idle income)
- Ownable business fronts (a chop shop, a fence, a data-laundering front) that
  generate passive Cash on a timer independent of Operative assignment.
- Upgradeable with Cash; higher tiers unlock at Reputation milestones.
- This is what makes offline time feel rewarding without requiring Operatives
  to be "working" 24/7 — separates the idle-income loop from the
  card-management loop.

### 3.4 Reputation & Heat
- **Reputation**: long-term progression currency; gates new districts, rarer
  recruitment pools, and Racket tiers.
- **Heat**: short-term risk meter that rises from risky Jobs; high Heat raises
  Injured/Burned odds and can trigger a "raid" event that threatens a Racket's
  income until it cools down. Gives the idle loop a reason to actively manage
  rather than just numbers-go-up.

### 3.5 Recruitment (collection)
- Cash-cost recruitment pool with rarity-weighted pulls (transparent odds
  shown, no loot-box ambiguity given the Web3/crypto-adjacent audience).
- Duplicate pulls of an owned Operative convert to a "shard" currency used for
  guaranteed upgrades — standard gacha soft-pity pattern, keeps duplicates from
  feeling wasted.

### 3.6 Marketplace / trading — stretch, not MVP
- Player-to-player Operative trading/listing. Same shape as the NomStead NFT
  marketplace links already on the site, but off-chain to start. Flag as a
  clear Phase 3 item, not something to design into the MVP data model as a
  hard requirement — but keep card ownership modeled per-player (see §5) so it
  isn't a rewrite if this ships later.

### 3.7 Product trafficking (Dope Wars-style)
- Each district has its own Product market: real-world drug names as product
  types (Weed, Cocaine, Heroin, Meth, Ecstasy, LSD — see §1), each with a
  price that fluctuates per district on a timer/random walk — buy in a cheap
  district, physically "run" it (via a Runner-role Operative, taking transit
  time) to a district where it sells high.
- Risk is the counterweight to profit: running Product raises Heat, and a
  district's Heat level can trigger a "bust" event that seizes a portion of
  in-transit Product — mirrors the Job risk/reward pattern in §3.2 but for the
  trading loop instead of the mission loop.
- This is the second income lever alongside Rackets (§3.3): Rackets are
  passive/slow, Product trafficking is active/faster but riskier — gives the
  player a real choice about playstyle rather than one dominant strategy.
- Every Product unit a player ends up holding is ultimately claimable as a
  real on-chain token — see §3.9. Buying/selling on the district market itself
  stays off-chain and instant (this is the fast-twitch trading loop); claiming
  converts a held balance into an actual owned token.

### 3.8 Items & gear
- Non-card inventory: weapons, tools, and consumables that boost an
  Operative's stats on a Job or Product run, or reduce Heat gain.
- Same NFT treatment as Product (§3.9): earned only through gameplay
  (Job/Racket/Product-run rewards), never sold by the game, claimable to the
  player's wallet as a real on-chain token.

### 3.9 Earn-then-claim NFT architecture
Core principle: **fast off-chain gameplay, real on-chain ownership on demand.**
Every Job, Racket collection, and Product sale still resolves instantly against
KV-stored balances — no wallet, no gas, no signature required just to play.
A connected wallet is only needed for the claim step.

- **Active inventory (off-chain)**: Product and Item balances the player is
  actively using/trading in the district market and equipping on Operatives.
  Tracked as plain KV counters (see §5), same as Cash/Reputation — instant,
  free, no chain interaction. This is what keeps moment-to-moment play fast.
- **Claim**: at any time, the player can claim some or all of their held
  Product/Item balance. This calls a backend endpoint that:
  1. Validates the player's off-chain balance is sufficient and decrements it.
  2. Sends a Solana transaction composing one `mintTo` instruction per claimed
     token type (each Product/Item type is its own SPL Token mint — see §8),
     signed by the backend's mint-authority keypair, minting straight to the
     player's connected wallet address. Multiple token types in one claim
     batch into a single atomic transaction where possible. The game pays the
     transaction fee (Solana fees are a fraction of a cent) — the player never
     pays to receive what they earned.
- **Claimed tokens are real, held tokens** in the player's own wallet from
  that point on — visible in any wallet/explorer, tradeable, listable
  wherever the player chooses (subject to third-party marketplace content
  policies per the drug-naming note in §1/§8).
- **Using a claimed (on-chain) item back in gameplay**: since gameplay itself
  runs off-chain for speed, a claimed token needs to come back into the
  off-chain active inventory to be used again — a "deposit" step that's the
  mirror of claim: the player calls the SPL Token `burn` instruction on their
  held token account (self-service, no backend signature needed for the
  player's half), the backend verifies the burn on-chain and credits the
  equivalent off-chain balance back. This keeps every gameplay action itself
  fee-free while still making claimed ownership real and round-trippable
  rather than one-way.
- Net effect: claiming is genuinely optional and non-blocking — a player with
  no wallet connected can play the entire game on off-chain balances; a
  player who wants provable, tradeable ownership of what they've earned
  claims it whenever they want.

## 4. Progression & economy

- **Cash**: primary soft currency — Job payouts, Racket income; spent on
  recruitment and upgrades.
- **Reputation**: long-term unlock currency, non-spendable, only accrues.
- **Shards**: per-Operative duplicate currency for guaranteed upgrades.
- **Product**: quantity-tracked inventory per tier, bought/sold at district
  market prices — this is a trading resource, not a spendable currency, but
  behaves economically like one.
- No premium/real-money currency in MVP. If added later, keep it strictly for
  time-skips and cosmetic card frames — never pay-to-win stat power, given the
  crypto-savvy audience will notice and dislike pay-to-win instantly.

## 5. Data model (sketch)

```ts
interface OperativeCard {
  id: string;              // unique instance id
  templateId: string;      // references base card definition (art, base stats)
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  role: "muscle" | "driver" | "fixer" | "runner" | "consigliere";
  name: string;
  level: number;
  xp: number;
  stats: { power: number; cunning: number; charm: number };
  traits: string[];        // trait ids
  status: "idle" | "on_job" | "trafficking" | "injured" | "burned";
  jobEndsAt?: number;       // epoch ms, if on_job or trafficking
}

// itemId / productId map to a Solana SPL Token mint address once claimed — see §3.9/§8.
interface ItemStack {
  itemId: string;
  quantity: number;
}

interface PlayerSave {
  userId: string;
  walletAddress: string | null;     // Solana base58 address; set once connected, required to claim
  cash: number;
  reputation: number;
  heat: number;
  shards: Record<string, number>;   // templateId -> shard count
  operatives: OperativeCard[];
  items: ItemStack[];               // off-chain "active inventory" balance
  product: Record<string, number>;  // productTierId -> off-chain quantity held
  rackets: { id: string; level: number; lastCollectedAt: number }[];
  unlockedDistricts: string[];
  createdAt: number;
  updatedAt: number;
}
```

Note: on-chain claimed balances are *not* duplicated in this save file — once
claimed, the source of truth for that token is the chain itself (read via
`getParsedTokenAccountsByOwner` against the player's wallet and the known
mint addresses). Conceptually the same idea as `app/api/balance` in the
sibling gumbuo-site repo (read live on-chain state rather than caching it),
but a fresh implementation — that route is EVM/Base-specific and doesn't
apply here. `PlayerSave` only needs to track the off-chain, not-yet-claimed
portion.

This fits the existing `/api/game-storage` contract as-is (`userId` + `file` +
JSON blob) — no new backend storage system needed, just
`file: "underworld_save"`.

## 6. Tech plan (fits current gamehole-games repo conventions)

- **Route**: `app/underworld/page.tsx` (client component), following the
  `nomstead`/`capnco` pattern — single-page app-in-a-page, not a separate repo.
- **Auth**: reuse existing `/api/auth` username/password + session token flow
  already used by other games — no new auth system.
- **Save data**: reuse `/api/game-storage` (`GET`/`POST`/`PATCH`) with
  `file: "underworld_save"`, matching the `PlayerSave` shape above. `PATCH`'s
  deep-merge is convenient for Job-completion ticks that only touch one field.
- **Job timers**: compute client-side from `jobEndsAt` timestamps (no server
  cron needed) — same idle-game pattern as offline-progress calculations done
  entirely on load by diffing `now - lastCollectedAt`.
- **New API routes** (if template/balance logic shouldn't live client-side):
  `app/api/underworld/route.ts` for card template definitions, recruitment-roll
  resolution, Job resolution, and Product market price ticks. Recruitment
  rolls and Product prices in particular should be server-resolved, not
  client-computed, to avoid trivial cheating via devtools (fake a "buy at 5,
  sell at 500" price locally otherwise).
- **Claim API**: `app/api/underworld/claim/route.ts` — validates the caller's
  session + off-chain balance, decrements it, then builds and sends a Solana
  transaction (`@solana/web3.js` + `@solana/spl-token`'s `mintTo`) signed by a
  backend-held mint-authority `Keypair` (secret key in env, never exposed to
  the client) — same "server signs, client never touches the key" shape as
  any mint-on-demand flow, just Solana's version of it. A mirrored
  `deposit`/reclaim endpoint verifies an on-chain `burn` before crediting the
  off-chain balance back (§3.9).
- **Wallet connect**: this is genuinely new infrastructure, not a reuse of
  anything currently in either repo. The EVM wallet stack already present in
  gamehole-games' dependencies (RainbowKit, Coinbase Wallet SDK, ThirdWeb,
  WalletConnect) is inactive/not being pursued — confirmed leftover from an
  earlier direction, not live code to build on. For Solana, add
  `@solana/wallet-adapter-react` + `@solana/wallet-adapter-react-ui` +
  adapters for Phantom/Solflare/Backpack. Only needed for the claim UI, not
  for core gameplay — a player with no wallet connected can play the whole
  game on off-chain balances (§3.9).
- **RPC**: needs a Solana RPC endpoint for both the backend (sending mint/burn
  verification calls) and the frontend (wallet-adapter connection) — a public
  mainnet-beta endpoint is fine to start, a provider like Helius or QuickNode
  if/when volume needs it. New env var, e.g. `SOLANA_RPC_URL`.
- **Styling**: match existing Game Hole visual language — Orbitron headers,
  Share Tech Mono body, dark background, neon accent (existing games use cyan
  `#00d4ff` / orange `#ff6b00`; suggest a third accent — a deep red or gold —
  so Underworld reads as a mob/noir title within the hub rather than reusing
  Discover's exact sci-fi palette).

## 7. Art pipeline (PixelLab)

Everything in this game — Operative cards and every Product/Item — is a
single static illustration, not a moving/rig-based sprite. No animation, no
directional views, no character rig at all: this is a deliberate scope call
(cards, not an overworld with walking sprites), and it changes which PixelLab
tool is the right one — the `create_character` pipeline (directional/
animation-ready rigs) doesn't apply here; this is the exception to the
project's usual "new characters use `create_character` mode `v3`" convention
(that convention is for games with actual on-screen movement, like
[[project_currency_of_war]]/[[project_farm_game]] — not this one).

- **Both Operative portraits and Product/Item icons**: `create_image_pixflux`
  — purpose-built for exactly this ("item icons... card art... props," no
  rig), one generation per image, no_background=true for anything that sits
  on a card frame or becomes NFT metadata (§8).
- Optional quality tier: `create_image_pro` for higher-value art (Epic/
  Legendary Operatives, or a hero/marketing image) — costs 20-40 generations
  per call vs. 1 for pixflux, worth reserving for the art that matters most
  rather than using everywhere given the number of templates this game needs
  (every Operative rarity/role combo, every Product tier, every Item type).
- Rarity is expressed via a **card frame/border treatment applied in the UI**
  (CSS gradient border by rarity tier), not baked into the generated art —
  keeps the asset count down to one portrait per template regardless of
  rarity, and rarity color coding stays consistent/reskinnable.
- Racket/district background art: simple flat illustrations via
  `create_image_pixflux` (no_background=false for these, since they're scenes
  not sprites), lower priority than card art for MVP — placeholder gradients
  are fine at first.
- Product/item icon art doubles as the NFT metadata `image` field (§8):
  generated once per token type and reused across every mint of that type —
  icons don't need to vary per instance the way Operative portraits arguably
  could.

## 8. Token design (Solana — SPL Token + Metaplex)

Switched from an EVM/ERC1155 design to Solana, specifically because of
documented policy risk: Coinbase (which operates Base) has an explicit
Prohibited & Conditional Use Policy naming "narcotics, controlled substances,
and drug paraphernalia," and Coinbase Wallet was the planned primary wallet
for the claim flow. That's a named, specific reason to avoid Base for
real-drug-named collectibles — Solana's dominant wallets/marketplaces
(Phantom, Magic Eden) don't carry that same documented restriction, though
none of this is a guarantee against any platform's discretion. Also: the EVM
wallet-connect stack already sitting in this repo's dependencies
(RainbowKit/Coinbase SDK/ThirdWeb) is confirmed inactive/not being pursued,
so this isn't displacing live infrastructure — it's a clean start either way.

- **Chain**: Solana mainnet-beta for production, devnet for development/testing.
- **Standard**: no custom program needs to be deployed at all. Each Product
  and Item type is its own **SPL Token mint** (decimals `0`, since these are
  countable whole units) — Solana's native token model already gives you
  "many independent token types, each separately mint-authority-gated,"
  which maps to this game's needs more directly than deploying a custom
  Solidity-style contract would have. Metadata (name/image/symbol) is
  attached per mint via the **Metaplex Token Metadata program**, categorized
  as a Metaplex "Fungible Asset" (Solana's term for a stackable, quantity-held
  token with rich metadata — the closest native equivalent to an ERC1155
  token id).
- **Mint authority**: a single backend-held keypair holds mint authority on
  every Product/Item mint. Nobody else can call `mintTo` on these mints —
  structurally, there is no path to a public or paid mint, since the SPL Token
  program itself refuses the instruction without that authority's signature.
  This gets "no primary sale, anywhere" for free from the token program's own
  rules, without needing custom program logic to enforce it.
- **Freeze authority**: set to `None` (renounced) on each mint at creation —
  keeps these fully out of anyone's ability to freeze later, consistent with
  wanting these to be real, uncomplicated ownership once claimed.
- **Burn**: the SPL Token `burn` instruction is owner-callable by design — the
  player can always burn their own held tokens for the deposit/reclaim flow
  (§3.9) without needing the backend to grant any special permission or be
  online.
- **Metadata hosting**: token `name` uses the real-world product/item name
  (per §1); `image` from the PixelLab icon set (§7). Store the metadata JSON
  on Arweave (the standard choice in the Solana/Metaplex ecosystem — permanent,
  content-addressed, what most Solana NFT tooling like Metaplex/Irys already
  expects) rather than IPFS.
- **Transferability**: freely transferable by default — real SPL tokens with
  no restriction, matching what "real NFT/token" implies. Worth knowing going
  in: OpenSea (which does index Solana now) still applies its own broad,
  discretionary content-removal policy regardless of chain, so choosing
  Solana over Base reduces but doesn't eliminate third-party delisting risk.
  If that residual risk is unacceptable, the fallback is the same as before —
  ship non-transferable at mint and revisit once your own in-game marketplace
  (§3.6, Phase 3) exists. Flagged as an open question in §10, not decided
  here.

## 9. MVP scope vs later phases

**Phase 1 (MVP) — fully off-chain, playable with no wallet**
- Operative cards: recruit, view roster, assign to Jobs, level up.
- 8-12 Job types across 1-2 districts.
- 1-2 Racket types for idle income.
- Basic Product trafficking: 2-3 districts, 2-3 real-named product tiers,
  buy/sell + server-resolved price ticks — no bust/Heat event yet, just the
  core buy-low-sell-high loop.
- 1-2 item types (a weapon and a tool) that boost stats, off-chain quantity
  tracking.
- Reputation + Heat as the two meta-currencies.
- Save/load via existing `/api/game-storage`.
- Deliberately no contract, no wallet connect, no claim flow yet — this phase
  proves the game loop is fun before spending engineering time on the mint
  pipeline. Recommended sequencing, not a scope cut: everything here is built
  against the exact data model §3.9/§10 assume, so nothing here gets
  reworked when Phase 1.5 adds the chain layer.

**Phase 1.5 — turn on real NFTs**
- Create the SPL Token mints + Metaplex metadata for every Product/Item type
  on Solana (§8).
- Wallet connect (new `@solana/wallet-adapter-react` stack — Phantom/Solflare/
  Backpack) + claim UI for Product and Items.
- `claim` and `deposit`/reclaim API routes per §3.9.
- This is the phase that actually delivers on "earned items are real NFTs" —
  called out separately from Phase 1 purely so the fun-game-loop question and
  the mint-pipeline question can be validated independently, not because
  it's optional.

**Phase 2**
- More districts, more Operative roles/traits, crew-composition Jobs.
- Heat "raid"/"bust" event with real stakes on both Rackets and in-transit
  Product.
- Recruitment shard/pity system fully tuned.
- Expanded item set (more weapons/tools, rarity tiers on items too).

**Phase 3 (stretch)**
- Player-to-player trading/marketplace for Operatives and items (your own
  marketplace — see the third-party-listing note in §10).
- PvP or async "rival Family" turf raids.

## 10. Open questions

- Final name — "Underworld Inc." is a placeholder; confirm before building out
  flavor text and art briefs.
- Transferability: freely transferable NFTs (default per §8) or restricted
  until Phase 3's marketplace exists?
- Recruitment currency: purely Cash-gated, or gate top-tier pulls behind
  Reputation too, to slow legendary-card power creep?
- Should Job/Product-price resolution be fully server-authoritative from day
  one (safer, more API work) or client-computed for MVP with
  server-authoritative as a hardening pass before Phase 1.5?
- Who/what holds the backend mint-authority keypair in production — a
  dedicated hot wallet funded just enough for transaction fees (Solana's
  cost-per-tx is a fraction of a cent), kept separate from any other
  Gumbuo-project wallet, so a compromise there can't touch anything else.
- RPC provider for production: a public mainnet-beta endpoint to start, or a
  paid provider (Helius/QuickNode) once volume or reliability needs it.

## 11. Player communication (planned — building tomorrow, not tonight)

Territory is now a real PvP surface (§3, built 2026-08-21) — players can see
each other's Families contesting the same shared map, which makes some way
to talk to each other feel necessary rather than optional. Noted here so the
idea isn't lost, deliberately not scoped or built yet.

Open questions to work through when this gets picked up:
- Scope: global chat, per-district chat, territory-tile-scoped ("trash talk
  the Family that just took your tile"), direct messages between players, or
  some combination?
- Moderation: this is a public-facing multiplayer surface with real
  usernames-as-wallet-addresses — needs at least basic profanity/spam
  filtering and a report/mute mechanism before going live with real users,
  not an afterthought.
- Transport: simple polling against a KV-backed message log (consistent with
  everything else in this game — cheap, no new infra) vs. a real-time
  transport (websockets/SSE) for a more immediate feel. Given the rest of
  the game already polls every 20s for state sync, polling chat at a faster
  interval (e.g. 3-5s) is the natural low-effort starting point rather than
  introducing a new real-time infrastructure dependency on day one.
- Identity: messages display as the truncated wallet address like everywhere
  else in the UI, or does this finally justify adding the optional display-
  name nicety flagged (and deferred) back when the leaderboard was wired up?
