"use client";
import { useState, useEffect } from 'react';

interface ScoreEntry {
  username: string;
  game: string;
  score: number;
  timestamp: number;
  // Alien Catacombs specific stats
  kills?: number;
  crystals?: number;
  healthDrops?: number;
  roomsExplored?: number;
  highestLevel?: number;
}

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const games = [
    { key: "all", title: "All Games" },
    { key: "catacombs", title: "Alien Catacombs" },
    { key: "dungeon", title: "Dungeon Crawler" },
    { key: "invasion", title: "Gumbuo Invasion" },
  ];

  useEffect(() => {
    fetchScores();
  }, [selectedGame]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const url = selectedGame === "all"
        ? '/api/scores?limit=50'
        : `/api/scores?game=${selectedGame}&limit=50`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group scores by game for "All Games" view
  const groupedScores = () => {
    const groups: { [key: string]: ScoreEntry[] } = {
      catacombs: [],
      dungeon: [],
      invasion: [],
    };

    scores.forEach((score) => {
      if (groups[score.game]) {
        groups[score.game].push(score);
      }
    });

    return groups;
  };

  const getGameTitle = (gameKey: string) => {
    const game = games.find(g => g.key === gameKey);
    return game ? game.title : gameKey;
  };

  const renderScoreRow = (entry: ScoreEntry, index: number, globalRank?: number) => {
    const rankToShow = globalRank !== undefined ? globalRank : index + 1;
    const isCatacombs = entry.game === 'catacombs';
    const hasStats = isCatacombs && (entry.kills !== undefined || entry.crystals !== undefined || entry.healthDrops !== undefined || entry.roomsExplored !== undefined || entry.highestLevel !== undefined);

    return (
      <div key={`${entry.username}-${entry.timestamp}`}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selectedGame === "all" ? '80px 1fr 150px' : '80px 1fr 150px 200px',
            gap: '20px',
            padding: '20px',
            borderBottom: hasStats ? 'none' : '1px solid rgba(0, 212, 255, 0.2)',
            background: index % 2 === 0 ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '14px',
            color: '#00ff99',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0, 212, 255, 0.05)' : 'transparent';
          }}
        >
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            fontSize: '18px',
            color: rankToShow === 1 ? '#FFD700' : rankToShow === 2 ? '#C0C0C0' : rankToShow === 3 ? '#CD7F32' : '#00d4ff',
          }}>
            #{rankToShow}
          </div>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {entry.username}
          </div>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            color: '#00d4ff',
          }}>
            {entry.score.toLocaleString()}
          </div>
          {selectedGame !== "all" && (
            <div style={{
              fontSize: '12px',
              color: '#00d4ff',
              opacity: 0.8,
            }}>
              {getGameTitle(entry.game)}
            </div>
          )}
        </div>

        {/* Catacombs Detailed Stats */}
        {hasStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedGame === "all" ? '80px 1fr' : '80px 1fr 200px',
            gap: '20px',
            padding: '10px 20px 15px 20px',
            borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
            background: index % 2 === 0 ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 212, 255, 0.03)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '12px',
            color: '#00ff99',
            opacity: 0.85,
          }}>
            <div></div>
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
              {entry.kills !== undefined && (
                <span>Kills: <strong style={{ color: '#00d4ff' }}>{entry.kills}</strong></span>
              )}
              {entry.crystals !== undefined && (
                <span>Crystals: <strong style={{ color: '#00d4ff' }}>{entry.crystals}</strong></span>
              )}
              {entry.healthDrops !== undefined && (
                <span>Health Drops: <strong style={{ color: '#00d4ff' }}>{entry.healthDrops}</strong></span>
              )}
              {entry.roomsExplored !== undefined && (
                <span>Rooms Explored: <strong style={{ color: '#00d4ff' }}>{entry.roomsExplored}</strong></span>
              )}
              {entry.highestLevel !== undefined && (
                <span>Highest Level: <strong style={{ color: '#00d4ff' }}>{entry.highestLevel}</strong></span>
              )}
            </div>
            {selectedGame !== "all" && <div></div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, #0f0f1e, #1a1a2e)',
      padding: '40px',
      overflow: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '48px',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #00d4ff, #00ff99)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          LEADERBOARD
        </h1>

        <p style={{
          fontFamily: 'Share Tech Mono, monospace',
          color: '#00d4ff',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          Top players across all Game Hole games
        </p>

        {/* Game Filter */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
        }}>
          {games.map((game) => (
            <button
              key={game.key}
              onClick={() => setSelectedGame(game.key)}
              style={{
                padding: '10px 20px',
                background: selectedGame === game.key
                  ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                  : 'rgba(0, 212, 255, 0.1)',
                color: selectedGame === game.key ? '#000' : '#00d4ff',
                border: `2px solid ${selectedGame === game.key ? '#00d4ff' : '#00d4ff44'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: selectedGame === game.key
                  ? '0 0 20px rgba(0, 212, 255, 0.5)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedGame !== game.key) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.borderColor = '#00d4ff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGame !== game.key) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#00d4ff44';
                }
              }}
            >
              {game.title}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            color: '#00d4ff',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '18px',
            padding: '40px',
          }}>
            Loading scores...
          </div>
        ) : scores.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#00ff99',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '16px',
            padding: '40px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '2px solid #00d4ff44',
            borderRadius: '12px',
          }}>
            No scores yet. Be the first to play and set a record!
          </div>
        ) : selectedGame === "all" ? (
          // Show games in separate sections
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {Object.entries(groupedScores()).map(([gameKey, gameScores]) => {
              if (gameScores.length === 0) return null;

              return (
                <div key={gameKey} style={{
                  background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
                  border: '2px solid #00d4ff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
                }}>
                  {/* Game Section Title */}
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: '#000',
                    textTransform: 'uppercase',
                    borderBottom: '2px solid #00d4ff',
                  }}>
                    {getGameTitle(gameKey)}
                  </div>

                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 150px',
                    gap: '20px',
                    padding: '15px 20px',
                    background: 'rgba(0, 212, 255, 0.2)',
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#00d4ff',
                    textTransform: 'uppercase',
                  }}>
                    <div>Rank</div>
                    <div>Player</div>
                    <div>Score</div>
                  </div>

                  {/* Table Rows - Show top 10 per game */}
                  {gameScores.slice(0, 10).map((entry, index) => renderScoreRow(entry, index))}
                </div>
              );
            })}
          </div>
        ) : (
          // Show single game leaderboard
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00d4ff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 150px 200px',
              gap: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#000',
              textTransform: 'uppercase',
            }}>
              <div>Rank</div>
              <div>Player</div>
              <div>Score</div>
              <div>Game</div>
            </div>

            {/* Table Rows */}
            {scores.map((entry, index) => renderScoreRow(entry, index))}
          </div>
        )}

        {/* Footer Note */}
        <p style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '30px',
          textAlign: 'center',
          fontFamily: 'Share Tech Mono, monospace',
        }}>
          Scores are tracked globally across all users. Play games to appear on the leaderboard!
        </p>
      </div>
    </div>
  );
}
