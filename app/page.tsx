"use client";
import { useState, useEffect } from "react";
import Leaderboard from "./components/Leaderboard";
import Credits from "./components/Credits";
import MusicPlayer from "./components/MusicPlayer";
import { useGameScoreTracking } from "./hooks/useGameScoreTracking";

// Featured Crypto Games

// Free-to-Play Games from API
interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
}

interface FeaturedGame {
  id: string;
  title: string;
  description: string;
  image: string;
  playUrl?: string;
  youtubeTrailer?: string;
  comingSoon?: boolean;
  tags: string[];
  color: string;
  secondaryColor?: string;
  guideUrl?: string;
  guideLabel?: string;
}

const featuredGames: FeaturedGame[] = [
  {
    id: "offthegrid",
    title: "Off The Grid",
    description: "AAA battle royale with deep narrative and player-driven economy. Free-to-play cyberpunk action on Avalanche.",
    image: "/featured/off-the-grid.png",
    playUrl: "https://offthegrid.com/",
    youtubeTrailer: "pvvVIPH2OxU",
    tags: ["Battle Royale", "AAA", "Avalanche", "$GUN"],
    color: "#00ffcc",
    secondaryColor: "#0a1a1a",
  },
  {
    id: "spidertanks",
    title: "Spider Tanks: Cores of Chaos",
    description: "PvP brawler where you battle in arenas with customizable tanks. Revived by GAMEDIA on Immutable. Note: IMX questing indefinitely removed due to bot abuse.",
    image: "/featured/spider-tanks.png",
    playUrl: "https://play.immutable.com/games/spider-tanks-cores-of-chaos/",
    youtubeTrailer: "5Tyqhqp3GYI",
    tags: ["PvP", "Brawler", "Immutable"],
    color: "#ff6b00",
    guideUrl: "https://www.spidergang.xyz",
    guideLabel: "Spider Gang",
  },
  {
    id: "playa3ull",
    title: "Playa3ull Games",
    description: "Gaming ecosystem with multiple titles including Nexus, Starvin Martian, Dogs of War, and more. Play, compete, and earn!",
    image: "/featured/playa3ull-logo.webp",
    playUrl: "https://playa3ull.games/",
    youtubeTrailer: "mRvqWh8qxts",
    tags: ["Ecosystem", "Multi-Game", "3ULL Token"],
    color: "#00ff66",
  },
  {
    id: "infinityrising",
    title: "Infinity Rising",
    description: "Open-world multiplayer RPG (formerly Cornucopias) on Cardano & Base. Race, build, craft, and earn $RISE. Multiple NFT collections including Land Zones and vehicles.",
    image: "/featured/infinity-rising.png",
    playUrl: "https://infinityrising.io/",
    youtubeTrailer: "yZECO2nDyu8",
    tags: ["RPG", "Action", "Cardano", "Base", "$RISE"],
    color: "#ff0033",
    secondaryColor: "#1a1a1a",
    guideUrl: "/infinityrising",
    guideLabel: "File Nodes & Token Guide",
  },
  {
    id: "machinesarena",
    title: "The Machines Arena",
    description: "Fast-paced 4v4 hero shooter with top-down PvP battles. Earn digital collectibles on the Ronin chain.",
    image: "/featured/machines-arena.png",
    playUrl: "https://www.themachinesarena.com/",
    youtubeTrailer: "JFahsRbzvsE",
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
    youtubeTrailer: "YcYKa0VbxNs",
    tags: ["MMORPG", "Naval Combat", "Abstract", "$CNC", "$KAP"],
    color: "#d4af37",
    secondaryColor: "#1a0a00",
    guideUrl: "/capnco",
    guideLabel: "Help Guide",
  },
  {
    id: "chainers",
    title: "Chainers",
    description: "Collect, battle, and evolve adorable Chainers in this creature-collecting RPG. Build your team and compete!",
    image: "/featured/chainers.png",
    playUrl: "https://chainers.io/?r=mjw0b0oz",
    youtubeTrailer: "8uAwkPur5-Q",
    tags: ["RPG", "Creature Collector", "Immutable", "Polygon", "BNB", "$CFB"],
    color: "#9b59b6",
    secondaryColor: "#1a0a2e",
  },
  {
    id: "minesofdalarnia",
    title: "Mines of Dalarnia",
    description: "Action-adventure mining game. Dig deep, fight monsters, and collect rare resources in procedurally generated mines. Note: IMX questing indefinitely removed due to bot abuse.",
    image: "/featured/mines-of-dalarnia.png",
    playUrl: "https://www.minesofdalarnia.com/",
    youtubeTrailer: "p_7gEKK89vE",
    tags: ["Action", "Mining", "Immutable", "$D"],
    color: "#e74c3c",
    secondaryColor: "#1a0505",
  },
  {
    id: "dalarnialegends",
    title: "Dalarnia Legends",
    description: "Fast-paced card game with strategic deck-building. All base cards unlocked through gameplay - no pay-to-win, just skill and strategy. Note: IMX questing indefinitely removed due to bot abuse.",
    image: "/featured/dalarnia-legends.png",
    playUrl: "https://legends.dalarnia.com/",
    youtubeTrailer: "-a0eXe3DC34",
    tags: ["Card Game", "PvP", "Immutable", "$D"],
    color: "#f39c12",
    secondaryColor: "#1a1005",
  },
  {
    id: "legendsofelysium",
    title: "Legends of Elysium",
    description: "Strategic card game with stunning 3D battlefields. Build decks, summon heroes, and conquer your opponents.",
    image: "/featured/legends-of-elysium.webp",
    playUrl: "https://www.legendsofelysium.io/",
    youtubeTrailer: "QB3L42TBbS4",
    tags: ["Card Game", "Strategy", "Immutable", "$LOE"],
    color: "#3498db",
    secondaryColor: "#0a1a2e",
  },
  {
    id: "villains",
    title: "Villains: Robot Battle Royale",
    description: "Fast-paced 4-minute mech battles mixing Battle Royale with MOBA tactics. Customize robots, awaken Super Villains as NFTs!",
    image: "/featured/villains.webp",
    playUrl: "https://play.immutable.com/games/villains/",
    youtubeTrailer: "4_queZTWNVY",
    tags: ["Battle Royale", "MOBA", "Immutable", "$MBX"],
    color: "#8e44ad",
    secondaryColor: "#1a0a1a",
  },
  {
    id: "godsunchained",
    title: "Gods Unchained",
    description: "The original Web3 trading card game. Collect 1800+ cards, master 6 domains, and battle in skill-based PvP. True ownership of your cards!",
    image: "/featured/gods-unchained.webp",
    playUrl: "https://godsunchained.com/",
    youtubeTrailer: "cDESNiMi-i4",
    tags: ["TCG", "PvP", "Immutable", "$GODS"],
    color: "#c9a227",
    secondaryColor: "#1a1505",
  },
  {
    id: "basejump",
    title: "Basejump",
    description: "AI-powered gaming platform with user-generated content. Play Broadside PvP battles, collect Solarpunk avatars, and support rainforest conservation!",
    image: "/featured/basejump.webp",
    playUrl: "https://play.immutable.com/games/basejump/",
    youtubeTrailer: "dq_oTzL_JLc",
    tags: ["Platform", "PvP", "Immutable"],
    color: "#2ecc71",
    secondaryColor: "#0a1a0f",
  },
  {
    id: "enginesoffury",
    title: "Engines of Fury",
    description: "Top-down extraction shooter in a post-apocalyptic dystopia. Infiltrate, scavenge loot, and escape before death claims you. From ex-Blizzard, Ubisoft & EA devs!",
    image: "/featured/engines-of-fury.png",
    playUrl: "https://www.eof.gg/",
    youtubeTrailer: "KBXpNfQE_Ng",
    tags: ["Extraction", "Shooter", "Immutable", "$FURY"],
    color: "#ff4444",
    secondaryColor: "#1a0505",
  },
  {
    id: "nomstead",
    title: "NomStead",
    description: "Casual sandbox MMORPG where every player helps shape the world. Farm, craft, trade, and build your civilization on Immutable zkEVM — casually, on your phone, in your spare time.",
    image: "/featured/nomstead.png",
    playUrl: "https://play.immutable.com/games/nomstead/",
    youtubeTrailer: "sdQtdwdVduY",
    tags: ["Sandbox MMO", "Cozy", "Immutable"],
    color: "#4ade80",
    secondaryColor: "#0a1a10",
    guideUrl: "/nomstead",
    guideLabel: "NFT Guide",
  },
  {
    id: "wilderworld",
    title: "Wilder World",
    description: "AAA metaverse 13.5x larger than GTA 5. Race, fight, explore and build in Wiami. Partnered with NVIDIA, Samsung & Epic Games. Coming 2026!",
    image: "/featured/wilder-world.png",
    youtubeTrailer: "7G8SwYp6gPo",
    comingSoon: true,
    tags: ["Metaverse", "AAA", "Coming Soon", "$WILD"],
    color: "#ed9f51",
    secondaryColor: "#1a0f05",
  },
];


