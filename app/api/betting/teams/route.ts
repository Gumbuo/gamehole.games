import { NextRequest, NextResponse } from 'next/server';
import { Team, BettingUser } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_CONSTANTS } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// GET /api/betting/teams - List teams or get specific team
export async function GET(request: NextRequest) {
  try {
    const kv = getKV();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const wallet = searchParams.get('wallet')?.toLowerCase();
    const activeOnly = searchParams.get('active') !== 'false';

    // Get specific team
    if (teamId) {
      const team = await kv.get<Team>(REDIS_KEYS.TEAM(teamId));
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, team });
    }

    // Get user's team
    if (wallet) {
      const user = await kv.get<BettingUser>(REDIS_KEYS.USER(wallet));
      if (user?.currentTeamId) {
        const team = await kv.get<Team>(REDIS_KEYS.TEAM(user.currentTeamId));

        // Also get pending invites for this user
        const invites = await kv.get<string[]>(REDIS_KEYS.TEAM_INVITES(wallet)) || [];
        const inviteTeams: Team[] = [];
        for (const inviteTeamId of invites) {
          const inviteTeam = await kv.get<Team>(REDIS_KEYS.TEAM(inviteTeamId));
          if (inviteTeam && inviteTeam.isActive) {
            inviteTeams.push(inviteTeam);
          }
        }

        return NextResponse.json({
          success: true,
          team,
          pendingInvites: inviteTeams,
        });
      }

      // No team, return pending invites
      const invites = await kv.get<string[]>(REDIS_KEYS.TEAM_INVITES(wallet)) || [];
      const inviteTeams: Team[] = [];
      for (const inviteTeamId of invites) {
        const inviteTeam = await kv.get<Team>(REDIS_KEYS.TEAM(inviteTeamId));
        if (inviteTeam && inviteTeam.isActive) {
          inviteTeams.push(inviteTeam);
        }
      }

      return NextResponse.json({
        success: true,
        team: null,
        pendingInvites: inviteTeams,
      });
    }

    // List all active teams
    const teamsList = activeOnly
      ? await kv.get<string[]>(REDIS_KEYS.TEAMS_ACTIVE) || []
      : await kv.get<string[]>(REDIS_KEYS.TEAMS_LIST) || [];

    const teams: Team[] = [];
    for (const tId of teamsList.slice(0, 50)) { // Limit to 50
      const team = await kv.get<Team>(REDIS_KEYS.TEAM(tId));
      if (team && (!activeOnly || team.isActive)) {
        teams.push(team);
      }
    }

    return NextResponse.json({
      success: true,
      teams,
    });

  } catch (error) {
    console.error('GET /api/betting/teams error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/betting/teams - Create team or handle team actions
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { action, wallet, teamName, teamId, targetWallet } = body;
    const normalizedWallet = wallet?.toLowerCase();

    if (!normalizedWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet required' },
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

    // CREATE TEAM
    if (action === 'create' || !action) {
      if (!teamName) {
        return NextResponse.json(
          { success: false, error: 'Team name required' },
          { status: 400 }
        );
      }

      if (teamName.length < 3 || teamName.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Team name must be 3-20 characters' },
          { status: 400 }
        );
      }

      if (user.currentTeamId) {
        return NextResponse.json(
          { success: false, error: 'Already in a team. Leave current team first.' },
          { status: 400 }
        );
      }

      const team: Team = {
        id: crypto.randomUUID(),
        name: teamName,
        captain: normalizedWallet,
        members: [normalizedWallet],
        pendingInvites: [],
        wins: 0,
        losses: 0,
        totalEarnings: "0",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Update user
      user.currentTeamId = team.id;
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      // Save team
      await kv.set(REDIS_KEYS.TEAM(team.id), team);

      // Add to team lists
      const teamsList = await kv.get<string[]>(REDIS_KEYS.TEAMS_LIST) || [];
      teamsList.push(team.id);
      await kv.set(REDIS_KEYS.TEAMS_LIST, teamsList);

      const activeTeams = await kv.get<string[]>(REDIS_KEYS.TEAMS_ACTIVE) || [];
      activeTeams.push(team.id);
      await kv.set(REDIS_KEYS.TEAMS_ACTIVE, activeTeams);

      return NextResponse.json({
        success: true,
        team,
        message: `Team "${teamName}" created! Invite 2 more players to start competing.`,
      });
    }

    // INVITE PLAYER
    if (action === 'invite') {
      if (!targetWallet) {
        return NextResponse.json(
          { success: false, error: 'Target wallet required' },
          { status: 400 }
        );
      }

      const normalizedTarget = targetWallet.toLowerCase();

      if (!user.currentTeamId) {
        return NextResponse.json(
          { success: false, error: 'You must be in a team to invite' },
          { status: 400 }
        );
      }

      const team = await kv.get<Team>(REDIS_KEYS.TEAM(user.currentTeamId));
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }

      if (team.captain !== normalizedWallet) {
        return NextResponse.json(
          { success: false, error: 'Only captain can invite players' },
          { status: 403 }
        );
      }

      if (team.members.length >= PLATFORM_CONSTANTS.TEAM_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Team is full' },
          { status: 400 }
        );
      }

      if (team.pendingInvites.length >= PLATFORM_CONSTANTS.MAX_PENDING_INVITES) {
        return NextResponse.json(
          { success: false, error: 'Too many pending invites' },
          { status: 400 }
        );
      }

      if (team.members.includes(normalizedTarget) || team.pendingInvites.includes(normalizedTarget)) {
        return NextResponse.json(
          { success: false, error: 'Player already in team or invited' },
          { status: 400 }
        );
      }

      // Check target exists
      const targetUser = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedTarget));
      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'Target user not found' },
          { status: 404 }
        );
      }

      if (targetUser.currentTeamId) {
        return NextResponse.json(
          { success: false, error: 'Target user already in a team' },
          { status: 400 }
        );
      }

      // Add to pending invites
      team.pendingInvites.push(normalizedTarget);
      team.updatedAt = Date.now();
      await kv.set(REDIS_KEYS.TEAM(team.id), team);

      // Add to target's invite list
      const targetInvites = await kv.get<string[]>(REDIS_KEYS.TEAM_INVITES(normalizedTarget)) || [];
      if (!targetInvites.includes(team.id)) {
        targetInvites.push(team.id);
        await kv.set(REDIS_KEYS.TEAM_INVITES(normalizedTarget), targetInvites);
      }

      return NextResponse.json({
        success: true,
        team,
        message: `Invitation sent to ${normalizedTarget}`,
      });
    }

    // ACCEPT INVITE
    if (action === 'accept') {
      if (!teamId) {
        return NextResponse.json(
          { success: false, error: 'Team ID required' },
          { status: 400 }
        );
      }

      if (user.currentTeamId) {
        return NextResponse.json(
          { success: false, error: 'Already in a team' },
          { status: 400 }
        );
      }

      const team = await kv.get<Team>(REDIS_KEYS.TEAM(teamId));
      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Team not found' },
          { status: 404 }
        );
      }

      if (!team.pendingInvites.includes(normalizedWallet)) {
        return NextResponse.json(
          { success: false, error: 'No pending invite from this team' },
          { status: 400 }
        );
      }

      if (team.members.length >= PLATFORM_CONSTANTS.TEAM_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Team is already full' },
          { status: 400 }
        );
      }

      // Add to team
      team.members.push(normalizedWallet);
      team.pendingInvites = team.pendingInvites.filter(w => w !== normalizedWallet);
      team.updatedAt = Date.now();
      await kv.set(REDIS_KEYS.TEAM(teamId), team);

      // Update user
      user.currentTeamId = teamId;
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      // Remove from invites list
      const invites = await kv.get<string[]>(REDIS_KEYS.TEAM_INVITES(normalizedWallet)) || [];
      await kv.set(REDIS_KEYS.TEAM_INVITES(normalizedWallet), invites.filter(id => id !== teamId));

      return NextResponse.json({
        success: true,
        team,
        message: `Joined team "${team.name}"!`,
      });
    }

    // DECLINE INVITE
    if (action === 'decline') {
      if (!teamId) {
        return NextResponse.json(
          { success: false, error: 'Team ID required' },
          { status: 400 }
        );
      }

      const team = await kv.get<Team>(REDIS_KEYS.TEAM(teamId));
      if (team) {
        team.pendingInvites = team.pendingInvites.filter(w => w !== normalizedWallet);
        team.updatedAt = Date.now();
        await kv.set(REDIS_KEYS.TEAM(teamId), team);
      }

      // Remove from invites list
      const invites = await kv.get<string[]>(REDIS_KEYS.TEAM_INVITES(normalizedWallet)) || [];
      await kv.set(REDIS_KEYS.TEAM_INVITES(normalizedWallet), invites.filter(id => id !== teamId));

      return NextResponse.json({
        success: true,
        message: 'Invitation declined',
      });
    }

    // LEAVE TEAM
    if (action === 'leave') {
      if (!user.currentTeamId) {
        return NextResponse.json(
          { success: false, error: 'Not in a team' },
          { status: 400 }
        );
      }

      const team = await kv.get<Team>(REDIS_KEYS.TEAM(user.currentTeamId));
      if (!team) {
        user.currentTeamId = null;
        await kv.set(REDIS_KEYS.USER(normalizedWallet), user);
        return NextResponse.json({ success: true, message: 'Left team' });
      }

      // If captain, disband team or transfer captaincy
      if (team.captain === normalizedWallet) {
        if (team.members.length === 1) {
          // Disband team
          team.isActive = false;
          team.updatedAt = Date.now();
          await kv.set(REDIS_KEYS.TEAM(team.id), team);

          // Remove from active teams
          const activeTeams = await kv.get<string[]>(REDIS_KEYS.TEAMS_ACTIVE) || [];
          await kv.set(REDIS_KEYS.TEAMS_ACTIVE, activeTeams.filter(id => id !== team.id));
        } else {
          // Transfer captaincy to next member
          const newCaptain = team.members.find(m => m !== normalizedWallet);
          if (newCaptain) {
            team.captain = newCaptain;
            team.members = team.members.filter(m => m !== normalizedWallet);
            team.updatedAt = Date.now();
            await kv.set(REDIS_KEYS.TEAM(team.id), team);
          }
        }
      } else {
        // Just remove from members
        team.members = team.members.filter(m => m !== normalizedWallet);
        team.updatedAt = Date.now();
        await kv.set(REDIS_KEYS.TEAM(team.id), team);
      }

      user.currentTeamId = null;
      await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

      return NextResponse.json({
        success: true,
        message: 'Left team successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('POST /api/betting/teams error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
