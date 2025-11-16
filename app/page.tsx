"use client";
import { useState } from "react";

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState("catacombs");

  const games = {
    catacombs: { title: "Alien Catacombs", src: "/alien-catacombs.html" },
    dungeon: { title: "Dungeon Crawler", src: "/gumbuo-dungeon-crawler.html" },
    invasion: { title: "Gumbuo Invasion", src: "/gumbuo-invasion.html" },
    // Add more games here as they become available
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Game Selector */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)',
        borderBottom: '2px solid #00d4ff',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(0, 212, 255, 0.3)',
        }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #00d4ff, #00ff99)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            GAME HOLE
          </h1>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace',
            color: '#00d4ff',
            fontSize: '14px',
            marginTop: '8px',
          }}>
            Browser Games Collection
          </p>
        </div>

        {/* Game Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {Object.entries(games).map(([key, game]) => (
            <button
              key={key}
              onClick={() => setSelectedGame(key)}
              style={{
                padding: '12px 24px',
                background: selectedGame === key
                  ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                  : 'rgba(0, 212, 255, 0.1)',
                color: selectedGame === key ? '#000' : '#00d4ff',
                border: `2px solid ${selectedGame === key ? '#00d4ff' : '#00d4ff44'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '14px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: selectedGame === key
                  ? '0 0 20px rgba(0, 212, 255, 0.5)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedGame !== key) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                  e.currentTarget.style.borderColor = '#00d4ff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGame !== key) {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#00d4ff44';
                }
              }}
            >
              {game.title}
            </button>
          ))}
        </div>
      </div>

      {/* Game Display */}
      <div style={{
        width: '100%',
        height: 'calc(100vh - 140px)',
        overflow: 'hidden'
      }}>
        {(() => {
          const game = games[selectedGame as keyof typeof games];
          if (!game) return null;

          return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Alpha Build Notice */}
              {selectedGame === "catacombs" && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: 1000,
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(0, 153, 204, 0.95))',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '2px solid #00d4ff',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)',
                  fontFamily: 'Orbitron, sans-serif',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  maxWidth: '250px'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>⚠️ ALPHA BUILD</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>This build changes daily</div>
                </div>
              )}
              <iframe
                key={selectedGame}
                src={game.src}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title={game.title}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
