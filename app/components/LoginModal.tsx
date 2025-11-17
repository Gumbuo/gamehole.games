"use client";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't show if already authenticated or still loading
  if (isAuthenticated || isLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'register' && trimmedPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    const result = mode === 'login'
      ? await login(trimmedUsername, trimmedPassword)
      : await register(trimmedUsername, trimmedPassword);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'An error occurred');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
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
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)',
      }}>
        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '32px',
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
          {mode === 'login' ? 'Login to track your scores' : 'Create an account to get started'}
        </p>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
        }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setConfirmPassword('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              background: mode === 'login'
                ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                : 'rgba(0, 212, 255, 0.1)',
              color: mode === 'login' ? '#000' : '#00d4ff',
              border: `2px solid ${mode === 'login' ? '#00d4ff' : '#00d4ff44'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setConfirmPassword('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              fontSize: '14px',
              background: mode === 'register'
                ? 'linear-gradient(135deg, #00d4ff, #0099cc)'
                : 'rgba(0, 212, 255, 0.1)',
              color: mode === 'register' ? '#000' : '#00d4ff',
              border: `2px solid ${mode === 'register' ? '#00d4ff' : '#00d4ff44'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Username"
            maxLength={20}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontFamily: 'Share Tech Mono, monospace',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid #00d4ff',
              borderRadius: '6px',
              color: '#fff',
              marginBottom: '15px',
              outline: 'none',
            }}
            autoFocus
          />

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Password"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontFamily: 'Share Tech Mono, monospace',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid #00d4ff',
              borderRadius: '6px',
              color: '#fff',
              marginBottom: mode === 'register' ? '15px' : '10px',
              outline: 'none',
            }}
          />

          {mode === 'register' && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Confirm Password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontFamily: 'Share Tech Mono, monospace',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid #00d4ff',
                borderRadius: '6px',
                color: '#fff',
                marginBottom: '10px',
                outline: 'none',
              }}
            />
          )}

          {error && (
            <p style={{
              color: '#ff0066',
              fontSize: '13px',
              marginBottom: '15px',
              fontFamily: 'Share Tech Mono, monospace',
              textAlign: 'center',
            }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 'bold',
              background: isSubmitting
                ? 'rgba(0, 212, 255, 0.3)'
                : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: isSubmitting ? '#666' : '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              boxShadow: isSubmitting ? 'none' : '0 0 20px rgba(0, 212, 255, 0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{
            fontSize: '12px',
            color: '#00ff99',
            marginTop: '20px',
            textAlign: 'center',
            fontFamily: 'Share Tech Mono, monospace',
          }}>
            Don't have an account? Click Register above
          </p>
        )}

        {mode === 'register' && (
          <p style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '20px',
            textAlign: 'center',
            fontFamily: 'Share Tech Mono, monospace',
          }}>
            By creating an account, your scores will be saved to the leaderboard
          </p>
        )}
      </div>
    </div>
  );
}
