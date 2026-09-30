"use client";

import { useRef, useState } from "react";
import Link from "next/link";

export default function VoidfallPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [gameLoaded, setGameLoaded] = useState(false);

  return (
    <div style={{
      height: "100vh",
      overflow: "hidden",
      background: "#05070d",
      fontFamily: "Orbitron, monospace",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        background: "rgba(10,10,20,0.95)",
        borderBottom: "1px solid #1a2a3a",
        flexShrink: 0,
      }}>
        <Link href="/" style={{
          color: "#38c1ff",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: "0.1em",
        }}>
          ← MOTHERSHIP
        </Link>
        <span style={{ color: "#38c1ff", fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em" }}>
          🛰️ VOIDFALL
        </span>
        <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.05em" }}>
          card battler + territory conquest
        </span>
      </div>

      {/* Game iframe */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {!gameLoaded && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#05070d", color: "#38c1ff", fontSize: 14,
            flexDirection: "column", gap: 12, zIndex: 4,
          }}>
            <div style={{ fontSize: 40 }}>🛰️</div>
            <div>Loading Voidfall...</div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="https://voidfall.gumbuogw3.workers.dev"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          allow="autoplay; fullscreen"
          onLoad={() => setGameLoaded(true)}
        />
      </div>
    </div>
  );
}
