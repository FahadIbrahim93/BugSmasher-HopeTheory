import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { Game } from './components/Game';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Preloader } from './components/Preloader';
import { initializeDatabase, restoreUserData, authManager, statsManager } from './game/database';
import type { GameStateSnapshot } from './game/database/types';

export default function App() {
  const [gameState, setGameState] = useState<'preloading' | 'menu' | 'playing'>('preloading');
  const [dbReady, setDbReady] = useState(false);
  const [resumeState, setResumeState] = useState<GameStateSnapshot | null>(null);

  useEffect(() => {
    console.log('Starting app initialization...');
    initializeDatabase();
    authManager.initialize()
      .then(() => {
        console.log('Auth initialized');
        return authManager.checkSession();
      })
      .then(() => {
        console.log('Session checked');
        return restoreUserData();
      })
      .then(() => {
        console.log('User data restored');
        statsManager.initialize();
        console.log('Stats initialized, setting dbReady');
        setDbReady(true);
      })
      .catch((e) => {
        console.error('Initialization error:', e);
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <div className="w-full h-full bg-zinc-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleStart = (state?: GameStateSnapshot) => {
    setResumeState(state ?? null);
    setGameState('playing');
  };

  const handleMainMenu = () => {
    setResumeState(null);
    setGameState('menu');
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full bg-zinc-950 text-white overflow-hidden font-sans">
        {gameState === 'preloading' && (
          <Preloader onComplete={() => setGameState('menu')} />
        )}
        {gameState === 'menu' && (
          <MainMenu onStart={handleStart} />
        )}
        {gameState === 'playing' && (
          <Game 
            onMainMenu={handleMainMenu}
            resumeState={resumeState}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
