"use client";
import { useAccount, useBalance } from "wagmi";
import { useAlienPoints as useAlienPointsEconomy } from "../app/context/AlienPointsEconomy";
import { useAlienPoints as useAlienPointsSimple } from "../app/context/AlienPointContext";
import React, { useEffect, useState } from "react";
import { base, blast, arbitrum } from "wagmi/chains";
import { formatUnits } from "viem";

const GMB_TOKEN_ADDRESS_BASE = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const GMB_TOKEN_ADDRESS_ABSTRACT = "0x1660AA473D936029C7659e7d047F05EcF28D40c9";
const ABSTRACT_CHAIN_ID = 2741;
const ABSTRACT_TESTNET_CHAIN_ID = 11124;

// Helper to format balance from wagmi v3 format
const formatBalance = (balance: { value: bigint; decimals: number } | undefined): string => {
  if (!balance) return "0";
  return formatUnits(balance.value, balance.decimals);
};

export function AlienHUD() {
  const { address, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(true);
  const [gmbBalanceBase, setGmbBalanceBase] = useState<string>("0");
  const [gmbBalanceAbstract, setGmbBalanceAbstract] = useState<string>("0");

  // Mainnet ETH balances
  const { data: ethBalanceBase } = useBalance({
    address,
    chainId: base.id
  });

  const { data: ethBalanceAbstract } = useBalance({
    address,
    chainId: ABSTRACT_CHAIN_ID
  });

  const { data: ethBalanceAbstractTestnet } = useBalance({
    address,
    chainId: ABSTRACT_TESTNET_CHAIN_ID
  });

  const { data: ethBalanceBlast } = useBalance({
    address,
    chainId: blast.id
  });

  const { data: ethBalanceArbitrum } = useBalance({
    address,
    chainId: arbitrum.id
  });

  // Fetch GMB token balances via API (wagmi v3 doesn't support token param in useBalance)
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

  // Log whenever userBalances changes
  useEffect(() => {
    console.log('📊 [HUD] userBalances changed:', userBalances);
  }, [userBalances]);

  // Compute alien points directly from state - no local state needed!
  const alienPoints = React.useMemo(() => {
    console.log('🔄 [HUD] useMemo recalculating...', {
      address,
      simplePoints: alienPointsSimple?.alienPoints,
      userBalances,
      addressBalance: address ? userBalances[address.toLowerCase()] : 'no address'
    });

    // PRIORITY 1: Use economy context if available (drip station, wheel, etc.)
    if (address && userBalances[address.toLowerCase()] !== undefined) {
      const balance = userBalances[address.toLowerCase()];
      console.log("🎯 [HUD] Using economy context balance:", balance, "for", address);
      return balance;
    }

    // PRIORITY 2: Fall back to simple context (maze game only)
    if (alienPointsSimple && alienPointsSimple.alienPoints !== undefined) {
      console.log("🎯 [HUD] Using simple context points (fallback):", alienPointsSimple.alienPoints);
      return alienPointsSimple.alienPoints;
    }

    console.log("🎯 [HUD] Returning 0 (no context data)");
    return 0;
  }, [address, alienPointsSimple?.alienPoints, userBalances]);

  // Fetch initial balance when address changes (triggers API call if not cached)
  useEffect(() => {
    if (address && userBalances[address.toLowerCase()] === undefined) {
      console.log("📡 HUD: Fetching initial balance for", address);
      getUserBalance(address);
    }
  }, [address, getUserBalance, userBalances]);

  useEffect(() => {
    console.log("Abstract Mainnet Balance:", ethBalanceAbstract);
    console.log("Abstract Testnet Balance:", ethBalanceAbstractTestnet);
  }, [ethBalanceAbstract, ethBalanceAbstractTestnet]);

  // Add token to MetaMask with chain switching
  const addTokenToMetaMask = async (tokenAddress: string, symbol: string, decimals: number, chainName: string, chainId?: number) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // Switch to correct chain first if chainId is provided
        if (chainId) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
          } catch (switchError: any) {
            // Chain not added to wallet, try adding it
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
          <div className="space-y-3 text-sm">
            <p className="text-gray-400">
              <strong className="text-cyan-400">Wallet:</strong>{" "}
              <span className="font-mono alien-code">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </p>

            {/* Mainnet Balances - Only show chains with balance > 0 */}
            {(parseFloat(formatBalance(ethBalanceBase)) > 0 ||
              parseFloat(formatBalance(ethBalanceAbstract)) > 0 ||
              parseFloat(formatBalance(ethBalanceBlast)) > 0 ||
              parseFloat(formatBalance(ethBalanceArbitrum)) > 0) && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">MAINNET BALANCES:</p>
                <div className="ml-3 space-y-1">
                  {parseFloat(formatBalance(ethBalanceBase)) > 0 && (
                    <p className="text-blue-400 alien-code">
                      <strong>Base:</strong> {parseFloat(formatBalance(ethBalanceBase)).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(formatBalance(ethBalanceAbstract)) > 0 && (
                    <p className="text-purple-400 alien-code">
                      <strong>Abstract:</strong> {parseFloat(formatBalance(ethBalanceAbstract)).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(formatBalance(ethBalanceBlast)) > 0 && (
                    <p className="text-yellow-400 alien-code">
                      <strong>Blast:</strong> {parseFloat(formatBalance(ethBalanceBlast)).toFixed(4)} ETH
                    </p>
                  )}
                  {parseFloat(formatBalance(ethBalanceArbitrum)) > 0 && (
                    <p className="text-orange-400 alien-code">
                      <strong>Arbitrum:</strong> {parseFloat(formatBalance(ethBalanceArbitrum)).toFixed(4)} ETH
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Testnet Balances - Only show chains with balance > 0 */}
            {parseFloat(formatBalance(ethBalanceAbstractTestnet)) > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">TESTNET BALANCES:</p>
                <div className="ml-3 space-y-1">
                  <p className="text-pink-400 alien-code">
                    <strong>Abstract Testnet:</strong> {parseFloat(formatBalance(ethBalanceAbstractTestnet)).toFixed(4)} ETH
                  </p>
                </div>
              </div>
            )}

            {/* GMB Holdings - Only show chains with balance > 0 */}
            {(parseFloat(gmbBalanceBase) > 0 ||
              parseFloat(gmbBalanceAbstract) > 0) && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">GMB Holdings:</p>
                <div className="ml-3 space-y-1">
                  {parseFloat(gmbBalanceBase) > 0 && (
                    <p className="text-blue-400 alien-code">
                      <strong>Base:</strong> {gmbBalanceBase} GMB
                    </p>
                  )}
                  {parseFloat(gmbBalanceAbstract) > 0 && (
                    <p className="text-purple-400 alien-code">
                      <strong>Abstract:</strong> {gmbBalanceAbstract} GMB
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-cyan-500/30">
              <p className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">AlienPoints:</span>
                <span className="text-3xl font-bold holographic-text font-alien">{alienPoints.toLocaleString()}</span>
              </p>
              <p className="text-xs text-gray-500 text-right mt-1">AP</p>
            </div>

            {/* Add Token Buttons */}
            <div className="mt-4 pt-3 border-t border-cyan-500/30 flex flex-col items-center space-y-2">
              <button
                onClick={() => addTokenToMetaMask(GMB_TOKEN_ADDRESS_BASE, 'GMB', 18, 'Base', base.id)}
                className="w-full px-4 py-2 text-sm font-bold tracking-wider alien-button alien-button-purple text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                + Add GMB (Base)
              </button>
              <button
                onClick={() => addTokenToMetaMask(GMB_TOKEN_ADDRESS_ABSTRACT, 'GMB', 18, 'Abstract', ABSTRACT_CHAIN_ID)}
                className="w-full px-4 py-2 text-sm font-bold tracking-wider alien-button alien-button-gold text-black rounded-lg transition-all duration-300 hover:scale-105"
              >
                + Add GMB (Abstract)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
