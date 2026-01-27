import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { BettingUser, Transaction } from '@/lib/betting/types';
import { REDIS_KEYS, PLATFORM_CONSTANTS, generateAuthMessage } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// Withdrawal requests queue (for admin to process)
const WITHDRAWAL_QUEUE_KEY = 'st:withdrawals:pending';

interface WithdrawalRequest {
  id: string;
  wallet: string;
  amount: string;
  destinationWallet: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: number;
  processedAt: number | null;
  processedBy: string | null;
  txHash: string | null;
  rejectionReason: string | null;
}

// POST /api/betting/withdraw - Request a withdrawal
export async function POST(request: NextRequest) {
  try {
    const kv = getKV();
    const body = await request.json();
    const { wallet, amount, signature, message } = body;

    if (!wallet || !amount || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Wallet, amount, signature, and message required' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const amountBigInt = BigInt(amount);

    // Validate minimum withdrawal
    if (amountBigInt < BigInt(PLATFORM_CONSTANTS.MIN_WITHDRAWAL)) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal is ${Number(PLATFORM_CONSTANTS.MIN_WITHDRAWAL) / 1e18} ETH` },
        { status: 400 }
      );
    }

    // Get user
    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedWallet));
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify signature
    if (!message.includes(user.nonce)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired nonce. Please refresh and try again.' },
        { status: 401 }
      );
    }

    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: wallet as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (verifyError) {
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: 'Account is suspended. Contact support.' },
        { status: 403 }
      );
    }

    // Check balance (include withdrawal fee in check)
    const totalRequired = amountBigInt + BigInt(PLATFORM_CONSTANTS.WITHDRAWAL_FEE);
    if (BigInt(user.platformBalance) < totalRequired) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance (including withdrawal fee)' },
        { status: 400 }
      );
    }

    // Deduct from balance immediately (lock the funds)
    user.platformBalance = (BigInt(user.platformBalance) - totalRequired).toString();
    user.nonce = crypto.randomUUID(); // Invalidate nonce
    user.lastActive = Date.now();
    await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

    // Create withdrawal request
    const withdrawalRequest: WithdrawalRequest = {
      id: crypto.randomUUID(),
      wallet: normalizedWallet,
      amount: amount,
      destinationWallet: normalizedWallet, // Same wallet by default
      status: 'pending',
      requestedAt: Date.now(),
      processedAt: null,
      processedBy: null,
      txHash: null,
      rejectionReason: null,
    };

    // Add to withdrawal queue
    const queue = await kv.get<WithdrawalRequest[]>(WITHDRAWAL_QUEUE_KEY) || [];
    queue.push(withdrawalRequest);
    await kv.set(WITHDRAWAL_QUEUE_KEY, queue);

    // Record transaction (pending)
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      wallet: normalizedWallet,
      type: 'withdrawal',
      amount: amount,
      txHash: null,
      status: 'pending',
      relatedMatchId: null,
      relatedBetId: null,
      notes: `Withdrawal request #${withdrawalRequest.id}`,
      createdAt: Date.now(),
      completedAt: null,
    };

    await kv.set(REDIS_KEYS.TX(transaction.id), transaction);

    const userTxs = await kv.get<string[]>(REDIS_KEYS.TXS_USER(normalizedWallet)) || [];
    userTxs.unshift(transaction.id);
    await kv.set(REDIS_KEYS.TXS_USER(normalizedWallet), userTxs.slice(0, 100));

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawalRequest.id,
        amount: amount,
        fee: PLATFORM_CONSTANTS.WITHDRAWAL_FEE,
        status: 'pending',
        message: 'Withdrawal request submitted. You will receive ETH within 24 hours.',
      },
      newBalance: user.platformBalance,
    });

  } catch (error) {
    console.error('POST /api/betting/withdraw error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/betting/withdraw?wallet=0x... - Get withdrawal history
export async function GET(request: NextRequest) {
  try {
    const kv = getKV();
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet required' },
        { status: 400 }
      );
    }

    // Get all withdrawal requests for this user
    const queue = await kv.get<WithdrawalRequest[]>(WITHDRAWAL_QUEUE_KEY) || [];
    const userWithdrawals = queue.filter(w => w.wallet === wallet);

    return NextResponse.json({
      success: true,
      withdrawals: userWithdrawals,
      withdrawalFee: PLATFORM_CONSTANTS.WITHDRAWAL_FEE,
      minWithdrawal: PLATFORM_CONSTANTS.MIN_WITHDRAWAL,
    });

  } catch (error) {
    console.error('GET /api/betting/withdraw error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