// Community Games
const communityGames = {
  catacombs: { title: "Alien Catacombs", src: "/alien-catacombs.html", badge: "ALPHA" },
  armory: { title: "Alien Armory", href: "/armory", badge: "NEW" },
  dungeon: { title: "Dungeon Crawler", src: "/gumbuo-dungeon-crawler.html", badge: "COMMUNITY" },
  invasion: { title: "Gumbuo Invasion", src: "/gumbuo-invasion.html", badge: "COMMUNITY" },
};

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<"home" | "play" | "leaderboard" | "credits">("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: '', url: '', description: '', contact: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');

  // Free games from API
  const [freeGames, setFreeGames] = useState<FreeGame[]>([]);
  const [loadingFreeGames, setLoadingFreeGames] = useState(true);

  // Live game stats from Immutable APIs
  const [gameStats, setGameStats] = useState<Record<string, {
    totalCards?: number; totalPlayers?: number; nftCount?: number;
    activeListings?: number; floorPrice?: string; floorCurrency?: string;
    marketplaceUrl?: string;
  }>>({});


  useGameScoreTracking();

  // Fetch free games from API
  useEffect(() => {
    const fetchFreeGames = async () => {
      try {
        const response = await fetch('/api/games?platform=browser&limit=100');
        const data = await response.json();
        if (data.success) {
          setFreeGames(data.games);
        }
      } catch (error) {
        console.error('Failed to fetch free games:', error);
      } finally {
        setLoadingFreeGames(false);
      }
    };
    fetchFreeGames();
  }, []);


  // Fetch live game stats from Immutable APIs
  useEffect(() => {
    fetch('/api/nomstead?game=all')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setGameStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

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
    const game = communityGames[gameKey as keyof typeof communityGames];
    // For route-based games (like Alien Armory), navigate to the route
    if (game && 'href' in game && game.href) {
      window.location.href = game.href;
      return;
    }
    // For legacy isRoute games
    if (game && 'isRoute' in game && (game as { isRoute?: boolean }).isRoute) {
      window.location.href = (game as { src: string }).src;
      return;
    }
    setSelectedGame(gameKey);
    setActiveSection("play");
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)' }}>
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

            {/* Community Games Tabs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderLeft: '1px solid rgba(0, 212, 255, 0.3)', paddingLeft: '20px' }}>
              {Object.entries(communityGames).map(([key, game]) => (
                <button
                  key={key}
                  onClick={() => playGame(key)}
                  style={{
                    padding: '6px 12px',
                    background: selectedGame === key && activeSection === "play" ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: selectedGame === key && activeSection === "play" ? '1px solid #00ff99' : '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '4px',
                    color: selectedGame === key && activeSection === "play" ? '#00ff99' : '#00d4ff',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {game.title}
                </button>
              ))}
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
              href="/guildevents"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #b44dff, #8e2de2)',
                border: '2px solid #b44dff',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '14px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 'bold',
                boxShadow: '0 0 20px rgba(180, 77, 255, 0.5), 0 0 40px rgba(180, 77, 255, 0.2)',
                letterSpacing: '1px',
                animation: 'guildPulse 2s ease-in-out infinite',
              }}
            >
              Guild Events
              <style>{`@keyframes guildPulse { 0%, 100% { box-shadow: 0 0 20px rgba(180, 77, 255, 0.5), 0 0 40px rgba(180, 77, 255, 0.2); } 50% { box-shadow: 0 0 30px rgba(180, 77, 255, 0.8), 0 0 60px rgba(180, 77, 255, 0.4); } }`}</style>
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
                <iframe
                  src={game.src}
                  style={{ width: '100%', height: 'calc(100% - 50px)', border: 'none' }}
                  title={game.title}
                />
              );
            }
            return null;
          })()}
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
            <a
              href="/guildevents"
              style={{
                display: 'inline-block',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '3px solid #b44dff',
                boxShadow: '0 0 30px rgba(180, 77, 255, 0.4)',
                transition: 'all 0.3s ease',
                maxWidth: '500px',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 50px rgba(180, 77, 255, 0.7)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(180, 77, 255, 0.4)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src="/guild-banner.jpg"
                alt="SpiderGang Guild"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </a>
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
                  {/* Game Image or YouTube Trailer */}
                  <div style={{
                    height: game.youtubeTrailer ? '200px' : '180px',
                    background: hasSecondary
                      ? `linear-gradient(135deg, ${game.color}40, ${game.secondaryColor})`
                      : `linear-gradient(135deg, ${game.color}30, ${game.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${game.color}40`,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {game.youtubeTrailer ? (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${game.youtubeTrailer}`}
                        title={`${game.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />
                    ) : (
                      <img
                        src={game.image}
                        alt={game.title}
                        style={{
                          maxHeight: '140px',
                          maxWidth: '90%',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                    {game.comingSoon && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 10px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: `1px solid ${game.color}`,
                        borderRadius: '4px',
                        color: game.color,
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        zIndex: 10,
                      }}>
                        Coming Soon
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '22px',
                        color: game.color,
                        margin: 0,
                      }}>
                        {game.title}
                      </h3>
                      {game.tags.includes('Immutable') && (
                        <span style={{
                          padding: '2px 8px',
                          background: 'linear-gradient(135deg, #00d4ff20, #00ff9920)',
                          border: '1px solid #00d4ff60',
                          borderRadius: '4px',
                          color: '#00d4ff',
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          letterSpacing: '1px',
                          whiteSpace: 'nowrap',
                        }}>
                          IMX
                        </span>
                      )}
                    </div>

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

                    {gameStats[game.id] && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: gameStats[game.id].marketplaceUrl ? '10px' : '0',
                        }}>
                          {gameStats[game.id].totalCards != null && (
                            <div style={{
                              padding: '6px 12px',
                              background: `${game.color}15`,
                              border: `1px solid ${game.color}40`,
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: game.color, fontWeight: 'bold' }}>
                                {gameStats[game.id].totalCards!.toLocaleString()}
                              </div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                                Cards
                              </div>
                            </div>
                          )}
                          {gameStats[game.id].totalPlayers != null && (
                            <div style={{
                              padding: '6px 12px',
                              background: `${game.color}15`,
                              border: `1px solid ${game.color}40`,
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: game.color, fontWeight: 'bold' }}>
                                {gameStats[game.id].totalPlayers!.toLocaleString()}
                              </div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                                Players
                              </div>
                            </div>
                          )}
                          {gameStats[game.id].nftCount != null && (
                            <div style={{
                              padding: '6px 12px',
                              background: `${game.color}15`,
                              border: `1px solid ${game.color}40`,
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: game.color, fontWeight: 'bold' }}>
                                {gameStats[game.id].nftCount!.toLocaleString()}
                              </div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                                NFTs
                              </div>
                            </div>
                          )}
                          {gameStats[game.id].activeListings != null && (
                            <div style={{
                              padding: '6px 12px',
                              background: `${game.color}15`,
                              border: `1px solid ${game.color}40`,
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: game.color, fontWeight: 'bold' }}>
                                {gameStats[game.id].activeListings!.toLocaleString()}
                              </div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                                Listed
                              </div>
                            </div>
                          )}
                          {gameStats[game.id].floorPrice != null && (
                            <div style={{
                              padding: '6px 12px',
                              background: `${game.color}15`,
                              border: `1px solid ${game.color}40`,
                              borderRadius: '8px',
                              textAlign: 'center',
                            }}>
                              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '14px', color: game.color, fontWeight: 'bold' }}>
                                ${gameStats[game.id].floorPrice}
                              </div>
                              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                                Floor
                              </div>
                            </div>
                          )}
                        </div>
                        {gameStats[game.id].marketplaceUrl && (
                          <a
                            href={gameStats[game.id].marketplaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: `${game.color}10`,
                              border: `1px solid ${game.color}30`,
                              borderRadius: '6px',
                              color: game.color,
                              fontFamily: 'Share Tech Mono, monospace',
                              fontSize: '11px',
                              textDecoration: 'none',
                            }}
                          >
                            View Collection →
                          </a>
                        )}
                      </div>
                    )}

                    {game.guideUrl && (
                      <a
                        href={game.guideUrl}
                        target={game.guideUrl.startsWith('/') ? undefined : '_blank'}
                        rel={game.guideUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px',
                          background: `${game.color}15`,
                          border: `1px solid ${game.color}60`,
                          borderRadius: '8px',
                          color: game.color,
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          textTransform: 'uppercase',
                          marginBottom: '10px',
                          boxSizing: 'border-box',
                        }}
                      >
                        {game.guideLabel ?? 'Guide'} →
                      </a>
                    )}

                    {game.playUrl ? (
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
                    ) : (
                      <div
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '12px',
                          background: `linear-gradient(135deg, ${game.color}40, ${game.color}20)`,
                          border: `2px solid ${game.color}`,
                          borderRadius: '8px',
                          color: game.color,
                          fontFamily: 'Orbitron, sans-serif',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          textAlign: 'center',
                          textTransform: 'uppercase',
                        }}
                      >
                        Coming 2026
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </section>

          {/* Popular Free-to-Play Games */}
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '28px',
                  color: '#ff6b00',
                }}>
                  Free-to-Play Games
                </h2>
                <span style={{
                  padding: '4px 12px',
                  background: 'linear-gradient(135deg, #ff6b00, #ff8c00)',
                  borderRadius: '20px',
                  color: '#000',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                  100+ Games
                </span>
              </div>

              <a
                href="/discover"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 107, 0, 0.1)',
                  border: '2px solid #ff6b00',
                  borderRadius: '8px',
                  color: '#ff6b00',
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                View All →
              </a>
            </div>

            {loadingFreeGames ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(26, 26, 46, 0.5)',
                      borderRadius: '12px',
                      height: '280px',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px',
              }}>
                {freeGames.map((game) => (
                  <a
                    key={game.id}
                    href={game.game_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(15, 15, 30, 0.9))',
                      border: '2px solid rgba(255, 107, 0, 0.3)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ff6b00';
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 107, 0, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      height: '140px',
                      background: `url(${game.thumbnail}) center/cover`,
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '3px 8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '4px',
                        color: '#ff6b00',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                      }}>
                        {game.genre}
                      </div>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '14px',
                        color: '#ff6b00',
                        marginBottom: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {game.title}
                      </h3>
                      <p style={{
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '11px',
                        color: '#888',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {game.short_description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
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
                      background: game.badge === 'NEW' ? 'rgba(255, 107, 0, 0.2)' : game.badge === 'ALPHA' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 255, 153, 0.2)',
                      border: `1px solid ${game.badge === 'NEW' ? '#ff6b00' : game.badge === 'ALPHA' ? '#00d4ff' : '#00ff99'}`,
                      borderRadius: '4px',
                      color: game.badge === 'NEW' ? '#ff6b00' : game.badge === 'ALPHA' ? '#00d4ff' : '#00ff99',
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
