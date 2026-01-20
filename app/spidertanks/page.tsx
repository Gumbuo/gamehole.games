"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { BettingProvider, useBetting } from '../context/BettingContext';
import { formatEthFromWei, parseEthToWei, calculateOdds } from '../lib/betting/constants';
import { Match } from '../lib/betting/types';

// Main betting page content
function BettingContent() {
  const { address, isConnected } = useAccount();
  const {
    user,
    team,
    pendingInvites,
    pendingMatches,
    activeMatches,
    myMatches,
    authenticate,
    isAuthenticated,
    createTeam,
    inviteToTeam,
    acceptInvite,
    leaveTeam,
    createMatch,
    acceptMatch,
    startMatch,
    submitResult,
    cancelMatch,
    placeBet,
    refreshUser,
    refreshMatches,
  } = useBetting();

  const [activeTab, setActiveTab] = useState<'lobby' | 'myteam' | 'mybets'>('lobby');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showBetModal, setShowBetModal] = useState<Match | null>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteAddress, setInviteAddress] = useState('');
  const [buyInAmount, setBuyInAmount] = useState('0.01');
  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedTeamToBet, setSelectedTeamToBet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    setLoading(true);
    const result = await createTeam(teamName);
    setLoading(false);
    if (result.success) {
      showMessage('success', `Team "${teamName}" created!`);
      setShowCreateTeam(false);
      setTeamName('');
    } else {
      showMessage('error', result.error || 'Failed to create team');
    }
  };

  // Handle invite
  const handleInvite = async () => {
    if (!inviteAddress.trim()) return;
    setLoading(true);
    const result = await inviteToTeam(inviteAddress);
    setLoading(false);
    if (result.success) {
      showMessage('success', 'Invitation sent!');
      setInviteAddress('');
    } else {
      showMessage('error', result.error || 'Failed to send invite');
    }
  };

  // Handle match creation
  const handleCreateMatch = async () => {
    setLoading(true);
    const buyInWei = parseEthToWei(buyInAmount);
    const result = await createMatch(buyInWei);
    setLoading(false);
    if (result.success) {
      showMessage('success', 'Match created! Waiting for opponent.');
      setShowCreateMatch(false);
    } else {
      showMessage('error', result.error || 'Failed to create match');
    }
  };

  // Handle accept match
  const handleAcceptMatch = async (matchId: string) => {
    setLoading(true);
    const result = await acceptMatch(matchId);
    setLoading(false);
    if (result.success) {
      showMessage('success', 'Match accepted! Betting is now open.');
    } else {
      showMessage('error', result.error || 'Failed to accept match');
    }
  };

  // Handle place bet
  const handlePlaceBet = async () => {
    if (!showBetModal || !selectedTeamToBet) return;
    setLoading(true);
    const betWei = parseEthToWei(betAmount);
    const result = await placeBet(showBetModal.id, selectedTeamToBet, betWei);
    setLoading(false);
    if (result.success) {
      showMessage('success', 'Bet placed!');
      setShowBetModal(null);
      setSelectedTeamToBet(null);
      setBetAmount('0.01');
    } else {
      showMessage('error', result.error || 'Failed to place bet');
    }
  };

  // Calculate odds for display
  const getOdds = (match: Match, teamId: string) => {
    return calculateOdds(
      match.totalBetsTeam1,
      match.totalBetsTeam2,
      teamId,
      match.team1Id
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a00 50%, #0f0f1e 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(10, 10, 26, 0.95)',
        borderBottom: '2px solid #ff6b00',
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '24px',
                background: 'linear-gradient(90deg, #ff6b00, #ff8c00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                SPIDER TANKS BETTING
              </h1>
            </a>
            {user && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255, 107, 0, 0.1)',
                border: '1px solid #ff6b00',
                borderRadius: '8px',
              }}>
                <span style={{ color: '#888', fontSize: '12px' }}>Balance: </span>
                <span style={{ color: '#ff6b00', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                  {formatEthFromWei(user.platformBalance)} ETH
                </span>
              </div>
            )}
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          padding: '15px 25px',
          background: message.type === 'success' ? 'rgba(0, 255, 153, 0.2)' : 'rgba(255, 0, 102, 0.2)',
          border: `1px solid ${message.type === 'success' ? '#00ff99' : '#ff0066'}`,
          borderRadius: '8px',
          color: message.type === 'success' ? '#00ff99' : '#ff0066',
          fontFamily: 'Share Tech Mono, monospace',
          zIndex: 1000,
        }}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {!isConnected ? (
          // Not connected state
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '36px',
              color: '#ff6b00',
              marginBottom: '20px',
            }}>
              Connect Wallet to Start
            </h2>
            <p style={{ color: '#888', marginBottom: '30px', fontFamily: 'Share Tech Mono, monospace' }}>
              Create or join a team, challenge opponents, and bet on Spider Tanks 3v3 matches!
            </p>
            <ConnectButton />
          </div>
        ) : !isAuthenticated ? (
          // Connected but not authenticated
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              color: '#ff6b00',
              marginBottom: '20px',
            }}>
              Verify Your Wallet
            </h2>
            <p style={{ color: '#888', marginBottom: '30px', fontFamily: 'Share Tech Mono, monospace' }}>
              Sign a message to verify wallet ownership (no gas required)
            </p>
            <button
              onClick={authenticate}
              disabled={loading}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Signing...' : 'Sign to Authenticate'}
            </button>
          </div>
        ) : (
          // Authenticated - show main UI
          <>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              {['lobby', 'myteam', 'mybets'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    padding: '12px 24px',
                    background: activeTab === tab ? 'rgba(255, 107, 0, 0.2)' : 'transparent',
                    border: activeTab === tab ? '2px solid #ff6b00' : '2px solid #333',
                    borderRadius: '8px',
                    color: activeTab === tab ? '#ff6b00' : '#666',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {tab === 'lobby' ? 'Match Lobby' : tab === 'myteam' ? 'My Team' : 'My Bets'}
                </button>
              ))}
            </div>

            {/* Lobby Tab */}
            {activeTab === 'lobby' && (
              <div>
                {/* Create Match Button */}
                {team && team.members.length >= 3 && (
                  <button
                    onClick={() => setShowCreateMatch(true)}
                    style={{
                      padding: '15px 30px',
                      background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginBottom: '30px',
                    }}
                  >
                    + Create Match
                  </button>
                )}

                {/* Active Matches (betting open) */}
                <h3 style={{ color: '#00ff99', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
                  Live Matches - Betting Open
                </h3>
                {activeMatches.filter(m => m.status === 'ready' && !m.bettingClosed).length === 0 ? (
                  <p style={{ color: '#666', marginBottom: '30px' }}>No live matches with open betting</p>
                ) : (
                  <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
                    {activeMatches
                      .filter(m => m.status === 'ready' && !m.bettingClosed)
                      .map((match) => (
                        <div
                          key={match.id}
                          style={{
                            background: 'rgba(26, 26, 46, 0.8)',
                            border: '2px solid #00ff99',
                            borderRadius: '12px',
                            padding: '20px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <span style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', fontSize: '18px' }}>
                                {match.team1Name}
                              </span>
                              <span style={{ color: '#666' }}>vs</span>
                              <span style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', fontSize: '18px' }}>
                                {match.team2Name}
                              </span>
                            </div>
                            <span style={{
                              padding: '4px 12px',
                              background: 'rgba(0, 255, 153, 0.2)',
                              borderRadius: '20px',
                              color: '#00ff99',
                              fontSize: '12px',
                            }}>
                              BETTING OPEN
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '10px',
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ color: '#888', fontSize: '12px' }}>{match.team1Name} Odds</div>
                              <div style={{ color: '#00ff99', fontSize: '20px', fontFamily: 'Orbitron, sans-serif' }}>
                                {getOdds(match, match.team1Id).toFixed(2)}x
                              </div>
                              <div style={{ color: '#666', fontSize: '11px' }}>
                                Pool: {formatEthFromWei(match.totalBetsTeam1)} ETH
                              </div>
                            </div>
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              padding: '10px',
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ color: '#888', fontSize: '12px' }}>{match.team2Name} Odds</div>
                              <div style={{ color: '#00ff99', fontSize: '20px', fontFamily: 'Orbitron, sans-serif' }}>
                                {getOdds(match, match.team2Id!).toFixed(2)}x
                              </div>
                              <div style={{ color: '#666', fontSize: '11px' }}>
                                Pool: {formatEthFromWei(match.totalBetsTeam2)} ETH
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#888', fontSize: '12px' }}>
                              Buy-in: {formatEthFromWei(match.buyIn)} ETH per team
                            </span>
                            <button
                              onClick={() => setShowBetModal(match)}
                              style={{
                                padding: '10px 25px',
                                background: 'linear-gradient(135deg, #00ff99, #00cc77)',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#000',
                                fontFamily: 'Orbitron, sans-serif',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Place Bet
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Pending Matches (looking for opponent) */}
                <h3 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
                  Open Challenges - Looking for Opponents
                </h3>
                {pendingMatches.length === 0 ? (
                  <p style={{ color: '#666' }}>No open challenges</p>
                ) : (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {pendingMatches.map((match) => (
                      <div
                        key={match.id}
                        style={{
                          background: 'rgba(26, 26, 46, 0.8)',
                          border: '2px solid #ff6b0040',
                          borderRadius: '12px',
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <span style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', fontSize: '16px' }}>
                            {match.team1Name}
                          </span>
                          <span style={{ color: '#666', marginLeft: '15px' }}>
                            Buy-in: {formatEthFromWei(match.buyIn)} ETH
                          </span>
                        </div>
                        {team && team.members.length >= 3 && team.id !== match.team1Id && (
                          <button
                            onClick={() => handleAcceptMatch(match.id)}
                            disabled={loading}
                            style={{
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#000',
                              fontFamily: 'Orbitron, sans-serif',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Accept Challenge
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Team Tab */}
            {activeTab === 'myteam' && (
              <div>
                {!team ? (
                  // No team - show create team UI
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
                      You're not in a team yet
                    </h3>

                    {/* Pending Invites */}
                    {pendingInvites.length > 0 && (
                      <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ color: '#00ff99', marginBottom: '15px' }}>Pending Invites</h4>
                        {pendingInvites.map((invTeam) => (
                          <div
                            key={invTeam.id}
                            style={{
                              background: 'rgba(0, 255, 153, 0.1)',
                              border: '1px solid #00ff99',
                              borderRadius: '8px',
                              padding: '15px',
                              marginBottom: '10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ color: '#fff' }}>{invTeam.name}</span>
                            <button
                              onClick={() => acceptInvite(invTeam.id)}
                              style={{
                                padding: '8px 20px',
                                background: '#00ff99',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#000',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              Join
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showCreateTeam ? (
                      <button
                        onClick={() => setShowCreateTeam(true)}
                        style={{
                          padding: '15px 40px',
                          background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#000',
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          cursor: 'pointer',
                        }}
                      >
                        Create Team
                      </button>
                    ) : (
                      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="Team Name"
                          style={{
                            width: '100%',
                            padding: '15px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid #ff6b00',
                            borderRadius: '8px',
                            color: '#fff',
                            fontFamily: 'Share Tech Mono, monospace',
                            marginBottom: '15px',
                          }}
                        />
                        <button
                          onClick={handleCreateTeam}
                          disabled={loading || !teamName.trim()}
                          style={{
                            width: '100%',
                            padding: '15px',
                            background: teamName.trim() ? 'linear-gradient(135deg, #ff6b00, #ff8c00)' : '#333',
                            border: 'none',
                            borderRadius: '8px',
                            color: teamName.trim() ? '#000' : '#666',
                            fontFamily: 'Orbitron, sans-serif',
                            fontWeight: 'bold',
                            cursor: teamName.trim() ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {loading ? 'Creating...' : 'Create Team'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Has team - show team info
                  <div>
                    <div style={{
                      background: 'rgba(26, 26, 46, 0.8)',
                      border: '2px solid #ff6b00',
                      borderRadius: '12px',
                      padding: '25px',
                      marginBottom: '30px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', fontSize: '24px' }}>
                          {team.name}
                        </h3>
                        <span style={{
                          padding: '5px 15px',
                          background: team.members.length >= 3 ? 'rgba(0, 255, 153, 0.2)' : 'rgba(255, 107, 0, 0.2)',
                          borderRadius: '20px',
                          color: team.members.length >= 3 ? '#00ff99' : '#ff6b00',
                          fontSize: '12px',
                        }}>
                          {team.members.length}/3 Members
                        </span>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#888', marginBottom: '10px' }}>Team Members:</div>
                        {team.members.map((member) => (
                          <div
                            key={member}
                            style={{
                              padding: '10px 15px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '6px',
                              marginBottom: '5px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ color: '#fff', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px' }}>
                              {member.slice(0, 6)}...{member.slice(-4)}
                            </span>
                            {member === team.captain && (
                              <span style={{ color: '#ffd700', fontSize: '11px' }}>CAPTAIN</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {team.captain === address?.toLowerCase() && team.members.length < 3 && (
                        <div style={{ marginBottom: '20px' }}>
                          <input
                            type="text"
                            value={inviteAddress}
                            onChange={(e) => setInviteAddress(e.target.value)}
                            placeholder="Wallet address to invite"
                            style={{
                              width: 'calc(100% - 120px)',
                              padding: '12px',
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid #666',
                              borderRadius: '6px',
                              color: '#fff',
                              fontFamily: 'Share Tech Mono, monospace',
                              marginRight: '10px',
                            }}
                          />
                          <button
                            onClick={handleInvite}
                            disabled={loading || !inviteAddress.trim()}
                            style={{
                              padding: '12px 20px',
                              background: '#00ff99',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#000',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                            }}
                          >
                            Invite
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#888', fontSize: '14px' }}>
                          W: {team.wins} | L: {team.losses} | Earnings: {formatEthFromWei(team.totalEarnings)} ETH
                        </div>
                        <button
                          onClick={leaveTeam}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid #ff0066',
                            borderRadius: '6px',
                            color: '#ff0066',
                            cursor: 'pointer',
                          }}
                        >
                          Leave Team
                        </button>
                      </div>
                    </div>

                    {/* My Matches */}
                    <h4 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', marginBottom: '15px' }}>
                      My Team's Matches
                    </h4>
                    {myMatches.length === 0 ? (
                      <p style={{ color: '#666' }}>No matches yet</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '15px' }}>
                        {myMatches.map((match) => (
                          <div
                            key={match.id}
                            style={{
                              background: 'rgba(26, 26, 46, 0.8)',
                              border: '1px solid #ff6b0040',
                              borderRadius: '8px',
                              padding: '15px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#fff' }}>
                                {match.team1Name} vs {match.team2Name || 'Waiting...'}
                              </span>
                              <span style={{
                                padding: '3px 10px',
                                background: match.status === 'completed' ? 'rgba(0, 255, 153, 0.2)' : 'rgba(255, 107, 0, 0.2)',
                                borderRadius: '12px',
                                color: match.status === 'completed' ? '#00ff99' : '#ff6b00',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                              }}>
                                {match.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* My Bets Tab */}
            {activeTab === 'mybets' && (
              <div>
                <h3 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
                  My Betting History
                </h3>
                <p style={{ color: '#666' }}>Coming soon: View your bet history here</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Match Modal */}
      {showCreateMatch && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowCreateMatch(false)}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
              border: '2px solid #ff6b00',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#ff6b00', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
              Create Match
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#888', display: 'block', marginBottom: '8px' }}>
                Buy-in Amount (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #ff6b00',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'Share Tech Mono, monospace',
                }}
              />
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                Both teams must match this buy-in. Winner takes pot minus 5% fee.
              </p>
            </div>
            <button
              onClick={handleCreateMatch}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </div>
      )}

      {/* Place Bet Modal */}
      {showBetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowBetModal(null)}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
              border: '2px solid #00ff99',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#00ff99', fontFamily: 'Orbitron, sans-serif', marginBottom: '20px' }}>
              Place Bet
            </h3>

            {/* Team Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <button
                onClick={() => setSelectedTeamToBet(showBetModal.team1Id)}
                style={{
                  padding: '15px',
                  background: selectedTeamToBet === showBetModal.team1Id ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  border: selectedTeamToBet === showBetModal.team1Id ? '2px solid #00ff99' : '2px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>{showBetModal.team1Name}</div>
                <div style={{ color: '#00ff99', fontSize: '18px', fontFamily: 'Orbitron, sans-serif' }}>
                  {getOdds(showBetModal, showBetModal.team1Id).toFixed(2)}x
                </div>
              </button>
              <button
                onClick={() => setSelectedTeamToBet(showBetModal.team2Id!)}
                style={{
                  padding: '15px',
                  background: selectedTeamToBet === showBetModal.team2Id ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  border: selectedTeamToBet === showBetModal.team2Id ? '2px solid #00ff99' : '2px solid #333',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>{showBetModal.team2Name}</div>
                <div style={{ color: '#00ff99', fontSize: '18px', fontFamily: 'Orbitron, sans-serif' }}>
                  {getOdds(showBetModal, showBetModal.team2Id!).toFixed(2)}x
                </div>
              </button>
            </div>

            {/* Bet Amount */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#888', display: 'block', marginBottom: '8px' }}>Bet Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="0.5"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #00ff99',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'Share Tech Mono, monospace',
                }}
              />
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                Your balance: {formatEthFromWei(user?.platformBalance || '0')} ETH
              </p>
            </div>

            <button
              onClick={handlePlaceBet}
              disabled={loading || !selectedTeamToBet}
              style={{
                width: '100%',
                padding: '15px',
                background: selectedTeamToBet ? 'linear-gradient(135deg, #00ff99, #00cc77)' : '#333',
                border: 'none',
                borderRadius: '8px',
                color: selectedTeamToBet ? '#000' : '#666',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                cursor: selectedTeamToBet ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Placing Bet...' : 'Place Bet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with provider
export default function SpiderTanksBetting() {
  return (
    <BettingProvider>
      <BettingContent />
    </BettingProvider>
  );
}
