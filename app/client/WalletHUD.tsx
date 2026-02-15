"use client";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import { base } from "wagmi/chains";

export default function WalletHUD() {
  const { address } = useAccount();

  // Base ETH balance
  const { data: baseBalance } = useBalance({
    address,
    chainId: base.id,
  });

  const formatBal = (balance: { value: bigint; decimals: number } | undefined) => {
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
            {parseFloat(formatBal(baseBalance)) > 0 && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-gray-400">Base:</span>
                <span className="text-blue-400 font-bold alien-code">
                  {formatBal(baseBalance)} ETH
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
