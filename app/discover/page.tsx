"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
}

const GENRES = [
  { value: "", label: "All Genres" },
  { value: "mmorpg", label: "MMORPG" },
  { value: "shooter", label: "Shooter" },
  { value: "strategy", label: "Strategy" },
  { value: "moba", label: "MOBA" },
  { value: "racing", label: "Racing" },
  { value: "sports", label: "Sports" },
  { value: "social", label: "Social" },
  { value: "card", label: "Card Games" },
  { value: "fighting", label: "Fighting" },
  { value: "fantasy", label: "Fantasy" },
];

const PLATFORMS = [
  { value: "browser", label: "Browser" },
  { value: "pc", label: "PC Download" },
  { value: "all", label: "All Platforms" },
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Most Popular" },
  { value: "release-date", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
];

export default function DiscoverPage() {
  const [games, setGames] = useState<FreeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("browser");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("popularity");

  useEffect(() => {
    fetchGames();
  }, [platform, genre, sort]);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        platform,
        sort,
        limit: "100",
      });
      if (genre) params.set("category", genre);
      if (search) params.set("search", search);

      const response = await fetch(`/api/games?${params}`);
      const data = await response.json();

      if (data.success) {
        setGames(data.games);
      } else {
        setError(data.error || "Failed to load games");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames();
  };

  // Filter games client-side for instant search
  const filteredGames = search
    ? games.filter(
        (game) =>
          game.title.toLowerCase().includes(search.toLowerCase()) ||
          game.genre.toLowerCase().includes(search.toLowerCase())
      )
    : games;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)" }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 10, 26, 0.95)",
        borderBottom: "2px solid #00d4ff",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Link
              href="/"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "28px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #00d4ff, #00ff99)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textDecoration: "none",
              }}
            >
              GAME HOLE
            </Link>
            <span style={{
              color: "#ff6b00",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "14px",
            }}>
              / DISCOVER
            </span>
          </div>

          <Link
            href="/"
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #00d4ff",
              borderRadius: "6px",
              color: "#00d4ff",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "48px",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #ff6b00, #ff8c00, #ffa500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "15px",
          }}>
            DISCOVER FREE GAMES
          </h1>
          <p style={{
            fontFamily: "Share Tech Mono, monospace",
            color: "#888",
            fontSize: "16px",
          }}>
            100+ free-to-play games you can play right now in your browser
          </p>
        </section>

        {/* Filters */}
        <section style={{
          background: "rgba(26, 26, 46, 0.5)",
          border: "1px solid rgba(255, 107, 0, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
        }}>
          <form onSubmit={handleSearch} style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "flex-end",
          }}>
            {/* Search */}
            <div style={{ flex: "1 1 300px" }}>
              <label style={{
                display: "block",
                color: "#888",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 107, 0, 0.4)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Platform */}
            <div style={{ flex: "0 0 150px" }}>
              <label style={{
                display: "block",
                color: "#888",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 107, 0, 0.4)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "14px",
                }}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Genre */}
            <div style={{ flex: "0 0 150px" }}>
              <label style={{
                display: "block",
                color: "#888",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 107, 0, 0.4)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "14px",
                }}
              >
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div style={{ flex: "0 0 150px" }}>
              <label style={{
                display: "block",
                color: "#888",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "10px",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 107, 0, 0.4)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Share Tech Mono, monospace",
                  fontSize: "14px",
                }}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </form>
        </section>

        {/* Results Count */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <p style={{
            color: "#666",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "14px",
          }}>
            {loading ? "Loading..." : `${filteredGames.length} games found`}
          </p>
        </div>

        {/* Games Grid */}
        {error ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#ff6b6b",
            fontFamily: "Share Tech Mono, monospace",
          }}>
            {error}
          </div>
        ) : loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(26, 26, 46, 0.5)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  animation: "pulse 1.5s infinite",
                }}
              >
                <div style={{ height: "160px", background: "rgba(255, 107, 0, 0.1)" }} />
                <div style={{ padding: "15px" }}>
                  <div style={{ height: "20px", background: "rgba(255, 107, 0, 0.1)", borderRadius: "4px", marginBottom: "10px" }} />
                  <div style={{ height: "40px", background: "rgba(255, 107, 0, 0.05)", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {filteredGames.map((game) => (
              <a
                key={game.id}
                href={game.game_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(15, 15, 30, 0.9))",
                  border: "2px solid rgba(255, 107, 0, 0.3)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff6b00";
                  e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 107, 0, 0.3)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: "160px",
                  background: `url(${game.thumbnail}) center/cover`,
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    padding: "4px 10px",
                    background: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "4px",
                    color: "#ff6b00",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "10px",
                    textTransform: "uppercase",
                  }}>
                    {game.genre}
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    padding: "4px 10px",
                    background: game.platform === "Web Browser" ? "rgba(0, 255, 153, 0.8)" : "rgba(0, 212, 255, 0.8)",
                    borderRadius: "4px",
                    color: "#000",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "9px",
                    fontWeight: "bold",
                  }}>
                    {game.platform === "Web Browser" ? "BROWSER" : "PC"}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "15px" }}>
                  <h3 style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "16px",
                    color: "#ff6b00",
                    marginBottom: "8px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {game.title}
                  </h3>
                  <p style={{
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "12px",
                    color: "#888",
                    lineHeight: "1.5",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}>
                    {game.short_description}
                  </p>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      color: "#666",
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: "10px",
                    }}>
                      {game.publisher}
                    </span>
                    <span style={{
                      color: "#ff6b00",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "11px",
                    }}>
                      PLAY FREE →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredGames.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎮</div>
            <h3 style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "24px",
              color: "#ff6b00",
              marginBottom: "10px",
            }}>
              No Games Found
            </h3>
            <p style={{
              color: "#666",
              fontFamily: "Share Tech Mono, monospace",
            }}>
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255, 107, 0, 0.2)",
        padding: "30px 20px",
        textAlign: "center",
        marginTop: "60px",
      }}>
        <p style={{
          fontFamily: "Share Tech Mono, monospace",
          color: "#666",
          fontSize: "12px",
        }}>
          Games provided by FreeToGame API | © 2024 Game Hole
        </p>
      </footer>
    </div>
  );
}
