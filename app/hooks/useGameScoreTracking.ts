import { useEffect } from 'react';
import { useUsername } from '../context/AuthContext';

export function useGameScoreTracking() {
  const { username } = useUsername();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Listen for game over events from Godot games
      if (event.data && event.data.type === 'GAME_OVER') {
        const { game, score, kills, crystals, healthDrops, roomsExplored, highestLevel } = event.data;

        if (!username) {
          console.warn('Cannot submit score - no username set');
          return;
        }

        if (!game || typeof score !== 'number') {
          console.warn('Invalid game over data:', event.data);
          return;
        }

        try {
          // Build request body with optional Catacombs stats
          const requestBody: any = {
            username,
            game,
            score,
          };

          // Add Catacombs-specific stats if present
          if (game === 'catacombs') {
            if (typeof kills === 'number') requestBody.kills = kills;
            if (typeof crystals === 'number') requestBody.crystals = crystals;
            if (typeof healthDrops === 'number') requestBody.healthDrops = healthDrops;
            if (typeof roomsExplored === 'number') requestBody.roomsExplored = roomsExplored;
            if (typeof highestLevel === 'number') requestBody.highestLevel = highestLevel;
          }

          const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          const data = await response.json();

          if (data.success) {
            console.log('Score submitted successfully:', { username, game, score });
          } else {
            console.error('Failed to submit score:', data.error);
          }
        } catch (error) {
          console.error('Error submitting score:', error);
        }
      }

      // Also listen for alien catacombs stats (for backward compatibility)
      if (event.data && event.data.type === 'ALIEN_CATACOMBS_STATS') {
        // You can track real-time stats here if needed
        console.log('Alien Catacombs stats:', event.data.stats);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [username]);
}
