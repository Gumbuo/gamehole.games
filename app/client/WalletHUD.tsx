"use client";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";

export default function WalletHUD() {
  const { address, chain } = useAccount();

  // Abstract Mainnet ETH (chain ID 2741)
  const { data: abstractMainnetBalance } = useBalance({
    address,
    chainId: 2741,
  });

  // Abstract Testnet ETH (chain ID 11124)
  const { data: abstractTestnetBalance } = useBalance({
    address,
    chainId: 11124,
  });

  useEffect(() => {
    console.log("WalletHUD mounted, address:", address);
    console.log("Chain:", chain?.name, "ID:", chain?.id);
    console.log("Abstract Mainnet balance:", abstractMainnetBalance);
    console.log("Abstract Testnet balance:", abstractTestnetBalance);
  }, [address, chain, abstractMainnetBalance, abstractTestnetBalance]);

  const formatBalance = (balance: { value: bigint; decimals: number } | undefined) => {
    if (!balance) return "0";
    return parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4);
  };

  return (
    <div className="holographic-panel glass-panel px-6 py-4 rounded-xl shadow-2xl relative">
      {/* Corner glows */}
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10 space-y-3">
        {/* Connect Button */}
        <div className="flex justify-end">
          <ConnectButton />
        </div>

        {/* Wallet Info */}
        {address && (
          <div className="space-y-2 text-right font-electro text-sm">
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">Wallet:</span>
              <span className="text-cyan-400 font-mono alien-code">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">Abstract Mainnet:</span>
              <span className="text-green-400 font-bold alien-code">
                {formatBalance(abstractMainnetBalance)} ETH
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-400">Abstract Testnet:</span>
              <span className="text-yellow-400 font-bold alien-code">
                {formatBalance(abstractTestnetBalance)} ETH
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
