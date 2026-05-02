"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onDismiss: () => void;
}

export default function VideoIntro({ onDismiss }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    // Auto-play the video muted so it starts immediately
    if (videoRef.current) {
      videoRef.current.volume = 0.6;
      videoRef.current.play().catch(() => {});
    }
  }, [watching]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0, 0, 0, 0.88)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(15, 15, 30, 0.98), rgba(26, 26, 46, 0.98))",
        border: "2px solid #00d4ff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 0 60px rgba(0, 212, 255, 0.3)",
        maxWidth: "560px",
        width: "90%",
      }}>
        {/* Header */}
        <div style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "11px",
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: "14px",
          textAlign: "center",
        }}>
          From the Game Hole
        </div>

        {/* Video */}
        <div style={{
          borderRadius: "10px",
          overflow: "hidden",
          background: "#000",
          aspectRatio: "16/9",
          marginBottom: "16px",
        }}>
          <video
            ref={videoRef}
            src="/fox-club-wow.mp4"
            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
            playsInline
            onEnded={onDismiss}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onDismiss}
            style={{
              padding: "8px 20px",
              background: "transparent",
              border: "1px solid #444",
              borderRadius: "6px",
              color: "#888",
              fontFamily: "Share Tech Mono, monospace",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: "8px 24px",
              background: "linear-gradient(135deg, #00ff99, #00d4ff)",
              border: "none",
              borderRadius: "6px",
              color: "#000",
              fontFamily: "Orbitron, sans-serif",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Done ▶
          </button>
        </div>
      </div>
    </div>
  );
}
