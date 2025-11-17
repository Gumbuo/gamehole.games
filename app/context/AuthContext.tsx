"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Try to restore session from localStorage
    const token = localStorage.getItem('gamehole_auth_token');
    if (token) {
      verifySession(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifySession = async (token: string) => {
    try {
      const response = await fetch('/api/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.username) {
        setUsername(data.username);
        setIsAuthenticated(true);
      } else {
        // Invalid token, clear it
        if (isClient) {
          localStorage.removeItem('gamehole_auth_token');
        }
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      if (isClient) {
        localStorage.removeItem('gamehole_auth_token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        if (isClient) {
          localStorage.setItem('gamehole_auth_token', data.token);
        }
        setUsername(data.username);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        if (isClient) {
          localStorage.setItem('gamehole_auth_token', data.token);
        }
        setUsername(data.username);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    const token = isClient ? localStorage.getItem('gamehole_auth_token') : null;

    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logout',
          token,
        }),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    if (isClient) {
      localStorage.removeItem('gamehole_auth_token');
    }
    setUsername(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Backward compatibility export for useUsername
export function useUsername() {
  const { username } = useAuth();
  return { username, setUsername: () => {}, clearUsername: () => {} };
}
