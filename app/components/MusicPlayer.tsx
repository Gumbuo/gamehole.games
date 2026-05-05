"use client";
import { useState, useRef, useEffect } from "react";


// Available music tracks
const TRACKS = [
  { id: 1, name: "Alien Vibes", file: "/demon.mp3" },
  { id: 2, name: "Space Odyssey", file: "/gumbuobeets.mp3" },
  { id: 3, name: "UFO Transmission", file: "/success.mp3" },
  { id: 4, name: "Cosmic Energy", file: "/arena.mp3" },
  { id: 5, name: "Galactic Groove", file: "/home.mp3" },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[4]); // Galactic Groove
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTrackChange = (trackId: number) => {
    const track = TRACKS.find(t => t.id === trackId);
    if (!track || !audioRef.current) return;

    const wasPlaying = isPlaying;

    if (wasPlaying) {
      audioRef.current.pause();
    }

    setSelectedTrack(track);
    audioRef.current.src = track.file;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play();
    }
  };

  const nextTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.id === selectedTrack.id);
    const nextIndex = (currentIndex + 1) % TRACKS.length;
    handleTrackChange(TRACKS[nextIndex].id);
  };

  const prevTrack = () => {
    const currentIndex = TRACKS.findIndex(t => t.id === selectedTrack.id);
    const prevIndex = currentIndex === 0 ? TRACKS.length - 1 : currentIndex - 1;
    handleTrackChange(TRACKS[prevIndex].id);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Auto-play next track
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [selectedTrack]);

  // Don't render if in iframe or not mounted
  if (!mounted) return null;
  if (typeof window !== "undefined" && window.self !== window.top) return null;

  return (
    <>
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 1000,
    }}>
      <audio ref={audioRef} src={selectedTrack.file} loop />

      {/* Collapsed View - Just the button */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: isPlaying
              ? "linear-gradient(135deg, #00ff99, #00d4ff)"
              : "linear-gradient(135deg, #1a1a2e, #0f0f1e)",
            border: "2px solid #00d4ff",
            color: isPlaying ? "#000" : "#00d4ff",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isPlaying
              ? "0 0 20px rgba(0, 255, 153, 0.6)"
              : "0 0 15px rgba(0, 212, 255, 0.3)",
            transition: "all 0.3s ease",
          }}
        >
          {isPlaying ? "🎵" : "🎧"}
        </button>
      ) : (
        /* Expanded View */
        <div style={{
          background: "linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(15, 15, 30, 0.95))",
          border: "2px solid #00d4ff",
          borderRadius: "12px",
          padding: "15px",
          boxShadow: "0 0 30px rgba(0, 212, 255, 0.3)",
          backdropFilter: "blur(10px)",
          minWidth: "280px",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}>
            <span style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              color: "#00d4ff",
              textTransform: "uppercase",
            }}>
              Music Player
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#666",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Track Name */}
          <div style={{
            fontFamily: "Share Tech Mono, monospace",
            fontSize: "14px",
            color: "#00ff99",
            marginBottom: "12px",
            textAlign: "center",
          }}>
            {isPlaying ? "♪ " : ""}{selectedTrack.name}
          </div>

          {/* Controls */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}>
            <button
              onClick={prevTrack}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid #00d4ff",
                color: "#00d4ff",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ⏮
            </button>

            <button
              onClick={togglePlay}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: isPlaying
                  ? "linear-gradient(135deg, #ff6b6b, #ee5a5a)"
                  : "linear-gradient(135deg, #00ff99, #00d4ff)",
                border: "none",
                color: "#000",
                cursor: "pointer",
                fontSize: "20px",
                fontWeight: "bold",
                boxShadow: isPlaying
                  ? "0 0 20px rgba(255, 107, 107, 0.5)"
                  : "0 0 20px rgba(0, 255, 153, 0.5)",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              onClick={nextTrack}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0, 212, 255, 0.1)",
                border: "1px solid #00d4ff",
                color: "#00d4ff",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ⏭
            </button>
          </div>

          {/* Track Selector */}
          <select
            value={selectedTrack.id}
            onChange={(e) => handleTrackChange(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid #00d4ff40",
              borderRadius: "6px",
              color: "#00d4ff",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "12px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {TRACKS.map(track => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
    </>
  );
}
