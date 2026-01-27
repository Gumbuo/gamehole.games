import { NextRequest, NextResponse } from 'next/server';
import { Match, Team, BettingUser, Transaction } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_CONSTANTS, isValidBuyIn } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// GET /api/betting/matches - List matches
export async function GET(request: NextRequest) {
  try {
    const kv = getKV();
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const status = searchParams.get('status'); // pending, active, completed
    const teamId = searchParams.get('teamId');

    // Get specific match
    if (matchId) {
      const match = await kv.get<Match>(REDIS_KEYS.MATCH(matchId));
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Match not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, match });
    }

    // List matches by status
    let matchIds: string[] = [];

    if (status === 'pending') {
      matchIds = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
    } else if (status === 'active') {
      matchIds = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
    } else if (status === 'completed') {
      // Get last 50 completed matches
      matchIds = await kv.zrange(REDIS_KEYS.MATCHES_COMPLETED, -50, -1) as string[];
    } else {
      // Get all pending + active
      const pending = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
      const active = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      matchIds = [...pending, ...active];
    }

    const matches: Match[] = [];
    for (const mId of matchIds) {
      const match = await kv.get<Match>(REDIS_KEYS.MATCH(mId));
      if (match) {
        // Filter by team if specified
        if (teamId && match.team1Id !== teamId && match.team2Id !== teamId) {
          continue;
        }
        matches.push(match);
      }
    }

    return NextResponse.json({
      success: true,
      matches,
    });

  } catch (error) {
    console.error('GET /api/betting/matches error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/betting/matches - Create match or handle match actions
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { action, wallet, teamId, buyIn, targetTeamId, matchId, result, proofUrl } = body;
    const normalizedWallet = wallet?.toLowerCase();

    if (!normalizedWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet required' },
        { status: 400 }
      );
    }

    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedWallet));
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // CREATE MATCH
    if (action === 'create' || !action) {
      if (!teamId || !buyIn) {
        return NextResponse.json(
          { success: false, error: 'Team ID and buy-in required' },
          { status: 400 }
        );
      }

      if (!isValidBuyIn(buyIn)) {
        return NextResponse.json(
          { success: false, error: `Buy-in must be between 0.01 and 1 ETH` },
          { status: 400 }
        );
      }

      // Get and validate team
      const team = await kv.get<Team>(REDIS_KEYS.TEAM(teamId));
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }

      if (team.captain !== normalizedWallet) {
        return NextResponse.json(
          { success: false, error: 'Only team captain can create matches' },
          { status: 403 }
        );
      }

      if (team.members.length < PLATFORM_CONSTANTS.TEAM_SIZE) {
        return NextResponse.json(
          { success: false, error: `Team must have ${PLATFORM_CONSTANTS.TEAM_SIZE} members` },
          { status: 400 }
        );
      }

      // Check captain balance
      const buyInBigInt = BigInt(buyIn);
      if (BigInt(user.platformBalance) < buyInBigInt) {
        return NextResponse.json(
          { success: false, error: 'Insufficient balance for buy-in' },
          { status: 400 }
        );
      }

      // Deduct buy-in
      user.platformBalance = (BigInt(user.platformBalance) - buyInBigInt).toString();
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      // Create match
      const match: Match = {
        id: crypto.randomUUID(),
        team1Id: teamId,
        team2Id: targetTeamId || null,
        team1Captain: normalizedWallet,
        team2Captain: null,
        buyIn: buyIn,
        totalPot: buyIn,
        platformFee: "0",
        status: 'pending',
        winnerId: null,
        loserId: null,
        team1SubmittedResult: null,
        team2SubmittedResult: null,
        team1ProofUrl: null,
        team2ProofUrl: null,
        resultSubmittedAt: null,
        verifiedBy: null,
        verifiedAt: null,
        verificationNotes: null,
        disputeReason: null,
        disputeSubmittedBy: null,
        disputeResolvedBy: null,
        disputeResolution: null,
        totalBetsTeam1: "0",
        totalBetsTeam2: "0",
        bettingClosed: false,
        bettingClosedAt: null,
        team1Name: team.name,
        team2Name: null,
        createdAt: Date.now(),
        readyAt: null,
        startedAt: null,
        completedAt: null,
      };

      await kv.set(REDIS_KEYS.MATCH(match.id), match);

      // Add to pending matches
      const pendingMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
      pendingMatches.push(match.id);
      await kv.set(REDIS_KEYS.MATCHES_PENDING, pendingMatches);

      // Record transaction
      const tx: Transaction = {
        id: crypto.randomUUID(),
        wallet: normalizedWallet,
        type: 'match_buyin',
        amount: buyIn,
        txHash: null,
        status: 'completed',
        relatedMatchId: match.id,
        relatedBetId: null,
        notes: `Match buy-in for ${team.name}`,
        createdAt: Date.now(),
        completedAt: Date.now(),
      };
      await kv.set(REDIS_KEYS.TX(tx.id), tx);

      return NextResponse.json({
        success: true,
        match,
        newBalance: user.platformBalance,
        message: 'Match created! Waiting for opponent.',
      });
    }

    // ACCEPT MATCH (opponent accepts challenge)
    if (action === 'accept') {
      if (!matchId || !teamId) {
        return NextResponse.json(
          { success: false, error: 'Match ID and team ID required' },
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

      if (match.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Match already has an opponent' },
          { status: 400 }
        );
      }

      if (match.team1Id === teamId) {
        return NextResponse.json(
          { success: false, error: 'Cannot accept your own match' },
          { status: 400 }
        );
      }

      // If match targets specific team, verify
      if (match.team2Id && match.team2Id !== teamId) {
        return NextResponse.json(
          { success: false, error: 'This match is a private challenge' },
          { status: 403 }
        );
      }

      // Validate team
      const team = await kv.get<Team>(REDIS_KEYS.TEAM(teamId));
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }

      if (team.captain !== normalizedWallet) {
        return NextResponse.json(
          { success: false, error: 'Only team captain can accept matches' },
          { status: 403 }
        );
      }

      if (team.members.length < PLATFORM_CONSTANTS.TEAM_SIZE) {
        return NextResponse.json(
          { success: false, error: `Team must have ${PLATFORM_CONSTANTS.TEAM_SIZE} members` },
          { status: 400 }
        );
      }

      // Check captain balance
      const buyInBigInt = BigInt(match.buyIn);
      if (BigInt(user.platformBalance) < buyInBigInt) {
        return NextResponse.json(
          { success: false, error: 'Insufficient balance for buy-in' },
          { status: 400 }
        );
      }

      // Deduct buy-in
      user.platformBalance = (BigInt(user.platformBalance) - buyInBigInt).toString();
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      // Update match
      match.team2Id = teamId;
      match.team2Captain = normalizedWallet;
      match.team2Name = team.name;
      match.totalPot = (BigInt(match.totalPot) + buyInBigInt).toString();
      match.status = 'ready';
      match.readyAt = Date.now();
      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      // Move from pending to active
      const pendingMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
      await kv.set(REDIS_KEYS.MATCHES_PENDING, pendingMatches.filter(id => id !== matchId));

      const activeMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_ACTIVE) || [];
      activeMatches.push(matchId);
      await kv.set(REDIS_KEYS.MATCHES_ACTIVE, activeMatches);

      // Record transaction
      const tx: Transaction = {
        id: crypto.randomUUID(),
        wallet: normalizedWallet,
        type: 'match_buyin',
        amount: match.buyIn,
        txHash: null,
        status: 'completed',
        relatedMatchId: matchId,
        relatedBetId: null,
        notes: `Match buy-in for ${team.name}`,
        createdAt: Date.now(),
        completedAt: Date.now(),
      };
      await kv.set(REDIS_KEYS.TX(tx.id), tx);

      return NextResponse.json({
        success: true,
        match,
        newBalance: user.platformBalance,
        message: 'Match accepted! Betting is now open. Play your Spider Tanks match!',
      });
    }

    // START MATCH (close betting)
    if (action === 'start') {
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

      if (match.team1Captain !== normalizedWallet && match.team2Captain !== normalizedWallet) {
        return NextResponse.json(
          { success: false, error: 'Only team captains can start match' },
          { status: 403 }
        );
      }

      if (match.status !== 'ready') {
        return NextResponse.json(
          { success: false, error: 'Match not ready to start' },
          { status: 400 }
        );
      }

      match.status = 'in_progress';
      match.startedAt = Date.now();
      match.bettingClosed = true;
      match.bettingClosedAt = Date.now();
      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      return NextResponse.json({
        success: true,
        match,
        message: 'Match started! Betting is closed. Submit results when done.',
      });
    }

    // SUBMIT RESULT
    if (action === 'submit_result') {
      if (!matchId || !result) {
        return NextResponse.json(
          { success: false, error: 'Match ID and result required' },
          { status: 400 }
        );
      }

      if (result !== 'win' && result !== 'loss') {
        return NextResponse.json(
          { success: false, error: 'Result must be "win" or "loss"' },
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

      if (match.status !== 'in_progress' && match.status !== 'ready') {
        return NextResponse.json(
          { success: false, error: 'Match not in progress' },
          { status: 400 }
        );
      }

      const isTeam1 = match.team1Captain === normalizedWallet;
      const isTeam2 = match.team2Captain === normalizedWallet;

      if (!isTeam1 && !isTeam2) {
        return NextResponse.json(
          { success: false, error: 'Only team captains can submit results' },
          { status: 403 }
        );
      }

      // Update result submission
      if (isTeam1) {
        match.team1SubmittedResult = result;
        match.team1ProofUrl = proofUrl || null;
      } else {
        match.team2SubmittedResult = result;
        match.team2ProofUrl = proofUrl || null;
      }

      match.resultSubmittedAt = Date.now();
      match.status = 'awaiting_result';

      // Check if results match (auto-verify)
      if (match.team1SubmittedResult && match.team2SubmittedResult) {
        // Results agree (one says win, other says loss)
        const team1ClaimsWin = match.team1SubmittedResult === 'win';
        const team2ClaimsLoss = match.team2SubmittedResult === 'loss';
        const team2ClaimsWin = match.team2SubmittedResult === 'win';
        const team1ClaimsLoss = match.team1SubmittedResult === 'loss';

        if ((team1ClaimsWin && team2ClaimsLoss) || (team2ClaimsWin && team1ClaimsLoss)) {
          match.status = 'verified';
          match.winnerId = team1ClaimsWin ? match.team1Id : match.team2Id;
          match.loserId = team1ClaimsWin ? match.team2Id : match.team1Id;
          match.verifiedAt = Date.now();
          match.verificationNotes = 'Auto-verified: Both teams agreed on result';
        } else {
          // Conflict - both claim win or both claim loss
          match.status = 'disputed';
          match.disputeReason = 'Conflicting result submissions';
        }
      }

      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      return NextResponse.json({
        success: true,
        match,
        message: match.status === 'verified'
          ? 'Results verified! Payouts will be processed.'
          : match.status === 'disputed'
            ? 'Results conflict! Admin will review.'
            : 'Result submitted. Waiting for other team.',
      });
    }

    // CANCEL MATCH (only if pending)
    if (action === 'cancel') {
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

      if (match.team1Captain !== normalizedWallet) {
        return NextResponse.json(
          { success: false, error: 'Only match creator can cancel' },
          { status: 403 }
        );
      }

      if (match.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Can only cancel pending matches' },
          { status: 400 }
        );
      }

      // Refund buy-in
      user.platformBalance = (BigInt(user.platformBalance) + BigInt(match.buyIn)).toString();
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      // Update match
      match.status = 'cancelled';
      match.completedAt = Date.now();
      await kv.set(REDIS_KEYS.MATCH(matchId), match);

      // Remove from pending
      const pendingMatches = await kv.get<string[]>(REDIS_KEYS.MATCHES_PENDING) || [];
      await kv.set(REDIS_KEYS.MATCHES_PENDING, pendingMatches.filter(id => id !== matchId));

      // Record refund transaction
      const tx: Transaction = {
        id: crypto.randomUUID(),
        wallet: normalizedWallet,
        type: 'match_refund',
        amount: match.buyIn,
        txHash: null,
        status: 'completed',
        relatedMatchId: matchId,
        relatedBetId: null,
        notes: 'Match cancelled - buy-in refunded',
        createdAt: Date.now(),
        completedAt: Date.now(),
      };
      await kv.set(REDIS_KEYS.TX(tx.id), tx);

      return NextResponse.json({
        success: true,
        match,
        newBalance: user.platformBalance,
        message: 'Match cancelled. Buy-in refunded.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST /api/betting/matches error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
