"use client";
import { useState, useEffect } from 'react';

interface ScoreEntry {
  username: string;
  game: string;
  score: number;
  timestamp: number;
  // Common stats (used by multiple games)
  kills?: number;
  highestLevel?: number;
  // Alien Catacombs specific stats
  crystals?: number;
  healthDrops?: number;
  roomsExplored?: number;
}

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const games = [
    { key: "all", title: "All Games" },
    { key: "catacombs", title: "Alien AF", header: "/leaderboard-header-alienaf.png" },
    { key: "currencyofwar", title: "Currency of War", header: "/leaderboard-header-currencyofwar.png" },
    { key: "foxstead", title: "FoxStead", header: "/leaderboard-header-foxstead.png" },
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
      currencyofwar: [],
      foxstead: [],
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

  const getGameHeader = (gameKey: string) => {
    const game = games.find(g => g.key === gameKey);
    return game && 'header' in game ? game.header : null;
  };

  const rowPanels: { [key: string]: { src: string; slice: string; width: string } } = {
    catacombs: { src: '/leaderboard-row-alienaf.png', slice: '10 34', width: '24px' },
    foxstead: { src: '/leaderboard-row-foxstead.png', slice: '30 110', width: '46px' },
    currencyofwar: { src: '/leaderboard-row-currencyofwar.png', slice: '70', width: '36px' },
  };
  const getRowPanel = (gameKey: string) => rowPanels[gameKey] ?? null;

  const renderScoreRow = (entry: ScoreEntry, index: number, globalRank?: number) => {
    const rankToShow = globalRank !== undefined ? globalRank : index + 1;
    // Show stats for any game that has kills, highestLevel, or catacombs-specific stats
    const hasStats = entry.kills !== undefined || entry.highestLevel !== undefined || entry.crystals !== undefined || entry.healthDrops !== undefined || entry.roomsExplored !== undefined;
    const rowPanel = getRowPanel(entry.game);

    return (
      <div key={`${entry.username}-${entry.timestamp}`} style={rowPanel ? { padding: '6px 4px' } : undefined}>
        <div
          style={rowPanel ? {
            display: 'grid',
            gridTemplateColumns: selectedGame === "all" ? '80px 1fr 150px' : '80px 1fr 150px 200px',
            gap: '20px',
            padding: '18px 26px',
            borderWidth: rowPanel.width,
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderImage: `url(${rowPanel.src}) ${rowPanel.slice} / ${rowPanel.width} stretch`,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '14px',
            color: '#00ff99',
          } : {
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
            if (rowPanel) return;
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            if (rowPanel) return;
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
          {games.map((game) => {
            const hasHeader = 'header' in game && !!game.header;
            const isSelected = selectedGame === game.key;
            return (
              <button
                key={game.key}
                onClick={() => setSelectedGame(game.key)}
                style={hasHeader ? {
                  padding: 0,
                  background: 'transparent',
                  border: `2px solid ${isSelected ? '#00d4ff' : 'transparent'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: isSelected ? 1 : 0.7,
                  boxShadow: isSelected ? '0 0 20px rgba(0, 212, 255, 0.5)' : 'none',
                  transition: 'all 0.3s ease',
                } : {
                  padding: '10px 20px',
                  background: isSelected
                    ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                    : 'rgba(0, 212, 255, 0.1)',
                  color: isSelected ? '#000' : '#00d4ff',
                  border: `2px solid ${isSelected ? '#00d4ff' : '#00d4ff44'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 212, 255, 0.5)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (isSelected) return;
                  if (hasHeader) {
                    e.currentTarget.style.opacity = '1';
                  } else {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                    e.currentTarget.style.borderColor = '#00d4ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isSelected) return;
                  if (hasHeader) {
                    e.currentTarget.style.opacity = '0.7';
                  } else {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#00d4ff44';
                  }
                }}
              >
                {hasHeader ? (
                  <img
                    src={(game as { header: string }).header}
                    alt={game.title}
                    style={{ height: '36px', width: 'auto', display: 'block' }}
                  />
                ) : (
                  game.title
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Game Header */}
        {selectedGame !== 'all' && getGameHeader(selectedGame) && (
          <img
            src={getGameHeader(selectedGame) ?? ''}
            alt={getGameTitle(selectedGame)}
            style={{ display: 'block', maxWidth: '600px', width: '100%', height: 'auto', margin: '0 auto 20px' }}
          />
        )}

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
          (() => {
            const emptyPanel = selectedGame !== 'all' ? getRowPanel(selectedGame) : null;
            return (
              <div style={{
                textAlign: 'center',
                color: '#00ff99',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '16px',
                padding: '50px 20px',
                ...(emptyPanel ? {
                  borderWidth: emptyPanel.width,
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  borderImage: `url(${emptyPanel.src}) ${emptyPanel.slice} / ${emptyPanel.width} stretch`,
                } : {
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '2px solid #00d4ff44',
                  borderRadius: '12px',
                }),
              }}>
                No scores yet. Be the first to play and set a record!
              </div>
            );
          })()
        ) : selectedGame === "all" ? (
          // Show games in separate sections
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {Object.entries(groupedScores()).map(([gameKey, gameScores]) => {
              if (gameScores.length === 0) return null;

              return (
                <div key={gameKey}>
                  {/* Game Section Title */}
                  <img
                    src={getGameHeader(gameKey) ?? ''}
                    alt={getGameTitle(gameKey)}
                    style={{ display: 'block', width: '100%', height: 'auto', marginBottom: '4px' }}
                  />

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
