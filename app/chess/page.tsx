"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther, parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import ChessBoard from "../components/chess/ChessBoard";
import { findBestMove } from "../components/chess/ChessAI";
import MoveHistory from "../components/chess/MoveHistory";
import GameClock, { TIME_CONTROLS } from "../components/chess/GameClock";

type GameMode = "lobby" | "create" | "playing" | "cpu";
type StakeOption = "free" | "micro" | "standard" | "high";

interface GameSettings {
  stake: StakeOption;
  timeControl: keyof typeof TIME_CONTROLS;
  color: "white" | "black" | "random";
}

const STAKE_OPTIONS: Record<StakeOption, { label: string; value: bigint; description: string }> = {
  free: { label: "Free Play", value: BigInt(0), description: "Practice with no stakes" },
  micro: { label: "0.0001 ETH", value: parseEther("0.0001"), description: "Micro stakes" },
  standard: { label: "0.001 ETH", value: parseEther("0.001"), description: "Standard game" },
  high: { label: "0.01 ETH", value: parseEther("0.01"), description: "High stakes" },
};

export default function ChessPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [gameMode, setGameMode] = useState<GameMode>("lobby");
  const [settings, setSettings] = useState<GameSettings>({
    stake: "free",
    timeControl: "blitz5",
    color: "white",
  });

  // Game state
  const [game, setGame] = useState(() => new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isMyTurn, setIsMyTurn] = useState(true);
  

  // Start a new game
  const startGame = (mode: "cpu" | "playing") => {
    const newGame = new Chess();
    setGame(newGame);

    const color = settings.color === "random"
      ? Math.random() > 0.5 ? "white" : "black"
      : settings.color;

    setPlayerColor(color);
    setIsMyTurn(color === "white");
    setGameMode(mode);
  };

  // Handle player move
  const handleMove = (from: string, to: string, promotion?: string) => {
    const gameCopy = new Chess(game.fen());
    try {
      gameCopy.move({ from, to, promotion: promotion || "q" });
      setGame(gameCopy);
      setIsMyTurn(false);

      // CPU move (if playing vs CPU)
      if (gameMode === "cpu" && !gameCopy.isGameOver()) {
        setTimeout(() => {
          makeCpuMove(gameCopy);
        }, 500 + Math.random() * 1000);
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  // CPU move logic
  const makeCpuMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return;

    // Simple AI: prefer captures, checks, then random
    const captures = moves.filter((m) => m.captured);
    const checks = moves.filter((m) => {
      const testGame = new Chess(currentGame.fen());
      testGame.move(m);
      return testGame.isCheck();
    });

    let selectedMove;
    if (checks.length > 0 && Math.random() > 0.3) {
      selectedMove = checks[Math.floor(Math.random() * checks.length)];
    } else if (captures.length > 0 && Math.random() > 0.4) {
      selectedMove = captures[Math.floor(Math.random() * captures.length)];
    } else {
      selectedMove = moves[Math.floor(Math.random() * moves.length)];
    }

    const gameCopy = new Chess(currentGame.fen());
    gameCopy.move(selectedMove);
    setGame(gameCopy);
    setIsMyTurn(true);
  };

  // Reset to lobby
  const backToLobby = () => {
    setGameMode("lobby");
    setGame(new Chess());
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)" }}>
        <div className="text-center space-y-6 px-4">
          <div className="text-7xl mb-2">♟</div>
          <h1 className="text-5xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(90deg, #00ff99, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            WEB3 CHESS
          </h1>
          <p className="text-gray-400 text-lg" style={{ fontFamily: "Share Tech Mono, monospace" }}>
            Connect your wallet to play
          </p>
          <div className="flex justify-center mt-4">
            <ConnectButton />
          </div>
          <a href="/" className="block text-cyan-400 text-sm mt-6 hover:text-cyan-300" style={{ fontFamily: "Orbitron, sans-serif" }}>
            ← HOME PAGE
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1e 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-cyan-400" style={{ background: "rgba(10, 10, 26, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(90deg, #00d4ff, #00ff99)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GAME HOLE
            </a>
            <span className="text-cyan-400 text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>/ CHESS</span>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && balance && (
              <div className="text-sm text-cyan-400" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* LOBBY VIEW */}
          {gameMode === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "Orbitron, sans-serif", background: "linear-gradient(90deg, #00ff99, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  WEB3 CHESS
                </h1>
                <p className="text-gray-400 text-lg" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                  Play chess. Win ETH. All on Base.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Play vs CPU */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode("create")}
                  className="p-6 rounded-xl border-2 border-cyan-400/40 hover:border-cyan-400 transition-all text-left"
                  style={{ background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 255, 153, 0.05))" }}
                >
                  <div className="text-4xl mb-3">&#9823;</div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
                    PLAY VS CPU
                  </h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                    Practice against the computer. Free to play.
                  </p>
                </motion.button>

                {/* Play for ETH */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGameMode("create")}
                  className="p-6 rounded-xl border-2 border-green-400/40 hover:border-green-400 transition-all text-left"
                  style={{ background: "linear-gradient(135deg, rgba(0, 255, 153, 0.1), rgba(0, 255, 153, 0.05))" }}
                >
                  <div className="text-4xl mb-3">&#9812;</div>
                  <h3 className="text-xl font-bold text-green-400 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
                    BET ETH
                  </h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                    Winner takes all. Trustless smart contract escrow.
                  </p>
                  {!isConnected && (
                    <p className="text-yellow-400 text-xs mt-2">Connect wallet to play</p>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CREATE GAME VIEW */}
          {gameMode === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto space-y-6"
            >
              <button
                onClick={backToLobby}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                ← Back to Lobby
              </button>

              <h2 className="text-3xl font-bold text-center text-cyan-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                CREATE GAME
              </h2>

              {/* Stake Selection */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  STAKE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(STAKE_OPTIONS) as [StakeOption, typeof STAKE_OPTIONS.free][]).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => setSettings({ ...settings, stake: key })}
                      disabled={key !== "free" && !isConnected}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${settings.stake === key
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-gray-600 hover:border-gray-400"
                        }
                        ${key !== "free" && !isConnected ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="text-white font-bold" style={{ fontFamily: "Orbitron, sans-serif" }}>
                        {option.label}
                      </div>
                      <div className="text-gray-400 text-xs" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Control */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  TIME CONTROL
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TIME_CONTROLS).slice(0, 6).map(([key, tc]) => (
                    <button
                      key={key}
                      onClick={() => setSettings({ ...settings, timeControl: key as keyof typeof TIME_CONTROLS })}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${settings.timeControl === key
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-gray-600 hover:border-gray-400"
                        }
                      `}
                    >
                      <div className="text-white text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                        {tc.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  PLAY AS
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["white", "black", "random"] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings({ ...settings, color })}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${settings.color === color
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-gray-600 hover:border-gray-400"
                        }
                      `}
                    >
                      <div className="text-2xl text-center">
                        {color === "white" ? "♔" : color === "black" ? "♚" : "🎲"}
                      </div>
                      <div className="text-white text-xs text-center capitalize" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                        {color}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame("cpu")}
                className="w-full py-4 rounded-xl font-bold text-lg text-black"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  background: "linear-gradient(135deg, #00ff99, #00d4ff)",
                }}
              >
                {settings.stake === "free" ? "START PRACTICE GAME" : `STAKE ${STAKE_OPTIONS[settings.stake].label}`}
              </motion.button>

              {settings.stake !== "free" && !isConnected && (
                <p className="text-center text-yellow-400 text-sm">
                  Connect wallet to play for ETH
                </p>
              )}
            </motion.div>
          )}

          {/* PLAYING VIEW */}
          {(gameMode === "playing" || gameMode === "cpu") && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={backToLobby}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                  style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                  ← Back to Lobby
                </button>

                {settings.stake !== "free" && (
                  <div className="px-4 py-2 rounded-lg border-2 border-green-400 bg-green-400/10">
                    <span className="text-green-400 font-bold" style={{ fontFamily: "Orbitron, sans-serif" }}>
                      Prize Pool: {STAKE_OPTIONS[settings.stake].label} × 2
                    </span>
                  </div>
                )}

                <div className="text-gray-400 text-sm" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                  {gameMode === "cpu" ? "vs CPU" : "vs Player"}
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                {/* Chess Board */}
                <div className="flex justify-center">
                  <div style={{ width: "min(720px, 90vw, calc(100vh - 200px))", margin: "0 auto" }}>
                    <ChessBoard
                      fen={game.fen()}
                      orientation={playerColor}
                      isMyTurn={isMyTurn}
                      onMove={handleMove}
                      disabled={game.isGameOver()}
                    />
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {/* Player Cards */}
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg border-2 ${!isMyTurn && playerColor === "black" ? "border-cyan-400 bg-cyan-400/10" : "border-gray-600"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{playerColor === "black" ? "♔" : "♚"}</span>
                        <span className="text-white" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                          {gameMode === "cpu" ? "CPU" : "Opponent"}
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${isMyTurn ? "border-cyan-400 bg-cyan-400/10" : "border-gray-600"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{playerColor === "white" ? "♔" : "♚"}</span>
                        <span className="text-white" style={{ fontFamily: "Share Tech Mono, monospace" }}>
                          You {isConnected && `(${address?.slice(0, 6)}...)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Move History */}
                  <MoveHistory moves={game.history()} />

                  {/* Game Over Actions */}
                  {game.isGameOver() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <button
                        onClick={() => startGame(gameMode)}
                        className="w-full py-3 rounded-lg font-bold text-black"
                        style={{
                          fontFamily: "Orbitron, sans-serif",
                          background: "linear-gradient(135deg, #00ff99, #00d4ff)",
                        }}
                      >
                        PLAY AGAIN
                      </button>
                      <button
                        onClick={backToLobby}
                        className="w-full py-3 rounded-lg font-bold text-cyan-400 border-2 border-cyan-400 hover:bg-cyan-400/10"
                        style={{ fontFamily: "Orbitron, sans-serif" }}
                      >
                        BACK TO LOBBY
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
