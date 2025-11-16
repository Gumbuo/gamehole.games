"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UsernameContextType {
  username: string | null;
  setUsername: (username: string) => void;
  clearUsername: () => void;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

export function UsernameProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load username from localStorage
    const savedUsername = localStorage.getItem('gamehole_username');
    if (savedUsername) {
      setUsernameState(savedUsername);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    setUsernameState(newUsername);
    if (isClient) {
      localStorage.setItem('gamehole_username', newUsername);
    }
  };

  const clearUsername = () => {
    setUsernameState(null);
    if (isClient) {
      localStorage.removeItem('gamehole_username');
    }
  };

  return (
    <UsernameContext.Provider value={{ username, setUsername, clearUsername }}>
      {children}
    </UsernameContext.Provider>
  );
}

export function useUsername() {
  const context = useContext(UsernameContext);
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
}
