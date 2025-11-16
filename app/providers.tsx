"use client";
import { ReactNode } from 'react';
import { UsernameProvider } from './context/UsernameContext';
import UsernameModal from './components/UsernameModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UsernameProvider>
      <UsernameModal />
      {children}
    </UsernameProvider>
  );
}
