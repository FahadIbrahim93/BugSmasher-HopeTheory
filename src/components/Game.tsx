import { useState, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { GameOver } from './GameOver';
import { UpgradeMenu } from './UpgradeMenu';
import { PauseMenu } from './PauseMenu';
import { TutorialOverlay } from './TutorialOverlay';
import { GameEngine } from '../game/GameEngine';
import { GameConfig } from '../game/GameConfig';
import { achievementSystem } from '../game/AchievementSystem';
import { useEffect } from 'react';
import { cloudSaveManager } from '../game/database/CloudSaveManager';
import type { GameStateSnapshot } from '../game/database/types';

export function Game({ onMainMenu, resumeState }: { onMainMenu: () => void; resumeState?: GameStateSnapshot | null }) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalWaves, setFinalWaves] = useState(1);
  const [finalKills, setFinalKills] = useState(0);
  const [finalSessionXP, setFinalSessionXP] = useState(0);
  const [finalSessionCrystals, setFinalSessionCrystals] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameId, setGameId] = useState(0);
  
  const [finalScore, setFinalScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [upgradeLevels, setUpgradeLevels] = useState({
    health: 0,
    radius: 0,
    turret: 0,
  });
  
  const engineRef = useRef<GameEngine | null>(null);

  const handleGameOver = useCallback((score: number, waves: number, kills: number, sessionXP: number, sessionCrystals: number) => {
    setFinalScore(score);
    setFinalWaves(waves);
    setFinalKills(kills);
    setFinalSessionXP(sessionXP);
    setFinalSessionCrystals(sessionCrystals);
    setIsGameOver(true);
    // Clear cloud save on death
    cloudSaveManager.deleteSave();
  }, []);

  const handleWaveComplete = useCallback((completedWave: number) => {
    if (engineRef.current) {
      achievementSystem.onWaveComplete(completedWave);
      setFinalScore(engineRef.current.score);
      setCurrentWave(engineRef.current.wave);
    }
    setIsUpgrading(true);
  }, []);

  const handleUpgrade = (type: 'health' | 'radius' | 'turret', cost: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.score < cost) return;
    engine.score -= cost;
    setFinalScore(engine.score);
    if (type === 'health') {
      engine.maxHealth += GameConfig.upgrades.health.healAmount;
      engine.health = engine.maxHealth;
    } else if (type === 'radius') {
      engine.clickRadiusMultiplier *= GameConfig.upgrades.radius.radiusMultiplier;
    } else if (type === 'turret') {
      engine.autoTurretLevel += 1;
    }
    setUpgradeLevels((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const handleNextWave = () => {
    setIsUpgrading(false);
    const engine = engineRef.current;
    if (engine) {
      engine.resume();
    }
  };

  const togglePause = useCallback(() => {
    if (isGameOver || isUpgrading) return;
    const engine = engineRef.current;
    if (engine) {
      engine.isPaused = !engine.isPaused;
      setIsPaused(engine.isPaused);
    }
  }, [isGameOver, isUpgrading]);

  const handleSaveQuit = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.saveAndQuit();
    }
    setIsPaused(false);
    onMainMenu();
  }, [onMainMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  const handleRetry = () => {
    setIsGameOver(false);
    setIsUpgrading(false);
    setFinalScore(0);
    setCurrentWave(1);
    setUpgradeLevels({ health: 0, radius: 0, turret: 0 });
    setGameId(id => id + 1);
  };

  return (
    <div className="relative w-full h-full">
      <GameCanvas 
        ref={engineRef}
        key={gameId}
        onGameOver={handleGameOver}
        onWaveComplete={handleWaveComplete}
        resumeState={resumeState}
      />
      
      {!isGameOver && <HUD engineRef={engineRef} onPauseToggle={togglePause} isPaused={isPaused} />}
      
      {isPaused && !isGameOver && !isUpgrading && (
        <PauseMenu 
          onResume={togglePause}
          onMainMenu={onMainMenu}
          onSaveQuit={handleSaveQuit}
        />
      )}
      
      {isUpgrading && !isGameOver && (
        <UpgradeMenu 
          score={finalScore} 
          onUpgrade={handleUpgrade} 
          onNextWave={handleNextWave} 
          wave={currentWave}
          healthLevel={upgradeLevels.health}
          radiusLevel={upgradeLevels.radius}
          turretLevel={upgradeLevels.turret}
        />
      )}

      {!isGameOver && !isUpgrading && (
        <TutorialOverlay engineRef={engineRef} />
      )}
      
      {isGameOver && (
        <GameOver 
          score={finalScore} 
          waves={finalWaves}
          kills={finalKills}
          sessionXP={finalSessionXP}
          sessionCrystals={finalSessionCrystals}
          onRetry={handleRetry}
          onMainMenu={onMainMenu} 
        />
      )}
    </div>
  );
}
