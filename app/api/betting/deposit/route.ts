import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { BettingUser, Transaction } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_WALLET } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// Create public client for reading blockchain
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

// Track processed deposits to prevent double-crediting
const PROCESSED_DEPOSITS_KEY = 'st:deposits:processed';

// POST /api/betting/deposit - Record a deposit after user sends ETH
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { wallet, txHash } = body;

    if (!wallet || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Wallet and transaction hash required' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    if (!PLATFORM_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Platform wallet not configured' },
        { status: 503 }
      );
    }

    // Check if this tx was already processed
    const processedTxs = await kv.get<string[]>(PROCESSED_DEPOSITS_KEY) || [];
    if (processedTxs.includes(txHash.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Deposit already processed' },
        { status: 409 }
      );
    }

    // Verify the transaction on-chain
    let tx;
    try {
      tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
    } catch (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found on chain' },
        { status: 404 }
      );
    }

    if (!tx) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Wait for transaction to be confirmed
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    } catch (receiptError) {
      return NextResponse.json(
        { success: false, error: 'Transaction not yet confirmed. Please wait and try again.' },
        { status: 202 }
      );
    }

    if (!receipt || receipt.status !== 'success') {
      return NextResponse.json(
        { success: false, error: 'Transaction failed or not confirmed' },
        { status: 400 }
      );
    }

    // Verify recipient is platform wallet
    if (tx.to?.toLowerCase() !== PLATFORM_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipient - must send to platform wallet' },
        { status: 400 }
      );
    }

    // Verify sender matches the claimed wallet
    if (tx.from.toLowerCase() !== normalizedWallet) {
      return NextResponse.json(
        { success: false, error: 'Sender wallet mismatch' },
        { status: 400 }
      );
    }

    // Get user
    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedWallet));
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please connect wallet first.' },
        { status: 404 }
      );
    }

    // Get the deposit amount from transaction
    const depositAmount = tx.value.toString();

    if (BigInt(depositAmount) === BigInt(0)) {
      return NextResponse.json(
        { success: false, error: 'Zero value transaction' },
        { status: 400 }
      );
    }

    // Update user balance
    user.platformBalance = (BigInt(user.platformBalance) + BigInt(depositAmount)).toString();
    user.totalDeposited = (BigInt(user.totalDeposited) + BigInt(depositAmount)).toString();
    user.lastActive = Date.now();

    await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

    // Mark tx as processed
    processedTxs.push(txHash.toLowerCase());
    await kv.set(PROCESSED_DEPOSITS_KEY, processedTxs);

    // Record transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      wallet: normalizedWallet,
      type: 'deposit',
      amount: depositAmount,
      txHash: txHash.toLowerCase(),
      status: 'completed',
      relatedMatchId: null,
      relatedBetId: null,
      notes: 'ETH deposit to platform',
      createdAt: Date.now(),
      completedAt: Date.now(),
    };

    await kv.set(REDIS_KEYS.TX(transaction.id), transaction);

    // Add to user's transaction list
    const userTxs = await kv.get<string[]>(REDIS_KEYS.TXS_USER(normalizedWallet)) || [];
    userTxs.unshift(transaction.id);
    await kv.set(REDIS_KEYS.TXS_USER(normalizedWallet), userTxs.slice(0, 100)); // Keep last 100

    return NextResponse.json({
      success: true,
      deposit: {
        amount: depositAmount,
        txHash,
      },
      newBalance: user.platformBalance,
    });

  } catch (error) {
    console.error('POST /api/betting/deposit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/betting/deposit - Get platform wallet address for deposits
export async function GET() {
  if (!PLATFORM_WALLET) {
    return NextResponse.json(
      { success: false, error: 'Platform wallet not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    platformWallet: PLATFORM_WALLET,
    chain: 'Base',
    chainId: 8453,
  });
}
