import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { Match, Bet, BettingUser, Team, Transaction } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_CONSTANTS, isAdmin } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// Helper to settle all bets for a match
async function settleBets(matchId: string, winnerId: string) {
  const kv = getKV();
  const betIds = await kv.get<string[]>(REDIS_KEYS.BETS_MATCH(matchId)) || [];
  const settledBets: Bet[] = [];

  for (const betId of betIds) {
    const bet = await kv.get<Bet>(REDIS_KEYS.BET(betId));
    if (!bet || bet.status !== 'active') continue;

    if (bet.teamId === winnerId) {
      // Winning bet
      bet.status = 'won';
      bet.actualPayout = bet.potentialPayout;
      bet.settledAt = Date.now();

      // Credit bettor
      const bettor = await kv.get<BettingUser>(REDIS_KEYS.USER(bet.bettor));
      if (bettor) {
        bettor.platformBalance = (BigInt(bettor.platformBalance) + BigInt(bet.potentialPayout)).toString();
        bettor.totalWon = (BigInt(bettor.totalWon) + BigInt(bet.potentialPayout)).toString();
        bettor.betsWon += 1;
        await kv.set(REDIS_KEYS.USER(bet.bettor), bettor);

        // Record transaction
        const tx: Transaction = {
          id: crypto.randomUUID(),
          wallet: bet.bettor,
          type: 'bet_won',
          amount: bet.potentialPayout,
          txHash: null,
          status: 'completed',
          relatedMatchId: matchId,
          relatedBetId: betId,
          notes: `Won bet on ${bet.teamName}`,
          createdAt: Date.now(),
          completedAt: Date.now(),
        };
        await kv.set(REDIS_KEYS.TX(tx.id), tx);
      }
    } else {
      // Losing bet
      bet.status = 'lost';
      bet.actualPayout = "0";
      bet.settledAt = Date.now();

      // Update bettor stats
      const bettor = await kv.get<BettingUser>(REDIS_KEYS.USER(bet.bettor));
      if (bettor) {
        bettor.totalLost = (BigInt(bettor.totalLost) + BigInt(bet.amount)).toString();
        bettor.betsLost += 1;
        await kv.set(REDIS_KEYS.USER(bet.bettor), bettor);
      }
    }

    await kv.set(REDIS_KEYS.BET(betId), bet);
    settledBets.push(bet);
  }

  // Remove from active bets
  const activeBets = await kv.get<string[]>(REDIS_KEYS.BETS_ACTIVE) || [];
  const newActiveBets = activeBets.filter(id => !betIds.includes(id));
  await kv.set(REDIS_KEYS.BETS_ACTIVE, newActiveBets);

  return settledBets;
}

// Helper to process match payout
async function processMatchPayout(match: Match) {
  const kv = getKV();
  if (!match.winnerId || !match.loserId) return;

  const winningTeam = await kv.get<Team>(REDIS_KEYS.TEAM(match.winnerId));
  const losingTeam = await kv.get<Team>(REDIS_KEYS.TEAM(match.loserId));

  if (!winningTeam || !losingTeam) return;

  // Calculate payout
  const totalPot = BigInt(match.totalPot);
  const platformFee = (totalPot * BigInt(PLATFORM_CONSTANTS.MATCH_FEE_PERCENT)) / BigInt(100);
  const winnerPayout = totalPot - platformFee;

  match.platformFee = platformFee.toString();

  // Credit winning team captain
  const winnerCaptain = await kv.get<BettingUser>(REDIS_KEYS.USER(winningTeam.captain));
  if (winnerCaptain) {
    winnerCaptain.platformBalance = (BigInt(winnerCaptain.platformBalance) + winnerPayout).toString();
    winnerCaptain.totalWon = (BigInt(winnerCaptain.totalWon) + winnerPayout).toString();
    winnerCaptain.matchesWon += 1;
    winnerCaptain.matchesPlayed += 1;
    await kv.set(REDIS_KEYS.USER(winningTeam.captain), winnerCaptain);

    // Record transaction
    const tx: Transaction = {
      id: crypto.randomUUID(),
      wallet: winningTeam.captain,
      type: 'match_winnings',
      amount: winnerPayout.toString(),
      txHash: null,
      status: 'completed',
      relatedMatchId: match.id,
      relatedBetId: null,
      notes: `Match win with ${winningTeam.name}`,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };
    await kv.set(REDIS_KEYS.TX(tx.id), tx);
  }

  // Update losing captain stats
  const loserCaptain = await kv.get<BettingUser>(REDIS_KEYS.USER(losingTeam.captain));
  if (loserCaptain) {
    loserCaptain.totalLost = (BigInt(loserCaptain.totalLost) + BigInt(match.buyIn)).toString();
    loserCaptain.matchesLost += 1;
    loserCaptain.matchesPlayed += 1;
    await kv.set(REDIS_KEYS.USER(losingTeam.captain), loserCaptain);
  }

  // Update team records
  winningTeam.wins += 1;
  winningTeam.totalEarnings = (BigInt(winningTeam.totalEarnings) + winnerPayout).toString();
  await kv.set(REDIS_KEYS.TEAM(match.winnerId), winningTeam);

  losingTeam.losses += 1;
  await kv.set(REDIS_KEYS.TEAM(match.loserId), losingTeam);
}

