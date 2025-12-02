"use client";
import { useState, useEffect, useRef } from "react";
import Leaderboard from "./components/Leaderboard";
import Credits from "./components/Credits";
import { useGameScoreTracking } from "./hooks/useGameScoreTracking";

// Add more videos to this array as needed
const AD_VIDEOS = [
  "/Fox_Fights_Alien_Wins_Video.mp4",
  "/can_you_make_these_character.mp4",
  "/Fox_and_Alien_Battle_Video.mp4",
];

// Featured Crypto Games
interface FeaturedGame {
  id: string;
  title: string;
  description: string;
  image: string;
  playUrl: string;
  tags: string[];
  color: string;
  secondaryColor?: string;
}

const featuredGames: FeaturedGame[] = [
  {
    id: "offthegrid",
    title: "Off The Grid",
    description: "AAA battle royale with deep narrative and player-driven economy. Free-to-play cyberpunk action on Avalanche.",
    image: "/featured/off-the-grid.png",
    playUrl: "https://offthegrid.com/",
    tags: ["Battle Royale", "AAA", "Avalanche"],
    color: "#00ffcc",
    secondaryColor: "#0a1a1a",
  },
  {
    id: "spidertanks",
    title: "Spider Tanks",
    description: "PvP brawler where you battle in arenas with customizable tanks. Web2 & Web3 gaming on Immutable X.",
    image: "/featured/spider-tanks.png",
    playUrl: "https://www.spidertanks.game/",
    tags: ["PvP", "Web2/Web3", "Immutable X"],
    color: "#ff6b00",
  },
  {
    id: "playa3ull",
    title: "Playa3ull Games",
    description: "Gaming ecosystem with multiple titles including Nexus, Starvin Martian, Dogs of War, and more. Play, compete, and earn!",
    image: "/featured/playa3ull-logo.webp",
    playUrl: "https://playa3ull.games/",
    tags: ["Ecosystem", "Multi-Game", "3ULL Token"],
    color: "#00ff66",
  },
  {
    id: "infinityrising",
    title: "Infinity Rising",
    description: "Epic action RPG with stunning visuals and blockchain rewards. Build your hero and conquer dungeons!",
    image: "/featured/infinity-rising.png",
    playUrl: "https://infinityrising.io/",
    tags: ["RPG", "Action", "NFT"],
    color: "#ff0033",
    secondaryColor: "#1a1a1a",
  },
  {
    id: "machinesarena",
    title: "The Machines Arena",
    description: "Fast-paced 4v4 hero shooter with top-down PvP battles. Earn digital collectibles on the Ronin chain.",
    image: "/featured/machines-arena.png",
    playUrl: "https://www.themachinesarena.com/",
    tags: ["Hero Shooter", "4v4 PvP", "Ronin"],
    color: "#e63946",
    secondaryColor: "#1d3557",
  },
  {
    id: "captaincompany",
    title: "Captain & Company",
    description: "128-player naval battle MMORPG. Command ships, recruit pirates, and battle for treasure on the high seas.",
    image: "/featured/captain-company.png",
    playUrl: "https://capnco.gg/",
    tags: ["MMORPG", "Naval Combat", "Polygon"],
    color: "#d4af37",
    secondaryColor: "#1a0a00",
  },
];

