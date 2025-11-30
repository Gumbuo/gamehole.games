import { useEffect } from 'react';

export function useGameScoreTracking() {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Listen for game over events from Godot games
      if (event.data && event.data.type === 'GAME_OVER') {
        const { game, score, kills, crystals, healthDrops, roomsExplored, highestLevel } = event.data;

        if (!game || typeof score !== 'number') {
          console.warn('Invalid game over data:', event.data);
          return;
        }

        // Log game stats (anonymous tracking)
        console.log('Game Over:', { game, score, kills, crystals, healthDrops, roomsExplored, highestLevel });
      }

      // Also listen for alien catacombs stats (for backward compatibility)
      if (event.data && event.data.type === 'ALIEN_CATACOMBS_STATS') {
        console.log('Alien Catacombs stats:', event.data.stats);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
}
