"use client";
import { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import LoginModal from './components/LoginModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoginModal />
      {children}
    </AuthProvider>
  );
}
