"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { BettingUser, Team, Match, Bet } from '@/lib/betting/types';

interface BettingContextType {
  // User state
  user: BettingUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Team state
  team: Team | null;
  pendingInvites: Team[];

  // Match state
  pendingMatches: Match[];
  activeMatches: Match[];
  myMatches: Match[];

  // Actions
  authenticate: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  refreshTeam: () => Promise<void>;
  refreshMatches: () => Promise<void>;

  // Team actions
  createTeam: (name: string) => Promise<{ success: boolean; error?: string }>;
  inviteToTeam: (targetWallet: string) => Promise<{ success: boolean; error?: string }>;
  acceptInvite: (teamId: string) => Promise<{ success: boolean; error?: string }>;
  declineInvite: (teamId: string) => Promise<{ success: boolean; error?: string }>;
  leaveTeam: () => Promise<{ success: boolean; error?: string }>;

  // Match actions
  createMatch: (buyIn: string) => Promise<{ success: boolean; error?: string; match?: Match }>;
  acceptMatch: (matchId: string) => Promise<{ success: boolean; error?: string }>;
  startMatch: (matchId: string) => Promise<{ success: boolean; error?: string }>;
  submitResult: (matchId: string, result: 'win' | 'loss', proofUrl?: string) => Promise<{ success: boolean; error?: string }>;
  cancelMatch: (matchId: string) => Promise<{ success: boolean; error?: string }>;

  // Bet actions
  placeBet: (matchId: string, teamId: string, amount: string) => Promise<{ success: boolean; error?: string; bet?: Bet }>;
  getUserBets: () => Promise<Bet[]>;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export function BettingProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [user, setUser] = useState<BettingUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [pendingInvites, setPendingInvites] = useState<Team[]>([]);
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [myMatches, setMyMatches] = useState<Match[]>([]);

  // Fetch user data
  const refreshUser = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/betting/users?wallet=${address}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [address]);

  // Fetch team data
  const refreshTeam = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/betting/teams?wallet=${address}`);
      const data = await res.json();
      if (data.success) {
        setTeam(data.team || null);
        setPendingInvites(data.pendingInvites || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  }, [address]);

  // Fetch matches
  const refreshMatches = useCallback(async () => {
    try {
      // Fetch pending matches
      const pendingRes = await fetch('/api/betting/matches?status=pending');
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setPendingMatches(pendingData.matches || []);
      }

      // Fetch active matches
      const activeRes = await fetch('/api/betting/matches?status=active');
      const activeData = await activeRes.json();
      if (activeData.success) {
        setActiveMatches(activeData.matches || []);
      }

      // Fetch user's matches
      if (user?.currentTeamId) {
        const myRes = await fetch(`/api/betting/matches?teamId=${user.currentTeamId}`);
        const myData = await myRes.json();
        if (myData.success) {
          setMyMatches(myData.matches || []);
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }, [user?.currentTeamId]);

  // Authenticate with wallet signature
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    setIsLoading(true);

    try {
      // Get nonce
      const nonceRes = await fetch(`/api/betting/users?wallet=${address}&action=nonce`);
      const nonceData = await nonceRes.json();

      if (!nonceData.success) {
        return false;
      }

      // Sign message
      const signature = await signMessageAsync({ message: nonceData.message });

      // Verify
      const verifyRes = await fetch('/api/betting/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          signature,
          message: nonceData.message,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setUser(verifyData.user);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  // Team actions
  const createTeam = useCallback(async (name: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', wallet: address, teamName: name }),
    });

    const data = await res.json();
    if (data.success) {
      setTeam(data.team);
      await refreshUser();
    }
    return data;
  }, [address, refreshUser]);

  const inviteToTeam = useCallback(async (targetWallet: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invite', wallet: address, targetWallet }),
    });

    const data = await res.json();
    if (data.success) {
      setTeam(data.team);
    }
    return data;
  }, [address]);

  const acceptInvite = useCallback(async (teamId: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', wallet: address, teamId }),
    });

    const data = await res.json();
    if (data.success) {
      setTeam(data.team);
      await refreshUser();
      await refreshTeam();
    }
    return data;
  }, [address, refreshUser, refreshTeam]);

  const declineInvite = useCallback(async (teamId: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline', wallet: address, teamId }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshTeam();
    }
    return data;
  }, [address, refreshTeam]);

  const leaveTeam = useCallback(async () => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave', wallet: address }),
    });

    const data = await res.json();
    if (data.success) {
      setTeam(null);
      await refreshUser();
    }
    return data;
  }, [address, refreshUser]);

  // Match actions
  const createMatch = useCallback(async (buyIn: string) => {
    if (!address || !user?.currentTeamId) {
      return { success: false, error: 'Not in a team' };
    }

    const res = await fetch('/api/betting/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        wallet: address,
        teamId: user.currentTeamId,
        buyIn,
      }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshUser();
      await refreshMatches();
    }
    return data;
  }, [address, user?.currentTeamId, refreshUser, refreshMatches]);

  const acceptMatch = useCallback(async (matchId: string) => {
    if (!address || !user?.currentTeamId) {
      return { success: false, error: 'Not in a team' };
    }

    const res = await fetch('/api/betting/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'accept',
        wallet: address,
        matchId,
        teamId: user.currentTeamId,
      }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshUser();
      await refreshMatches();
    }
    return data;
  }, [address, user?.currentTeamId, refreshUser, refreshMatches]);

  const startMatch = useCallback(async (matchId: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', wallet: address, matchId }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshMatches();
    }
    return data;
  }, [address, refreshMatches]);

  const submitResult = useCallback(async (matchId: string, result: 'win' | 'loss', proofUrl?: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit_result', wallet: address, matchId, result, proofUrl }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshMatches();
    }
    return data;
  }, [address, refreshMatches]);

  const cancelMatch = useCallback(async (matchId: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', wallet: address, matchId }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshUser();
      await refreshMatches();
    }
    return data;
  }, [address, refreshUser, refreshMatches]);

  // Bet actions
  const placeBet = useCallback(async (matchId: string, teamId: string, amount: string) => {
    if (!address) return { success: false, error: 'Not connected' };

    const res = await fetch('/api/betting/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address, matchId, teamId, amount }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshUser();
    }
    return data;
  }, [address, refreshUser]);

  const getUserBets = useCallback(async (): Promise<Bet[]> => {
    if (!address) return [];

    try {
      const res = await fetch(`/api/betting/bets?wallet=${address}`);
      const data = await res.json();
      return data.success ? data.bets : [];
    } catch {
      return [];
    }
  }, [address]);

  // Effects
  useEffect(() => {
    if (isConnected && address) {
      refreshUser();
      refreshTeam();
    } else {
      setUser(null);
      setTeam(null);
      setIsAuthenticated(false);
    }
  }, [isConnected, address, refreshUser, refreshTeam]);

  useEffect(() => {
    if (user) {
      refreshMatches();
    }
  }, [user, refreshMatches]);

  // Refresh matches every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refreshMatches();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refreshMatches]);

  return (
    <BettingContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        team,
        pendingInvites,
        pendingMatches,
        activeMatches,
        myMatches,
        authenticate,
        refreshUser,
        refreshTeam,
        refreshMatches,
        createTeam,
        inviteToTeam,
        acceptInvite,
        declineInvite,
        leaveTeam,
        createMatch,
        acceptMatch,
        startMatch,
        submitResult,
        cancelMatch,
        placeBet,
        getUserBets,
      }}
    >
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within BettingProvider');
  }
  return context;
}
