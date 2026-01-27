// Spider Tanks Betting Platform Types

// ============ USER DATA ============
export interface BettingUser {
  wallet: string;                    // Primary key (normalized lowercase)
  platformBalance: string;           // Wei string (platform credits)
  totalDeposited: string;            // Wei string (lifetime)
  totalWithdrawn: string;            // Wei string (lifetime)
  totalWon: string;                  // Wei string (lifetime winnings)
  totalLost: string;                 // Wei string (lifetime losses)
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  betsPlaced: number;
  betsWon: number;
  betsLost: number;
  currentTeamId: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  banReason: string | null;
  createdAt: number;
  lastActive: number;
  nonce: string;                     // For signature verification
}

// ============ TEAM DATA ============
export interface Team {
  id: string;                        // UUID
  name: string;
  captain: string;                   // Wallet address
  members: string[];                 // Array of wallet addresses (max 3)
  pendingInvites: string[];          // Wallets invited but not accepted
  wins: number;
  losses: number;
  totalEarnings: string;             // Wei string
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// ============ MATCH DATA ============
export type MatchStatus =
  | 'pending'           // Waiting for opponent team
  | 'ready'             // Both teams confirmed, waiting for game
  | 'in_progress'       // Game being played
  | 'awaiting_result'   // Game finished, awaiting result submission
  | 'disputed'          // Result disputed, needs admin review
  | 'verified'          // Result verified, payouts pending
  | 'completed'         // Payouts processed
  | 'cancelled';        // Match cancelled

export interface Match {
  id: string;                        // UUID
  team1Id: string;
  team2Id: string | null;            // Null until opponent accepts
  team1Captain: string;              // Wallet address
  team2Captain: string | null;
  buyIn: string;                     // Wei string (per team)
  totalPot: string;                  // Wei string
  platformFee: string;               // Wei string (calculated)
  status: MatchStatus;
  winnerId: string | null;           // Team ID
  loserId: string | null;            // Team ID

  // Result submission
  team1SubmittedResult: 'win' | 'loss' | null;
  team2SubmittedResult: 'win' | 'loss' | null;
  team1ProofUrl: string | null;      // Screenshot/video URL
  team2ProofUrl: string | null;
  resultSubmittedAt: number | null;

  // Verification
  verifiedBy: string | null;         // Admin wallet
  verifiedAt: number | null;
  verificationNotes: string | null;

  // Dispute handling
  disputeReason: string | null;
  disputeSubmittedBy: string | null;
  disputeResolvedBy: string | null;
  disputeResolution: string | null;

  // Betting
  totalBetsTeam1: string;            // Wei string
  totalBetsTeam2: string;            // Wei string
  bettingClosed: boolean;
  bettingClosedAt: number | null;

  // Team names (cached for display)
  team1Name: string;
  team2Name: string | null;

  // Timestamps
  createdAt: number;
  readyAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
}

// ============ BET DATA ============
export type BetStatus =
  | 'active'            // Bet placed, match ongoing
  | 'won'               // Bet won
  | 'lost'              // Bet lost
  | 'refunded'          // Match cancelled, bet refunded
  | 'pending_payout';   // Won, awaiting payout

export interface Bet {
  id: string;                        // UUID
  matchId: string;
  bettor: string;                    // Wallet address
  teamId: string;                    // Team bet on
  teamName: string;                  // Team name at time of bet
  amount: string;                    // Wei string
  odds: number;                      // Odds at time of bet (e.g., 1.5)
  potentialPayout: string;           // Wei string
  actualPayout: string | null;       // Wei string (after settlement)
  status: BetStatus;
  placedAt: number;
  settledAt: number | null;
}

// ============ TRANSACTION DATA ============
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bet_placed'
  | 'bet_won'
  | 'bet_refund'
  | 'match_buyin'
  | 'match_winnings'
  | 'match_refund'
  | 'platform_fee';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed';

export interface Transaction {
  id: string;                        // UUID
  wallet: string;
  type: TransactionType;
  amount: string;                    // Wei string
  txHash: string | null;             // On-chain tx hash
  status: TransactionStatus;
  relatedMatchId: string | null;
  relatedBetId: string | null;
  notes: string | null;
  createdAt: number;
  completedAt: number | null;
}

// ============ PLATFORM STATS ============
export interface PlatformStats {
  totalUsers: number;
  totalTeams: number;
  totalMatches: number;
  totalBets: number;
  totalVolume: string;               // Wei string
  totalFees: string;                 // Wei string
  activeMatches: number;
  activeBets: number;
}

// ============ API RESPONSES ============
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface UserResponse extends ApiResponse {
  user?: BettingUser;
}

export interface TeamResponse extends ApiResponse {
  team?: Team;
  teams?: Team[];
}

export interface MatchResponse extends ApiResponse {
  match?: Match;
  matches?: Match[];
}

export interface BetResponse extends ApiResponse {
  bet?: Bet;
  bets?: Bet[];
  newBalance?: string;
}
