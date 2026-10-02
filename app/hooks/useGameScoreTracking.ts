import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useGameScoreTracking() {
  const { username, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Listen for game over events from Godot games
      if (event.data && event.data.type === 'GAME_OVER') {
        const { game, score, kills, crystals, healthDrops, roomsExplored, highestLevel } = event.data;

        if (!game || typeof score !== 'number') {
          console.warn('Invalid game over data:', event.data);
          return;
        }

        if (!isAuthenticated || !username) {
          console.log('Game Over (not logged in, score not saved):', { game, score });
          return;
        }

        try {
          const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              game,
              score,
              kills,
              crystals,
              healthDrops,
              roomsExplored,
              highestLevel,
            }),
          });
          const data = await response.json();
          if (!data.success) {
            console.warn('Score submission rejected:', data.error);
          }
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [username, isAuthenticated]);
}
