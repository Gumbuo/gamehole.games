import { NextRequest, NextResponse } from 'next/server';
import { Bet, Match, BettingUser, Transaction, Team } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_CONSTANTS, calculateOdds, calculatePayout, isValidBetAmount } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// GET /api/betting/bets - Get bets for user or match
export async function GET(request: NextRequest) {
  try {
    const kv = getKV();
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();
    const matchId = searchParams.get('matchId');
    const betId = searchParams.get('betId');

    // Get specific bet
    if (betId) {
      const bet = await kv.get<Bet>(REDIS_KEYS.BET(betId));
      if (!bet) {
        return NextResponse.json(
          { success: false, error: 'Bet not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, bet });
    }

    let betIds: string[] = [];

    if (matchId) {
      betIds = await kv.get<string[]>(REDIS_KEYS.BETS_MATCH(matchId)) || [];
    } else if (wallet) {
      betIds = await kv.get<string[]>(REDIS_KEYS.BETS_USER(wallet)) || [];
    } else {
      // Get active bets
      betIds = await kv.get<string[]>(REDIS_KEYS.BETS_ACTIVE) || [];
    }

    const bets: Bet[] = [];
    for (const bId of betIds.slice(0, 100)) {
      const bet = await kv.get<Bet>(REDIS_KEYS.BET(bId));
      if (bet) {
        bets.push(bet);
      }
    }

    return NextResponse.json({
      success: true,
      bets,
    });

  } catch (error) {
    console.error('GET /api/betting/bets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/betting/bets - Place a bet
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { wallet, matchId, teamId, amount } = body;
    const normalizedWallet = wallet?.toLowerCase();

    if (!normalizedWallet || !matchId || !teamId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Wallet, matchId, teamId, and amount required' },
        { status: 400 }
      );
    }

    if (!isValidBetAmount(amount)) {
      return NextResponse.json(
        { success: false, error: `Bet must be between 0.001 and 0.5 ETH` },
        { status: 400 }
      );
    }

    // Get user
    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedWallet));
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: 'Account suspended' },
        { status: 403 }
      );
    }

    // Get match
    const match = await kv.get<Match>(REDIS_KEYS.MATCH(matchId));
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // Validate betting is open
    if (match.bettingClosed) {
      return NextResponse.json(
        { success: false, error: 'Betting is closed for this match' },
        { status: 400 }
      );
    }

    if (match.status !== 'ready') {
      return NextResponse.json(
        { success: false, error: 'Match not ready for betting' },
        { status: 400 }
      );
    }

    // Validate team
    if (teamId !== match.team1Id && teamId !== match.team2Id) {
      return NextResponse.json(
        { success: false, error: 'Invalid team for this match' },
        { status: 400 }
      );
    }

    // Don't allow team members to bet on their own match
    const team1 = await kv.get<Team>(REDIS_KEYS.TEAM(match.team1Id));
    const team2 = match.team2Id ? await kv.get<Team>(REDIS_KEYS.TEAM(match.team2Id)) : null;

    if (team1?.members.includes(normalizedWallet) || team2?.members.includes(normalizedWallet)) {
      return NextResponse.json(
        { success: false, error: 'Cannot bet on your own match' },
        { status: 400 }
      );
    }

    // Check balance
    const amountBigInt = BigInt(amount);
    if (BigInt(user.platformBalance) < amountBigInt) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate odds at time of bet
    const odds = calculateOdds(
      match.totalBetsTeam1,
      match.totalBetsTeam2,
      teamId,
      match.team1Id
    );

    // Calculate potential payout
    const potentialPayout = calculatePayout(amount, odds);

    // Get team name for bet record
    const bettingOnTeam = teamId === match.team1Id ? team1 : team2;
    const teamName = bettingOnTeam?.name || 'Unknown Team';

    // Deduct from user balance
    user.platformBalance = (BigInt(user.platformBalance) - amountBigInt).toString();
    user.betsPlaced += 1;
    user.lastActive = Date.now();
    await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

    // Create bet
    const bet: Bet = {
      id: crypto.randomUUID(),
      matchId,
      bettor: normalizedWallet,
      teamId,
      teamName,
      amount,
      odds,
      potentialPayout,
      actualPayout: null,
      status: 'active',
      placedAt: Date.now(),
      settledAt: null,
    };

    await kv.set(REDIS_KEYS.BET(bet.id), bet);

    // Update match betting pools
    if (teamId === match.team1Id) {
      match.totalBetsTeam1 = (BigInt(match.totalBetsTeam1) + amountBigInt).toString();
    } else {
      match.totalBetsTeam2 = (BigInt(match.totalBetsTeam2) + amountBigInt).toString();
    }
    await kv.set(REDIS_KEYS.MATCH(matchId), match);

    // Update indexes
    const matchBets = await kv.get<string[]>(REDIS_KEYS.BETS_MATCH(matchId)) || [];
    matchBets.push(bet.id);
    await kv.set(REDIS_KEYS.BETS_MATCH(matchId), matchBets);

    const userBets = await kv.get<string[]>(REDIS_KEYS.BETS_USER(normalizedWallet)) || [];
    userBets.unshift(bet.id);
    await kv.set(REDIS_KEYS.BETS_USER(normalizedWallet), userBets.slice(0, 100));

    const activeBets = await kv.get<string[]>(REDIS_KEYS.BETS_ACTIVE) || [];
    activeBets.push(bet.id);
    await kv.set(REDIS_KEYS.BETS_ACTIVE, activeBets);

    // Record transaction
    const tx: Transaction = {
      id: crypto.randomUUID(),
      wallet: normalizedWallet,
      type: 'bet_placed',
      amount,
      txHash: null,
      status: 'completed',
      relatedMatchId: matchId,
      relatedBetId: bet.id,
      notes: `Bet on ${teamName} at ${odds.toFixed(2)}x odds`,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };
    await kv.set(REDIS_KEYS.TX(tx.id), tx);

    return NextResponse.json({
      success: true,
      bet,
      newBalance: user.platformBalance,
      message: `Bet placed on ${teamName} at ${odds.toFixed(2)}x odds!`,
    });

  } catch (error) {
    console.error('POST /api/betting/bets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
