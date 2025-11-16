"use client";
import { useState } from 'react';
import { useUsername } from '../context/UsernameContext';

export default function UsernameModal() {
  const { username, setUsername } = useUsername();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  if (username) return null; // Don't show if username already set

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = inputValue.trim();

    if (!trimmed) {
      setError('Please enter a username');
      return;
    }

    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }

    setUsername(trimmed);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1e)',
        border: '2px solid #00d4ff',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
      }}>
        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '28px',
          color: '#00d4ff',
          marginBottom: '10px',
          textAlign: 'center',
        }}>
          Welcome to Game Hole!
        </h2>

        <p style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '14px',
          color: '#00ff99',
          marginBottom: '30px',
          textAlign: 'center',
        }}>
          Claim your username to appear on the leaderboard
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder="Enter username..."
            maxLength={20}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontFamily: 'Orbitron, sans-serif',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid #00d4ff',
              borderRadius: '6px',
              color: '#fff',
              marginBottom: '10px',
              outline: 'none',
            }}
            autoFocus
          />

          {error && (
            <p style={{
              color: '#ff0066',
              fontSize: '12px',
              marginBottom: '15px',
              fontFamily: 'Share Tech Mono, monospace',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
            }}
          >
            Claim Username
          </button>
        </form>

        <p style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '20px',
          textAlign: 'center',
          fontFamily: 'Share Tech Mono, monospace',
        }}>
          You can change this later in settings
        </p>
      </div>
    </div>
  );
}
