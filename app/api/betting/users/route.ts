import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyMessage } from 'viem';
import { BettingUser } from '@/lib/betting/types';
import { REDIS_KEYS, generateAuthMessage } from '@/lib/betting/constants';
import { getKV } from '@/lib/betting/mock-kv';

// Create default user object
function createDefaultUser(wallet: string): BettingUser {
  return {
    wallet: wallet.toLowerCase(),
    platformBalance: "0",
    totalDeposited: "0",
    totalWithdrawn: "0",
    totalWon: "0",
    totalLost: "0",
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    betsPlaced: 0,
    betsWon: 0,
    betsLost: 0,
    currentTeamId: null,
    isAdmin: false,
    isBanned: false,
    banReason: null,
    createdAt: Date.now(),
    lastActive: Date.now(),
    nonce: crypto.randomBytes(32).toString('hex'),
  };
}

// GET /api/betting/users?wallet=0x... - Get user info or nonce for auth
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet')?.toLowerCase();
    const action = searchParams.get('action'); // 'nonce' to get auth nonce

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate wallet format
    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/i)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const kv = getKV();

    // Get or create user
    let user = await kv.get<BettingUser>(REDIS_KEYS.USER(wallet));

    if (!user) {
      user = createDefaultUser(wallet);
      await kv.set(REDIS_KEYS.USER(wallet), user);

      // Add to users list
      const usersList = await kv.get<string[]>(REDIS_KEYS.USERS_LIST) || [];
      if (!usersList.includes(wallet)) {
        usersList.push(wallet);
        await kv.set(REDIS_KEYS.USERS_LIST, usersList);
      }
    }

    // If requesting nonce for auth, generate new one
    if (action === 'nonce') {
      user.nonce = crypto.randomBytes(32).toString('hex');
      await kv.set(REDIS_KEYS.USER(wallet), user);

      return NextResponse.json({
        success: true,
        nonce: user.nonce,
        message: generateAuthMessage(user.nonce),
      });
    }

    // Return user info (without nonce)
    const { nonce, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      user: safeUser,
    });

  } catch (error) {
    console.error('GET /api/betting/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/betting/users - Verify wallet signature (authenticate)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, signature, message } = body;

    if (!wallet || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Wallet, signature, and message required' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const kv = getKV();

    // Get user
    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedWallet));

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Request nonce first.' },
        { status: 404 }
      );
    }

    // Verify the message contains the correct nonce
    if (!message.includes(user.nonce)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired nonce' },
        { status: 401 }
      );
    }

    // Verify the signature using viem
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: wallet as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
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

    // Update last active and generate new nonce
    user.lastActive = Date.now();
    user.nonce = crypto.randomBytes(32).toString('hex');
    await kv.set(REDIS_KEYS.USER(normalizedWallet), user);

    // Return user info (without nonce)
    const { nonce, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: safeUser,
    });

  } catch (error) {
    console.error('POST /api/betting/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/betting/users - Update user (admin only or self for limited fields)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminWallet, targetWallet, updates, signature, message } = body;

    if (!targetWallet) {
      return NextResponse.json(
        { success: false, error: 'Target wallet required' },
        { status: 400 }
      );
    }

    const normalizedTarget = targetWallet.toLowerCase();
    const kv = getKV();

    // Get target user
    const user = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedTarget));

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // For admin operations (ban, set admin, etc.)
    if (adminWallet && signature && message) {
      const normalizedAdmin = adminWallet.toLowerCase();
      const admin = await kv.get<BettingUser>(REDIS_KEYS.USER(normalizedAdmin));

      if (!admin?.isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - admin only' },
          { status: 403 }
        );
      }

      // Verify admin signature
      const isValid = await verifyMessage({
        address: adminWallet as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid admin signature' },
          { status: 401 }
        );
      }

      // Apply admin updates
      if (typeof updates.isBanned === 'boolean') {
        user.isBanned = updates.isBanned;
        user.banReason = updates.banReason || null;
      }
      if (typeof updates.isAdmin === 'boolean') {
        user.isAdmin = updates.isAdmin;
      }
    }

    await kv.set(REDIS_KEYS.USER(normalizedTarget), user);

    const { nonce, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      user: safeUser,
    });

  } catch (error) {
    console.error('PATCH /api/betting/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