// POST /api/betting/admin - Admin actions
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { action, adminWallet, matchId, winnerId, notes, signature, message } = body;
    const normalizedAdmin = adminWallet?.toLowerCase();

    if (!normalizedAdmin || !action) {
      return NextResponse.json(
        { success: false, error: 'Admin wallet and action required' },
        { status: 400 }
      );
    }

    // Verify admin
    const admin = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedAdmin));
    if (!admin?.isAdmin && !isAdmin(normalizedAdmin)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin only' },
        { status: 403 }
      );
    }

    // For sensitive operations, verify signature
    if (signature && message) {
      let isValid = false;
      try {
        isValid = await verifyMessage({
          address: adminWallet as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        });
      } catch {
        return NextResponse.json(
          { success: false, error: 'Signature verification failed' },
          { status: 401 }
        );
      }

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // VERIFY MATCH RESULT
    if (action === 'verify') {
      if (!matchId || !winnerId) {
        return NextResponse.json(
          { success: false, error: 'Match ID and winner ID required' },
          { status: 400 }
        );
      }

      const match = await kv.get<Match>(REDIS_KEYS.MATCH(matchId));
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Match not found' },
          { status: 404 }
        );
      }

      if (match.status !== 'awaiting_result' && match.status !== 'disputed' && match.status !== 'verified') {
        return NextResponse.json(
          { success: false, error: 'Match not awaiting verification' },
          { status: 400 }
        );
      }

      if (winnerId !== match.team1Id && winnerId !== match.team2Id) {
        return NextResponse.json(
          { success: false, error: 'Invalid winner ID' },
          { status: 400 }
        );
      }

      // Set winner/loser
      match.winnerId = winnerId;
      match.loserId = winnerId === match.team1Id ? match.team2Id : match.team1Id;
      match.status = 'verified';
      match.verifiedBy = normalizedAdmin;
      match.verifiedAt = Date.now();
      match.verificationNotes = notes || 'Admin verified';

      // Process match payout
      await processMatchPayout(match);

      // Settle all bets
      const settledBets = await settleBets(matchId, winnerId);

      // Complete match
      match.status = 'completed';
      match.completedAt = Date.now();
      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      // Move from active to completed
      const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      await kv.set(REDIS_KEYS.MATCHES_ACTIVE, activeMatches.filter(id => id !== matchId));

      return NextResponse.json({
        success: true,
        match,
        settledBets: settledBets.length,
        message: `Match verified. ${settledBets.length} bets settled.`,
      });
    }

    // PROCESS VERIFIED MATCHES (batch payout)
    if (action === 'process_payouts') {
      const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      let processed = 0;

      for (const mId of activeMatches) {
        const match = await kv.get<Match>(REDIS_KEYS.MATCH(mId));
        if (match && match.status === 'verified' && match.winnerId) {
          await processMatchPayout(match);
          await settleBets(mId, match.winnerId);

          match.status = 'completed';
          match.completedAt = Date.now();
          await kv.set(REDIS_KEYS.MATCH(mId), match);

          processed++;
        }
      }

      // Clean active list
      const updatedActive = [];
      for (const mId of activeMatches) {
        const m = await kv.get<Match>(REDIS_KEYS.MATCH(mId));
        if (m && m.status !== 'completed' && m.status !== 'cancelled') {
          updatedActive.push(mId);
        }
      }
      await kv.set(REDIS_KEYS.MATCHES_ACTIVE, updatedActive);

      return NextResponse.json({
        success: true,
        processed,
        message: `Processed ${processed} verified matches`,
      });
    }

    // CANCEL MATCH (refund all)
    if (action === 'cancel_match') {
      if (!matchId) {
        return NextResponse.json(
          { success: false, error: 'Match ID required' },
          { status: 400 }
        );
      }

      const match = await kv.get<Match>(REDIS_KEYS.MATCH(matchId));
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Match not found' },
          { status: 404 }
        );
      }

      // Refund team buy-ins
      if (match.team1Captain) {
        const captain1 = await kv.get<BettingUser>(REDIS_KEYS.USER(match.team1Captain));
        if (captain1) {
          captain1.platformBalance = (BigInt(captain1.platformBalance) + BigInt(match.buyIn)).toString();
          await kv.set(REDIS_KEYS.USER(match.team1Captain), captain1);
        }
      }

      if (match.team2Captain) {
        const captain2 = await kv.get<BettingUser>(REDIS_KEYS.USER(match.team2Captain));
        if (captain2) {
          captain2.platformBalance = (BigInt(captain2.platformBalance) + BigInt(match.buyIn)).toString();
          await kv.set(REDIS_KEYS.USER(match.team2Captain), captain2);
        }
      }

      // Refund all bets
      const betIds = await kv.get<string[]>(REDIS_KEYS.BETS_MATCH(matchId)) || [];
      for (const betId of betIds) {
        const bet = await kv.get<Bet>(REDIS_KEYS.BET(betId));
        if (bet && bet.status === 'active') {
          bet.status = 'refunded';
          bet.actualPayout = bet.amount;
          bet.settledAt = Date.now();
          await kv.set(REDIS_KEYS.BET(betId), bet);

          const bettor = await kv.get<BettingUser>(REDIS_KEYS.USER(bet.bettor));
          if (bettor) {
            bettor.platformBalance = (BigInt(bettor.platformBalance) + BigInt(bet.amount)).toString();
            await kv.set(REDIS_KEYS.USER(bet.bettor), bettor);

            const tx: Transaction = {
              id: crypto.randomUUID(),
              wallet: bet.bettor,
              type: 'bet_refund',
              amount: bet.amount,
              txHash: null,
              status: 'completed',
              relatedMatchId: matchId,
              relatedBetId: betId,
              notes: 'Match cancelled - bet refunded',
              createdAt: Date.now(),
              completedAt: Date.now(),
            };
            await kv.set(REDIS_KEYS.TX(tx.id), tx);
          }
        }
      }

      // Update match
      match.status = 'cancelled';
      match.completedAt = Date.now();
      match.verifiedBy = normalizedAdmin;
      match.verificationNotes = notes || 'Admin cancelled';
      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      // Clean from lists
      const pendingMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
      await kv.set(REDIS_KEYS.MATCHES_PENDING, pendingMatches.filter(id => id !== matchId));

      const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      await kv.set(REDIS_KEYS.MATCHES_ACTIVE, activeMatches.filter(id => id !== matchId));

      return NextResponse.json({
        success: true,
        match,
        message: 'Match cancelled. All buy-ins and bets refunded.',
      });
    }

    // GET PENDING VERIFICATIONS
    if (action === 'get_pending') {
      const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      const pendingVerification: Match[] = [];

      for (const mId of activeMatches) {
        const match = await kv.get<Match>(REDIS_KEYS.MATCH(mId));
        if (match && (match.status === 'awaiting_result' || match.status === 'disputed')) {
          pendingVerification.push(match);
        }
      }

      return NextResponse.json({
        success: true,
        matches: pendingVerification,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST /api/betting/admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/betting/admin - Get admin stats
export async function GET(request: NextRequest) {
  try {
    const kv = getKV();
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet required' },
        { status: 400 }
      );
    }

    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(wallet));
    if (!user?.isAdmin && !isAdmin(wallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get stats
    const usersList = await kv.get<string[]>(REDIS_KEYS.USERS_LIST) || [];
    const teamsList = await kv.get<string[]>(REDIS_KEYS.TEAMS_LIST) || [];
    const pendingMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
    const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
    const activeBets = await kv.get<string[]>(REDIS_KEYS.BETS_ACTIVE) || [];

    // Count awaiting verification
    let awaitingVerification = 0;
    let disputed = 0;
    for (const mId of activeMatches) {
      const match = await kv.get<Match>(REDIS_KEYS.MATCH(mId));
      if (match?.status === 'awaiting_result') awaitingVerification++;
      if (match?.status === 'disputed') disputed++;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: usersList.length,
        totalTeams: teamsList.length,
        pendingMatches: pendingMatches.length,
        activeMatches: activeMatches.length,
        activeBets: activeBets.length,
        awaitingVerification,
        disputed,
      },
    });

  } catch (error) {
    console.error('GET /api/betting/admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
