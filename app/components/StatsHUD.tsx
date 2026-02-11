"use client";
import { useEffect, useState } from "react";
import { useAlienPoints } from "../context/AlienPointContext";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";

export default function StatsHUD() {
  const alien = useAlienPoints();
  const [points, setPoints] = useState(100);
  const [gmb, setGmb] = useState("0");
  const { address } = useAccount();

  // Fetch GMB balance via API instead of wagmi hook (wagmi v3 changed token balance API)
  useEffect(() => {
    if (address) {
      fetch(`/api/balance?wallet=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.balance) {
            setGmb(parseFloat(formatUnits(BigInt(data.balance), 18)).toFixed(2));
          }
        })
        .catch(console.error);
    }
  }, [address]);

  useEffect(() => {
    if (alien?.alienPoints !== undefined) {
      setPoints(alien.alienPoints);
    }
  }, [alien]);

  return (
    <div className="fixed top-24 right-4 z-40 pointer-events-auto holographic-panel glass-panel p-6 rounded-2xl flex flex-col items-end space-y-4 text-cyan-400 text-lg drop-shadow-2xl">
      {/* Corner glow accents */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="space-y-2 text-right font-bold relative z-10 font-electro">
        <div className="text-green-400 drop-shadow-glow">Alien Points: <span className="text-2xl holographic-text font-alien">{points}</span></div>
        <div className="text-cyan-400 drop-shadow-glow">GMB: <span className="text-xl font-mono alien-code">{gmb}</span></div>
        <div className="text-purple-400 drop-shadow-glow">Pool: <span className="text-xl font-mono alien-code">100,000,000</span></div>
      </div>
    </div>
  );
}
