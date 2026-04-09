"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import { RawResourceKey } from "../base/components/armory/types";
import { MATERIAL_NAMES, MATERIAL_ICONS } from "../base/components/armory/constants";

const AlienArmory = dynamic(
  () => import("../base/components/AlienArmory"),
  { ssr: false }
);

// ---- Types ----
interface Toast {
  id: number;
  message: string;
  icon: string;
  color: string;
}

interface GameHealth {
  current: number;
  max: number;
}

interface HudResources {
  [key: string]: number;
}

// ---- Page ----
export default function CatacombsPage() {
  const { address, isConnected } = useAccount();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [loading, setLoading] = useState(true);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [armoryOpen, setArmoryOpen] = useState(false);

  // Lightweight HUD state (synced from resource drops, no full save needed here)
  const [hudResources, setHudResources] = useState<HudResources>({});
  const [apBalance, setApBalance] = useState(0);
  const [gameHealth, setGameHealth] = useState<GameHealth | null>(null);

  // Toasts for resource drops
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // ---- Load initial AP balance ----
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/armory?wallet=${address}`).then(r => r.json()),
      fetch(`/api/points?wallet=${address}`).then(r => r.json()),
    ]).then(([saveData, apData]) => {
      if (saveData.success && saveData.data?.resources) {
        setHudResources(saveData.data.resources);
      }
      if (apData.success) setApBalance(apData.userBalance);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [address]);

  // ---- Show toast ----
  const showToast = useCallback((message: string, icon: string, color = "#66fcf1") => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, icon, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ---- Open / close armory overlay ----
  const openArmory = useCallback(() => {
    setArmoryOpen(true);
  }, []);

  const closeArmory = useCallback(() => {
    setArmoryOpen(false);
    iframeRef.current?.contentWindow?.postMessage({ type: "ARMORY_CLOSED" }, "*");
    // Re-fetch resources to keep HUD in sync
    if (address) {
      fetch(`/api/armory?wallet=${address}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data?.resources) setHudResources(data.data.resources);
        }).catch(() => {});
    }
  }, [address]);

  // ---- Handle resource drop from game ----
  const handleResourceDrop = useCallback(async (resource: string, quantity: number) => {
    if (!address) return;
    try {
      const res = await fetch("/api/armory/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, resource, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setHudResources(data.data.resources);
        const icon = MATERIAL_ICONS[resource as keyof typeof MATERIAL_ICONS] ?? "✨";
        const name = MATERIAL_NAMES[resource as keyof typeof MATERIAL_NAMES] ?? resource;
        showToast(`+${quantity} ${name}`, icon, "#4ade80");
      }
    } catch {}
  }, [address, showToast]);

  // ---- Listen for postMessage from iframe ----
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data?.type) return;
      const { type } = e.data;

      if (type === "OPEN_ARMORY_STATION") {
        // Open full armory (player walked to a station in-game)
        openArmory();
      }

      if (type === "ARMORY_RESOURCE_DROP") {
        handleResourceDrop(e.data.resource, e.data.quantity ?? 1);
      }

      if (type === "ALIEN_CATACOMBS_HEALTH") {
        setGameHealth({ current: e.data.currentHealth, max: e.data.maxHealth });
      }

      if (type === "GAME_OVER") {
        showToast("Game Over! Resources saved.", "💀", "#ef4444");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [handleResourceDrop, openArmory, showToast]);

  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Orbitron, monospace",
        color: "#66fcf1",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{ fontSize: 48 }}>👾</div>
        <div style={{ fontSize: 18 }}>Connect your wallet to enter the Alien Catacombs</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "Orbitron, monospace",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ---- Top HUD bar ---- */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        background: "rgba(10,10,20,0.95)",
        borderBottom: "1px solid #1a2a3a",
        flexShrink: 0,
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ color: "#66fcf1", fontSize: 13, fontWeight: "bold" }}>
          👾 ALIEN CATACOMBS
        </div>

        {/* Player health from game */}
        {gameHealth && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#aaa" }}>HP</span>
            <div style={{ width: 100, height: 8, background: "#1a1a2e", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(gameHealth.current / gameHealth.max) * 100}%`,
                background: gameHealth.current / gameHealth.max > 0.5 ? "#22c55e"
                  : gameHealth.current / gameHealth.max > 0.25 ? "#facc15" : "#ef4444",
                borderRadius: 4,
                transition: "width 0.3s",
              }} />
            </div>
            <span style={{ fontSize: 10, color: "#aaa" }}>{gameHealth.current}/{gameHealth.max}</span>
          </div>
        )}

        {/* Resources compact display */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {(Object.keys(MATERIAL_ICONS) as RawResourceKey[]).map(key => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
              <span>{MATERIAL_ICONS[key]}</span>
              <span style={{ color: "#66fcf1" }}>{hudResources[key] ?? 0}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#facc15" }}>⚡ {apBalance} AP</div>

        {/* Open Armory button */}
        <button
          onClick={openArmory}
          style={{
            background: "rgba(102,252,241,0.1)",
            border: "1px solid #66fcf1",
            color: "#66fcf1",
            borderRadius: 8,
            padding: "6px 14px",
            fontFamily: "Orbitron, monospace",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          🏭 ARMORY
        </button>
      </div>

      {/* ---- Game iframe ---- */}
      <div style={{ flex: 1, position: "relative", minHeight: 500 }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#0a0a0f", color: "#66fcf1", fontSize: 14, zIndex: 5,
          }}>
            Loading armory data...
          </div>
        )}

        {!gameLoaded && !loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#0a0a0f", color: "#555", fontSize: 13,
            flexDirection: "column", gap: 12, zIndex: 4,
          }}>
            <div style={{ fontSize: 40 }}>🏛️</div>
            <div>Entering the catacombs...</div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/games/alien-catacombs/index.html"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            opacity: armoryOpen ? 0.2 : 1,
            transition: "opacity 0.2s",
          }}
          allow="autoplay; fullscreen"
          onLoad={() => setGameLoaded(true)}
        />
      </div>

      {/* ---- Full Armory Overlay ---- */}
      {armoryOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          overflowY: "auto",
          background: "rgba(0,0,0,0.6)",
        }}>
          <AlienArmory onClose={closeArmory} />
        </div>
      )}

      {/* ---- Resource drop toasts ---- */}
      <div style={{
        position: "fixed", bottom: 80, right: 20,
        display: "flex", flexDirection: "column", gap: 6,
        zIndex: 300, pointerEvents: "none",
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: "rgba(10,10,20,0.95)",
            border: `1px solid ${toast.color}`,
            borderRadius: 8, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: toast.color,
            fontFamily: "Orbitron, monospace",
            animation: "slideIn 0.2s ease",
            boxShadow: `0 0 12px ${toast.color}44`,
          }}>
            <span style={{ fontSize: 18 }}>{toast.icon}</span>
            {toast.message}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