// Community Games
const communityGames = {
  catacombs: { title: "Alien Catacombs", src: "/alien-catacombs.html", badge: "ALPHA" },
  dungeon: { title: "Dungeon Crawler", src: "/gumbuo-dungeon-crawler.html", badge: "COMMUNITY" },
  invasion: { title: "Gumbuo Invasion", src: "/gumbuo-invasion.html", badge: "COMMUNITY" },
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<"home" | "play" | "leaderboard" | "credits">("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', url: '', description: '', contact: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  // Video ad state
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useGameScoreTracking();

  // Show video popup on page load with rotation
  useEffect(() => {
    const lastPlayed = localStorage.getItem("lastVideoAdGamehole");
    let availableVideos = AD_VIDEOS;
    if (lastPlayed && AD_VIDEOS.length > 1) {
      availableVideos = AD_VIDEOS.filter(v => v !== lastPlayed);
    }
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    const selected = availableVideos[randomIndex];
    localStorage.setItem("lastVideoAdGamehole", selected);
    setSelectedVideo(selected);
    setShowVideo(true);
  }, []);

  // Handle video autoplay with unmute
  useEffect(() => {
    if (showVideo && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.play().then(() => {
        video.muted = false;
      }).catch(() => {
        video.muted = true;
      });
    }
  }, [showVideo]);

  const closeVideo = () => {
    setShowVideo(false);
  };

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)' }}>
      {/* Video Popup Modal */}
      {showVideo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 16px' }}>
            {/* Close Button */}
            <button
              onClick={closeVideo}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              ×
            </button>
            {/* Video Container */}
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
              border: '4px solid #00d4ff',
            }}>
              <video
                ref={videoRef}
                autoPlay
                controls
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onEnded={closeVideo}
              >
                {selectedVideo && <source src={selectedVideo} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>
            </div>
            {/* Play Button */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => videoRef.current?.play()}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #00d4ff, #00ff99)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ▶ Play Video
              </button>
            </div>
          </div>
        </div>
      )}

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
          <h1
            onClick={() => { setActiveSection("home"); setSelectedGame(null); }}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00d4ff, #00ff99)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            GAME HOLE
          </h1>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {["home", "leaderboard", "credits"].map((section) => (
              <button
                key={section}
                onClick={() => { setActiveSection(section as any); setSelectedGame(null); }}
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
          <iframe
            src={communityGames[selectedGame as keyof typeof communityGames]?.src}
            style={{ width: '100%', height: 'calc(100% - 50px)', border: 'none' }}
            title={communityGames[selectedGame as keyof typeof communityGames]?.title}
          />
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Hero Section */}
          <section style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #00d4ff, #00ff99, #ff6b00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '20px',
            }}>
              GAME HOLE
            </h1>
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              color: '#888',
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto 30px',
            }}>
              Your destination for the best crypto games. Play featured Web3 titles,
              discover community games, and share your own creations!
            </p>
          </section>

          {/* Featured Crypto Games */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
              }}>
                Our Favorites
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '25px',
            }}>
              {featuredGames.map((game) => {
                const hasSecondary = 'secondaryColor' in game;
                const bgStyle = hasSecondary
                  ? `linear-gradient(135deg, ${game.secondaryColor}, #0a0a0a)`
                  : 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(15, 15, 30, 0.9))';

                return (
                <div
                  key={game.id}
                  style={{
                    background: bgStyle,
                    border: `2px solid ${game.color}40`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = game.color;
                    e.currentTarget.style.boxShadow = `0 0 30px ${game.color}40`;
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${game.color}40`;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Game Image */}
                  <div style={{
                    height: '180px',
                    background: hasSecondary
                      ? `linear-gradient(135deg, ${game.color}40, ${game.secondaryColor})`
                      : `linear-gradient(135deg, ${game.color}30, ${game.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${game.color}40`,
                    overflow: 'hidden',
                  }}>
                    <img
                      src={game.image}
                      alt={game.title}
                      style={{
                        maxHeight: '140px',
                        maxWidth: '90%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '22px',
                      color: game.color,
                      marginBottom: '10px',
                    }}>
                      {game.title}
                    </h3>

                    <p style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      color: '#aaa',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '15px',
                    }}>
                      {game.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {game.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 10px',
                            background: `${game.color}20`,
                            border: `1px solid ${game.color}40`,
                            borderRadius: '12px',
                            color: game.color,
                            fontFamily: 'Share Tech Mono, monospace',
                            fontSize: '11px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={game.playUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px',
                        background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`,
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontFamily: 'Orbitron, sans-serif',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                      }}
                    >
                      Play Now →
                    </a>
                  </div>
                </div>
              );
              })}
            </div>
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
              {Object.entries(communityGames).map(([key, game]) => (
                <div
                  key={key}
                  onClick={() => playGame(key)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 30, 0.8))',
                    border: '2px solid #00ff9940',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00ff99';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 153, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#00ff9940';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <h3 style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '18px',
                      color: '#00ff99',
                    }}>
                      {game.title}
                    </h3>
                    <span style={{
                      padding: '3px 8px',
                      background: game.badge === 'ALPHA' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 255, 153, 0.2)',
                      border: `1px solid ${game.badge === 'ALPHA' ? '#00d4ff' : '#00ff99'}`,
                      borderRadius: '4px',
                      color: game.badge === 'ALPHA' ? '#00d4ff' : '#00ff99',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}>
                      {game.badge}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#666',
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '12px',
                  }}>
                    <span>🎮</span>
                    <span>Click to Play</span>
                  </div>
                </div>
              ))}
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
