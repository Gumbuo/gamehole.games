"use client";
import dynamic from "next/dynamic";
import Link from "next/link";

const AlienArmory = dynamic(() => import("../components/AlienArmory"), { ssr: false });

export default function ArmoryPage() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0b0c10'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        background: 'linear-gradient(to bottom, #1f2833, #0b0c10)',
        borderBottom: '2px solid #45a29e',
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#66fcf1',
            textDecoration: 'none',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '14px',
            padding: '8px 16px',
            background: 'rgba(102, 252, 241, 0.1)',
            border: '1px solid #45a29e',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
        >
          ← Back to Game Hole
        </Link>
        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '24px',
          color: '#66fcf1',
          margin: 0,
          textShadow: '0 0 10px rgba(102, 252, 241, 0.5)',
        }}>
          Alien Armory
        </h1>
        <div style={{ width: '150px' }} /> {/* Spacer for centering */}
      </div>

      {/* Game */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '20px 0'
      }}>
        <AlienArmory />
      </div>
    </div>
  );
}
