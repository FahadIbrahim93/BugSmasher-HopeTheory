import { useEffect, useRef, forwardRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameStateSnapshot } from '../game/database/types';

interface GameCanvasProps {
  onGameOver: (score: number, waves: number, kills: number, sessionXP: number, sessionCrystals: number, missCount: number, playTimeSeconds: number, biomeId: string) => void;
  onWaveComplete: (completedWave: number) => void;
  resumeState?: GameStateSnapshot | null;
}

export const GameCanvas = forwardRef<GameEngine | null, GameCanvasProps>(({ 
  onGameOver,
  onWaveComplete,
  resumeState,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);

    if (typeof ref === 'function') {
      ref(engine);
    } else if (ref) {
      ref.current = engine;
    }

    engine.onGameOver = onGameOver;
    engine.onWaveComplete = onWaveComplete;

    if (resumeState) {
      engine.resumeFromSave(resumeState);
      engine.resume();
    } else {
      engine.start();
    }

    return () => {
      engine.destroy();
      if (typeof ref === 'function') {
        ref(null);
      } else if (ref) {
        ref.current = null;
      }
    };
  }, [onGameOver, onWaveComplete, ref, resumeState]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block touch-none"
      style={{ cursor: 'crosshair' }}
    />
  );
});
