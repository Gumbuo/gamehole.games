import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory storage for users and sessions
// In production, use Vercel KV or another database
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

let users: User[] = [];
let sessions: Session[] = [];

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to generate session token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Clean up expired sessions
function cleanExpiredSessions() {
  const now = Date.now();
  sessions = sessions.filter(s => s.expiresAt > now);
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

      // Create session
      const sessionToken = generateToken();
      const session: Session = {
        token: sessionToken,
        username: user.username,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      };

      sessions.push(session);
      cleanExpiredSessions();

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

      sessions.push(session);
      cleanExpiredSessions();

      return NextResponse.json({
        success: true,
        token: sessionToken,
        username: user.username,
        message: 'Login successful',
      });
    }

    if (action === 'logout') {
      if (token) {
        sessions = sessions.filter(s => s.token !== token);
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

    cleanExpiredSessions();

    const session = sessions.find(s => s.token === token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

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
