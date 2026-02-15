"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints as useAlienPointsEconomy } from "../app/context/AlienPointsEconomy";
import { useAlienPoints as useAlienPointsSimple } from "../app/context/AlienPointContext";
import React, { useEffect, useState } from "react";
import { base, blast, arbitrum } from "wagmi/chains";
import { formatUnits } from "viem";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";

// Helper to format balance from wagmi v3 format
const formatBalance = (balance: { value: bigint; decimals: number } | undefined): string => {
  if (!balance) return "0";
  return formatUnits(balance.value, balance.decimals);
};

export function AlienHUD() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);
  const [gmbBalanceBase, setGmbBalanceBase] = useState<string>("0");

  // ETH balances (only chains we care about)
  const { data: ethBalanceBase } = useBalance({
    address,
    chainId: base.id
  });

  const { data: ethBalanceBlast } = useBalance({
    address,
    chainId: blast.id
  });

  const { data: ethBalanceArbitrum } = useBalance({
    address,
    chainId: arbitrum.id
  });

  // Fetch GMB token balance via API
  useEffect(() => {
    if (address) {
      fetch(`/api/balance?wallet=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.balance) {
            setGmbBalanceBase(parseFloat(formatUnits(BigInt(data.balance), 18)).toFixed(2));
          }
        })
        .catch(console.error);
    }
  }, [address]);

  const { userBalances, getUserBalance } = useAlienPointsEconomy();
  const alienPointsSimple = useAlienPointsSimple();

  // Compute alien points directly from state
  const alienPoints = React.useMemo(() => {
    if (address && userBalances[address.toLowerCase()] !== undefined) {
      return userBalances[address.toLowerCase()];
    }
    if (alienPointsSimple && alienPointsSimple.alienPoints !== undefined) {
      return alienPointsSimple.alienPoints;
    }
    return 0;
  }, [address, alienPointsSimple?.alienPoints, userBalances]);

  // Fetch initial balance when address changes
  useEffect(() => {
    if (address && userBalances[address.toLowerCase()] === undefined) {
      getUserBalance(address);
    }
  }, [address, getUserBalance, userBalances]);

  // Add token to MetaMask with chain switching
  const addTokenToMetaMask = async (tokenAddress: string, symbol: string, decimals: number, chainName: string, chainId?: number) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        if (chainId) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              alert(`Please add the ${chainName} network to your wallet first, then try again.`);
              return;
            }
            throw switchError;
          }
        }

        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: decimals,
            },
          },
        });
        alert(`${symbol} token on ${chainName} added to MetaMask!`);
      } else {
        alert('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token to MetaMask');
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        borderRadius: '8px',
        border: '2px solid #00ff9944'
      }} className="holographic-panel glass-panel p-4 shadow-2xl max-w-md relative">
        <div className="corner-glow corner-glow-tl"></div>
        <div className="corner-glow corner-glow-tr"></div>
        <div className="corner-glow corner-glow-bl"></div>
        <div className="corner-glow corner-glow-br"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-400">
              <img src="/zorb.png" alt="Zorb" style={{width: '20px', height: '20px'}} className="rounded-full" />
              <span>Wallet not connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const baseEth = parseFloat(formatBalance(ethBalanceBase));
  const blastEth = parseFloat(formatBalance(ethBalanceBlast));
  const arbEth = parseFloat(formatBalance(ethBalanceArbitrum));
  const gmbBase = parseFloat(gmbBalanceBase);

  return (
    <div style={{
      borderRadius: '8px',
      border: '2px solid #00ff9944'
    }} className="holographic-panel glass-panel p-4 shadow-2xl max-w-md relative">
      <div className="corner-glow corner-glow-tl"></div>
      <div className="corner-glow corner-glow-tr"></div>
      <div className="corner-glow corner-glow-bl"></div>
      <div className="corner-glow corner-glow-br"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg flex items-center space-x-2 font-electro">
            <img src="/zorb.png" alt="Zorb" style={{width: '24px', height: '24px'}} className="rounded-full alien-float" />
            <span className="holographic-text">Alien HUD</span>
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold px-3 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Wallet */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Wallet</span>
              <span className="font-mono text-cyan-400 text-base tracking-wide">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>

            {/* Alien Points - hero section */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Alien Points</div>
              <div className="text-3xl font-bold holographic-text font-alien tracking-wide">
                {alienPoints.toLocaleString()} <span className="text-base text-cyan-400/60">AP</span>
              </div>
            </div>

            {/* Chain Balances */}
            {(baseEth > 0 || blastEth > 0 || arbEth > 0) && (
              <div className="space-y-2">
                <div className="text-gray-500 text-xs uppercase tracking-widest">ETH Balances</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {baseEth > 0 && (
                    <div className="flex justify-between items-center bg-black/20 rounded px-3 py-1.5">
                      <span className="text-blue-400 text-sm font-bold">Base</span>
                      <span className="text-blue-300 text-sm font-mono">{baseEth.toFixed(4)} ETH</span>
                    </div>
                  )}
                  {blastEth > 0 && (
                    <div className="flex justify-between items-center bg-black/20 rounded px-3 py-1.5">
                      <span className="text-yellow-400 text-sm font-bold">Blast</span>
                      <span className="text-yellow-300 text-sm font-mono">{blastEth.toFixed(4)} ETH</span>
                    </div>
                  )}
                  {arbEth > 0 && (
                    <div className="flex justify-between items-center bg-black/20 rounded px-3 py-1.5">
                      <span className="text-orange-400 text-sm font-bold">Arbitrum</span>
                      <span className="text-orange-300 text-sm font-mono">{arbEth.toFixed(4)} ETH</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GMB Holdings */}
            {gmbBase > 0 && (
              <div className="space-y-2">
                <div className="text-gray-500 text-xs uppercase tracking-widest">GMB Holdings</div>
                <div className="flex justify-between items-center bg-black/20 rounded px-3 py-1.5">
                  <span className="text-blue-400 text-sm font-bold">Base</span>
                  <span className="text-blue-300 text-sm font-mono">{gmbBalanceBase} GMB</span>
                </div>
              </div>
            )}

            {/* Add Token Button */}
            <div className="pt-2 border-t border-cyan-500/20">
              <button
                onClick={() => addTokenToMetaMask(GMB_TOKEN_ADDRESS_BASE, 'GMB', 18, 'Base', base.id)}
                className="w-full px-4 py-2 text-sm font-bold tracking-wider alien-button alien-button-purple text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                + Add GMB to Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
