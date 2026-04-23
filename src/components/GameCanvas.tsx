import { useEffect, useRef, forwardRef } from 'react';
import { GameEngine } from '../game/GameEngine';

interface GameCanvasProps {
  onGameOver: (score: number, waves: number, kills: number) => void;
  onWaveComplete: (completedWave: number) => void;
}

export const GameCanvas = forwardRef<GameEngine | null, GameCanvasProps>(({ 
  onGameOver,
  onWaveComplete
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);

    // Expose real engine instance to parent (not a partial proxy)
    if (typeof ref === 'function') {
      ref(engine);
    } else if (ref) {
      ref.current = engine;
    }

    engine.onGameOver = onGameOver;
    engine.onWaveComplete = onWaveComplete;

    engine.start();

    return () => {
      engine.destroy();
      if (typeof ref === 'function') {
        ref(null);
      } else if (ref) {
        ref.current = null;
      }
    };
  }, [onGameOver, onWaveComplete, ref]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block touch-none"
      style={{ cursor: 'crosshair' }}
    />
  );
});
