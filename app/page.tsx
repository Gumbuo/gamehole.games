"use client";
import { useState } from "react";
import Leaderboard from "./components/Leaderboard";
import Credits from "./components/Credits";
import MusicPlayer from "./components/MusicPlayer";
import { useGameScoreTracking } from "./hooks/useGameScoreTracking";

// Community Games
const communityGames = {
  catacombs: { title: "ALIEN AF", src: "/games/foxstead/index.html", badge: "ALPHA", image: "/alien-af-banner.png", description: "Shoot-em-up action — survive alien waves across multiple zones. World map, volcano world, catacombs. Grenades, guns, melee — Alien AF.", youtubeTrailer: "Fs-Hik2Lizo", youtubeStart: 6 },
  currencyofwar: { title: "Currency of War", badge: "COMING SOON", image: "/currency-of-war-banner.png", comingSoon: true, youtubeTrailer: "sBXsJJoiriw", youtubeStart: 14 },
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<"home" | "play" | "leaderboard" | "credits">("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', url: '', description: '', contact: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  useGameScoreTracking();

  const handleSubmitGame = () => {
    // For now, just show success - in future this could save to a database
    console.log('Game submission:', submitForm);
    setSubmitStatus('success');
    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmitForm({ title: '', url: '', description: '', contact: '' });
      setSubmitStatus('idle');
    }, 2000);
  };

  const playGame = (gameKey: string) => {
    setSelectedGame(gameKey);
    setActiveSection("play");
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 26, 0.95)',
        borderBottom: '2px solid #00d4ff',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Community Games Tabs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {Object.entries(communityGames).map(([key, game]) => {
                const isComingSoon = 'comingSoon' in game && game.comingSoon;
                return (
                <button
                  key={key}
                  onClick={() => { if (!isComingSoon) playGame(key); }}
                  style={{
                    padding: '6px 12px',
                    background: selectedGame === key && activeSection === "play" ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: selectedGame === key && activeSection === "play" ? '1px solid #00ff99' : '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '4px',
                    color: isComingSoon ? '#666' : (selectedGame === key && activeSection === "play" ? '#00ff99' : '#00d4ff'),
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    cursor: isComingSoon ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {game.title}
                </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {["home", "discover", "leaderboard", "credits"].map((section) => (
              <button
                key={section}
                onClick={() => { if (section === "discover") { window.location.href = "/discover"; return; } setActiveSection(section as any); setSelectedGame(null); }}
                style={{
                  padding: '8px 16px',
                  background: activeSection === section ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                  border: activeSection === section ? '1px solid #00d4ff' : '1px solid transparent',
                  borderRadius: '6px',
                  color: '#00d4ff',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {section}
              </button>
            ))}
            <a
              href="https://univershole.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '178px',
                height: '100px',
                textDecoration: 'none',
              }}
            >
              <img
                src="/pixel-shop-stall.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  pointerEvents: 'none',
                }}
              />
              <span style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '30px',
                color: '#2b1a0a',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Pixel Shop
              </span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeSection === "leaderboard" ? (
        <Leaderboard />
      ) : activeSection === "credits" ? (
        <Credits />
      ) : activeSection === "play" && selectedGame ? (
        <div style={{ width: '100%', height: 'calc(100vh - 70px)' }}>
          <div style={{
            padding: '10px 20px',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}>
              Now Playing: {communityGames[selectedGame as keyof typeof communityGames]?.title}
            </span>
            <button
              onClick={() => { setActiveSection("home"); setSelectedGame(null); }}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 0, 102, 0.2)',
                border: '1px solid #ff0066',
                borderRadius: '6px',
                color: '#ff0066',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ← Back to Games
            </button>
          </div>
          {(() => {
            const game = communityGames[selectedGame as keyof typeof communityGames];
            if (game && 'src' in game) {
              return (
                <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
                  <iframe
                    src={game.src}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={game.title}
                    allow="autoplay"
                  />
                </div>
              );
            }
            return null;
          })()}
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Hero Section — breaks out of the 1400px content column so the
              wide logo has room to render at full size without overflowing */}
          <section style={{
            textAlign: 'center',
            marginBottom: '60px',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}>
            <h1 style={{ margin: '0 0 20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo-gamehole-games.png"
                alt="GAMEHOLE.GAMES"
                style={{
                  width: '80vw',
                  maxWidth: '1100px',
                  height: 'auto',
                  imageRendering: 'pixelated',
                }}
              />
            </h1>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              color: '#888',
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto 30px',
            }}>
              Your destination for free browser games. Play our originals,
              discover community games, and share your own creations!
            </p>
          </section>

          {/* Community Games */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '28px',
                  color: '#00ff99',
                }}>
                  🕹️ Community Games
                </h2>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, #00ff99, #00cc77)',
                  borderRadius: '20px',
                  color: '#000',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                  Play Free
                </span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(0, 255, 153, 0.1)',
                  border: '2px solid #00ff99',
                  borderRadius: '8px',
                  color: '#00ff99',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                + Submit Your Game
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {Object.entries(communityGames).map(([key, game]) => {
                const hasImage = 'image' in game && game.image;
                const description = 'description' in game ? game.description : null;
                const isComingSoon = 'comingSoon' in game && game.comingSoon;
                const cardFrame = key === 'catacombs'
                  ? { src: 'url(/card-frame-alien.png) 45 90 / 28px stretch', width: '28px' }
                  : key === 'currencyofwar'
                  ? { src: 'url(/card-frame-mech.png) 40 40 / 24px stretch', width: '24px' }
                  : null;
                return (
                <div
                  key={key}
                  onClick={() => { if (!isComingSoon) playGame(key); }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 30, 0.8))',
                    border: `${cardFrame ? cardFrame.width : '2px'} solid ${isComingSoon ? '#ff6b0040' : '#00ff9940'}`,
                    borderImage: cardFrame ? cardFrame.src : undefined,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: isComingSoon ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isComingSoon) return;
                    e.currentTarget.style.borderColor = '#00ff99';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 153, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    if (isComingSoon) return;
                    e.currentTarget.style.borderColor = '#00ff9940';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {hasImage && (
                    <img
                      src={(game as { image: string }).image}
                      alt={game.title}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  )}
                  {'youtubeTrailer' in game && game.youtubeTrailer && (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${game.youtubeTrailer}${'youtubeStart' in game && game.youtubeStart ? `?start=${game.youtubeStart}` : ''}`}
                        title={`${game.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: description ? '10px' : '12px' }}>
                      <h3 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '18px',
                        color: '#00ff99',
                        margin: 0,
                      }}>
                        {game.title}
                      </h3>
                      <span style={{
                        padding: '3px 8px',
                        background: game.badge === 'NEW' ? 'rgba(255, 107, 0, 0.2)' : game.badge === 'ALPHA' ? 'rgba(0, 212, 255, 0.2)' : game.badge === 'COMING SOON' ? 'rgba(255, 107, 0, 0.2)' : 'rgba(0, 255, 153, 0.2)',
                        border: `1px solid ${game.badge === 'NEW' ? '#ff6b00' : game.badge === 'ALPHA' ? '#00d4ff' : game.badge === 'COMING SOON' ? '#ff6b00' : '#00ff99'}`,
                        borderRadius: '4px',
                        color: game.badge === 'NEW' ? '#ff6b00' : game.badge === 'ALPHA' ? '#00d4ff' : game.badge === 'COMING SOON' ? '#ff6b00' : '#00ff99',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}>
                        {game.badge}
                      </span>
                    </div>

                    {description && (
                      <p style={{
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '11px',
                        color: '#888',
                        margin: '0 0 10px 0',
                        lineHeight: '1.5',
                      }}>
                        {description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'inline-block',
                        padding: '8px 22px',
                        background: isComingSoon ? 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.05))' : 'linear-gradient(135deg, rgba(0,255,153,0.15), rgba(0,255,153,0.05))',
                        border: isComingSoon ? '1px solid #ff6b00' : '1px solid #00ff99',
                        borderRadius: '6px',
                        color: isComingSoon ? '#ff6b00' : '#00ff99',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        boxShadow: isComingSoon ? '0 0 12px rgba(255,107,0,0.25)' : '0 0 12px rgba(0,255,153,0.25)',
                        cursor: isComingSoon ? 'default' : 'pointer',
                      }}
                    >
                      {isComingSoon ? '⏳ COMING SOON' : '▶ PLAY NOW'}
                    </div>
                  </div>
                </div>
                );
              })}

              {/* FoxStead — MVP live, links out to univershole.ink */}
              <div
                onClick={() => window.open('https://univershole.ink', '_blank', 'noopener,noreferrer')}
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 30, 0.8))',
                  border: '28px solid rgba(255, 180, 50, 0.3)',
                  borderImage: 'url(/card-frame-farm.png) 55 90 / 28px stretch',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffb432';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 180, 50, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 180, 50, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <img
                  src="/foxstead-banner.png"
                  alt="FoxStead"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/qqFbayHgKZI"
                    title="FoxStead Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <h3 style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '18px',
                      color: '#ffb432',
                      margin: 0,
                    }}>
                      FoxStead
                    </h3>
                    <span style={{
                      padding: '3px 8px',
                      background: 'rgba(255, 180, 50, 0.15)',
                      border: '1px solid #ffb432',
                      borderRadius: '4px',
                      color: '#ffb432',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}>
                      MVP
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '11px',
                    color: '#888',
                    margin: '0 0 10px 0',
                    lineHeight: '1.5',
                  }}>
                    A chill farming and combat RPG — build your homestead, fight off alien invaders, and explore a living world.
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '8px 22px',
                      background: 'linear-gradient(135deg, rgba(255,180,50,0.15), rgba(255,180,50,0.05))',
                      border: '1px solid #ffb432',
                      borderRadius: '6px',
                      color: '#ffb432',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      boxShadow: '0 0 12px rgba(255,180,50,0.25)',
                    }}
                  >
                    ▶ PLAY NOW
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* About Section */}
          <section style={{ marginBottom: '80px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(0, 255, 153, 0.06))',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '20px',
              padding: '50px 40px',
              textAlign: 'center',
            }}>
              <h2 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '26px',
                color: '#00d4ff',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}>
                What is Game Hole?
              </h2>
              <p style={{
                fontFamily: 'Share Tech Mono, monospace',
                color: '#999',
                fontSize: '15px',
                maxWidth: '680px',
                margin: '0 auto 30px',
                lineHeight: '1.8',
              }}>
                Game Hole is a community-built hub for free browser games. We build and host our own originals like Alien AF, curate our favorite games from across the web, and run guild events for the games we actually play. No accounts required — just drop in and play.
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Games Hosted', value: '5+' },
                  { label: 'Free to Play', value: '100%' },
                  { label: 'No Sign-up', value: 'Ever' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: '20px 30px',
                    background: 'rgba(0, 212, 255, 0.08)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '12px',
                    minWidth: '130px',
                  }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '28px',
                      color: '#00ff99',
                      fontWeight: 'bold',
                      marginBottom: '6px',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '11px',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* Submit Game Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowSubmitModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
            border: '2px solid #00ff99',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 0 40px rgba(0, 255, 153, 0.3)',
          }} onClick={(e) => e.stopPropagation()}>
            {submitStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
                <h3 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '24px',
                  color: '#00ff99',
                  marginBottom: '10px',
                }}>
                  Submitted!
                </h3>
                <p style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  color: '#888',
                }}>
                  We'll review your game soon.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '22px',
                    color: '#00ff99',
                  }}>
                    Submit Your Game
                  </h3>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#666',
                      fontSize: '24px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Game Title"
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid #00ff9940',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '14px',
                    }}
                  />
                  <input
                    type="url"
                    placeholder="Game URL (playable link)"
                    value={submitForm.url}
                    onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid #00ff9940',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '14px',
                    }}
                  />
                  <textarea
                    placeholder="Short description"
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    rows={3}
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid #00ff9940',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Contact (Discord, Twitter, or Email)"
                    value={submitForm.contact}
                    onChange={(e) => setSubmitForm({ ...submitForm, contact: e.target.value })}
                    style={{
                      padding: '12px 15px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid #00ff9940',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={handleSubmitGame}
                    disabled={!submitForm.title || !submitForm.url}
                    style={{
                      padding: '14px',
                      background: submitForm.title && submitForm.url
                        ? 'linear-gradient(135deg, #00ff99, #00cc77)'
                        : 'rgba(0, 255, 153, 0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      color: submitForm.title && submitForm.url ? '#000' : '#666',
                      fontFamily: 'Orbitron, sans-serif',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: submitForm.title && submitForm.url ? 'pointer' : 'not-allowed',
                      textTransform: 'uppercase',
                      marginTop: '10px',
                    }}
                  >
                    Submit Game
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0, 212, 255, 0.2)',
        padding: '30px 20px',
        textAlign: 'center',
        marginTop: '60px',
      }}>
        <p style={{
          fontFamily: 'Share Tech Mono, monospace',
          color: '#666',
          fontSize: '12px',
        }}>
          © 2024 Game Hole | A Community Gaming Hub | Not affiliated with featured games
        </p>
      </footer>
    </div>
  );
}
