// Spider Tanks Betting Platform Constants

export const PLATFORM_CONSTANTS = {
  // Match fees
  MATCH_FEE_PERCENT: 5,                           // 5% of match pot
  MIN_BUY_IN: "10000000000000000",                // 0.01 ETH
  MAX_BUY_IN: "1000000000000000000",              // 1 ETH

  // Betting fees
  BET_FEE_PERCENT: 5,                             // 5% of bet winnings
  MIN_BET: "1000000000000000",                    // 0.001 ETH
  MAX_BET: "500000000000000000",                  // 0.5 ETH

  // Withdrawal
  MIN_WITHDRAWAL: "10000000000000000",            // 0.01 ETH
  WITHDRAWAL_FEE: "1000000000000000",             // 0.001 ETH (gas buffer)

  // Team
  TEAM_SIZE: 3,
  MAX_PENDING_INVITES: 5,

  // Timing (milliseconds)
  RESULT_SUBMISSION_WINDOW: 30 * 60 * 1000,       // 30 minutes
  DISPUTE_WINDOW: 30 * 60 * 1000,                 // 30 minutes
  BET_CLOSE_BEFORE_START: 5 * 60 * 1000,          // 5 minutes before match

  // Nonce expiry
  NONCE_EXPIRY: 5 * 60 * 1000,                    // 5 minutes
};

// Redis key prefixes
export const REDIS_KEYS = {
  // User data
  USER: (wallet: string) => `st:user:${wallet.toLowerCase()}`,
  USERS_LIST: 'st:users:list',

  // Team data
  TEAM: (teamId: string) => `st:team:${teamId}`,
  TEAMS_LIST: 'st:teams:list',
  TEAMS_ACTIVE: 'st:teams:active',

  // Match data
  MATCH: (matchId: string) => `st:match:${matchId}`,
  MATCHES_PENDING: 'st:matches:pending',
  MATCHES_ACTIVE: 'st:matches:active',
  MATCHES_COMPLETED: 'st:matches:completed',

  // Bet data
  BET: (betId: string) => `st:bet:${betId}`,
  BETS_MATCH: (matchId: string) => `st:bets:match:${matchId}`,
  BETS_USER: (wallet: string) => `st:bets:user:${wallet.toLowerCase()}`,
  BETS_ACTIVE: 'st:bets:active',

  // Transaction data
  TX: (txId: string) => `st:tx:${txId}`,
  TXS_USER: (wallet: string) => `st:txs:user:${wallet.toLowerCase()}`,

  // Platform stats
  PLATFORM_STATS: 'st:platform:stats',

  // Team invitations
  TEAM_INVITES: (wallet: string) => `st:invites:${wallet.toLowerCase()}`,
};

// Admin wallets (lowercase)
export const ADMIN_WALLETS: string[] = [
  process.env.ADMIN_WALLET_1?.toLowerCase(),
  process.env.ADMIN_WALLET_2?.toLowerCase(),
].filter((w): w is string => !!w);

// Platform wallet for deposits
export const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS?.toLowerCase() || '';

// Helper functions
export function isAdmin(wallet: string): boolean {
  return ADMIN_WALLETS.includes(wallet.toLowerCase());
}

export function formatEthFromWei(wei: string): string {
  const value = BigInt(wei);
  const eth = Number(value) / 1e18;
  return eth.toFixed(4);
}

export function parseEthToWei(eth: string): string {
  const value = parseFloat(eth);
  return BigInt(Math.floor(value * 1e18)).toString();
}

// Calculate odds based on betting pools
export function calculateOdds(
  totalBetsTeam1: string,
  totalBetsTeam2: string,
  teamId: string,
  team1Id: string
): number {
  const team1Total = BigInt(totalBetsTeam1) || BigInt("1000000000000000"); // Min 0.001 ETH
  const team2Total = BigInt(totalBetsTeam2) || BigInt("1000000000000000");
  const totalPool = team1Total + team2Total;

  if (teamId === team1Id) {
    return Number((totalPool * BigInt(100)) / team1Total) / 100;
  } else {
    return Number((totalPool * BigInt(100)) / team2Total) / 100;
  }
}

// Calculate potential payout
export function calculatePayout(
  amount: string,
  odds: number,
  feePercent: number = PLATFORM_CONSTANTS.BET_FEE_PERCENT
): string {
  const amountBigInt = BigInt(amount);
  const grossPayout = (amountBigInt * BigInt(Math.floor(odds * 100))) / BigInt(100);
  const fee = (grossPayout * BigInt(feePercent)) / BigInt(100);
  return (grossPayout - fee).toString();
}

// Validate buy-in amount
export function isValidBuyIn(amount: string): boolean {
  const amountBigInt = BigInt(amount);
  return (
    amountBigInt >= BigInt(PLATFORM_CONSTANTS.MIN_BUY_IN) &&
    amountBigInt <= BigInt(PLATFORM_CONSTANTS.MAX_BUY_IN)
  );
}

// Validate bet amount
export function isValidBetAmount(amount: string): boolean {
  const amountBigInt = BigInt(amount);
  return (
    amountBigInt >= BigInt(PLATFORM_CONSTANTS.MIN_BET) &&
    amountBigInt <= BigInt(PLATFORM_CONSTANTS.MAX_BET)
  );
}

// Generate auth message for signing
export function generateAuthMessage(nonce: string): string {
  return `Sign this message to authenticate with GameHole Spider Tanks Betting:\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
}
