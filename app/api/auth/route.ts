import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { kv } from '@vercel/kv';

// Persistent storage using Vercel KV
interface User {
  username: string;
  passwordHash: string;
  createdAt: number;
}

interface Session {
  token: string;
  username: string;
  expiresAt: number;
}

// KV keys
const USERS_KEY = 'gamehole:users';
const SESSIONS_KEY = 'gamehole:sessions';

// Helper functions to interact with KV
async function getUsers(): Promise<User[]> {
  const users = await kv.get<User[]>(USERS_KEY);
  return users || [];
}

async function saveUsers(users: User[]): Promise<void> {
  await kv.set(USERS_KEY, users);
}

async function getSessions(): Promise<Session[]> {
  const sessions = await kv.get<Session[]>(SESSIONS_KEY);
  return sessions || [];
}

async function saveSessions(sessions: Session[]): Promise<void> {
  await kv.set(SESSIONS_KEY, sessions);
}

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to generate session token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Clean up expired sessions
async function cleanExpiredSessions(): Promise<void> {
  const now = Date.now();
  const sessions = await getSessions();
  const validSessions = sessions.filter(s => s.expiresAt > now);
  if (validSessions.length !== sessions.length) {
    await saveSessions(validSessions);
  }
}

// Register new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, token } = body;

    if (action === 'register') {
      // Validate inputs
      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'Username and password are required' },
          { status: 400 }
        );
      }

      if (username.length < 3 || username.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Username must be 3-20 characters' },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Check if username already exists
      const users = await getUsers();
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 409 }
        );
      }

      // Create new user
      const user: User = {
        username,
        passwordHash: hashPassword(password),
        createdAt: Date.now(),
      };

      users.push(user);
      await saveUsers(users);

      // Create session
      const sessionToken = generateToken();
      const session: Session = {
        token: sessionToken,
        username: user.username,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const sessions = await getSessions();
      sessions.push(session);
      await saveSessions(sessions);
      await cleanExpiredSessions();

      return NextResponse.json({
        success: true,
        token: sessionToken,
        username: user.username,
        message: 'Account created successfully',
      });
    }

    if (action === 'login') {
      // Validate inputs
      if (!username || !password) {
        return NextResponse.json(
          { success: false, error: 'Username and password are required' },
          { status: 400 }
        );
      }

      // Find user
      const users = await getUsers();
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Verify password
      const passwordHash = hashPassword(password);
      if (user.passwordHash !== passwordHash) {
        return NextResponse.json(
          { success: false, error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Create session
      const sessionToken = generateToken();
      const session: Session = {
        token: sessionToken,
        username: user.username,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const sessions = await getSessions();
      sessions.push(session);
      await saveSessions(sessions);
      await cleanExpiredSessions();

      return NextResponse.json({
        success: true,
        token: sessionToken,
        username: user.username,
        message: 'Login successful',
      });
    }

    if (action === 'logout') {
      if (token) {
        const sessions = await getSessions();
        const updatedSessions = sessions.filter(s => s.token !== token);
        await saveSessions(updatedSessions);
      }

      return NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// Verify session token
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    await cleanExpiredSessions();

    const sessions = await getSessions();
    const session = sessions.find(s => s.token === token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const users = await getUsers();
    const user = users.find(u => u.username === session.username);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username: user.username,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
