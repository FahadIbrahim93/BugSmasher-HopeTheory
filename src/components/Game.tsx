import { useState, useCallback, useRef } from 'react';
import { GameCanvas } from './GameCanvas';
import { HUD } from './HUD';
import { GameOver } from './GameOver';
import { PrestigeScreen } from './PrestigeScreen';
import { UpgradeMenu } from './UpgradeMenu';
import { PauseMenu } from './PauseMenu';
import { TutorialOverlay } from './TutorialOverlay';
import { GameEngine } from '../game/GameEngine';
import { GameConfig } from '../game/GameConfig';
import { achievementSystem } from '../game/AchievementSystem';
import { biomeManager } from '../game/BiomeManager';
import { saveManager } from '../game/SaveManager';
import { useEffect } from 'react';
import { cloudSaveManager } from '../game/database/CloudSaveManager';
import { authManager } from '../game/database/AuthManager';
import type { GameStateSnapshot } from '../game/database/types';

const PRESTIGE_THRESHOLD = 1000; // Minimum score to unlock prestige offer

export function Game({ onMainMenu, resumeState }: { onMainMenu: () => void; resumeState?: GameStateSnapshot | null }) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalWaves, setFinalWaves] = useState(1);
  const [finalKills, setFinalKills] = useState(0);
  const [finalSessionXP, setFinalSessionXP] = useState(0);
  const [finalSessionCrystals, setFinalSessionCrystals] = useState(0);
  const [finalMissCount, setFinalMissCount] = useState(0);
  const [finalPlayTime, setFinalPlayTime] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [currentWave, setCurrentWave] = useState(1);
  const [upgradeLevels, setUpgradeLevels] = useState({
    health: 0,
    radius: 0,
    turret: 0,
  });
  const [, setPrestigePointsEarned] = useState(0);
  const [showPrestige, setShowPrestige] = useState(false);
  const [newBiomes, setNewBiomes] = useState<string[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [finalBiomeId, setFinalBiomeId] = useState('neon_core');
  const [gameId, setGameId] = useState(0);
  const [, setShowBiomeSelect] = useState(false);
  const isLoggedIn = !!authManager.getUser();

  const handleResume = () => {
    const engine = engineRef.current;
    if (engine) {
      engine.isPaused = false;
      engine.resume();
    }
    setIsPaused(false);
  };

  const handleMainMenu = () => {
    setIsPaused(false);
    onMainMenu();
  };

  const engineRef = useRef<GameEngine | null>(null);

  const handleGameOver = useCallback((score: number, waves: number, kills: number, sessionXP: number, sessionCrystals: number, missCount: number, playTimeSeconds: number, biomeId: string) => {
    const ptsEarned = Math.floor(score / 100);
    const prestigeLevel = saveManager.getPrestigeLevel();
    Math.floor(100 * Math.pow(1.5, prestigeLevel));

    // Check for biome unlocks
    const highScore = saveManager.getHighScore();
    const highestWave = saveManager.getHighestWave();
    const unlocked = biomeManager.checkUnlocks(highestWave, highScore, prestigeLevel);
    if (unlocked.length > 0) {
      setNewBiomes(unlocked);
    }

    setFinalScore(score);
    setFinalWaves(waves);
    setFinalKills(kills);
    setFinalSessionXP(sessionXP);
    setFinalSessionCrystals(sessionCrystals);
    setFinalMissCount(missCount);
    setFinalPlayTime(playTimeSeconds);
    setFinalBiomeId(biomeId);
    setPrestigePointsEarned(ptsEarned);

    // Offer prestige if player earned enough points and hasn't hit the threshold
    if (ptsEarned >= PRESTIGE_THRESHOLD) {
      setShowPrestige(true);
    } else {
      setShowPrestige(false);
    }

    setIsGameOver(true);
    cloudSaveManager.deleteSave();
  }, []);

  const handlePrestigeComplete = useCallback(() => {
    setShowPrestige(false);
    setIsGameOver(false);
    setIsUpgrading(false);
    setFinalScore(0);
    setCurrentWave(1);
    setUpgradeLevels({ health: 0, radius: 0, turret: 0 });
    setGameId(id => id + 1);
    onMainMenu();
  }, [onMainMenu]);

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
    // eslint-disable-next-line react-hooks/immutability
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
      // eslint-disable-next-line react-hooks/immutability
      engine.isPaused = !engine.isPaused;
      setIsPaused(engine.isPaused);
    }
  }, [isGameOver, isUpgrading]);

  const handleSaveAndQuit = useCallback(() => {
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
    setShowPrestige(false);
    setIsGameOver(false);
    setIsUpgrading(false);
    setFinalScore(0);
    setCurrentWave(1);
    setUpgradeLevels({ health: 0, radius: 0, turret: 0 });
    setFinalBiomeId('neon_core');
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

      {isPaused && !isUpgrading && !isGameOver && (
        <PauseMenu
          onResume={handleResume}
          onMainMenu={handleMainMenu}
          onSaveQuit={isLoggedIn ? handleSaveAndQuit : undefined}
          onBiomeSelect={() => setShowBiomeSelect(true)}
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

      {showPrestige && (
        <PrestigeScreen
          score={finalScore}
          onPrestigeComplete={handlePrestigeComplete}
          onCancel={() => setShowPrestige(false)}
        />
      )}

      {isGameOver && !showPrestige && (
        <GameOver
          score={finalScore}
          waves={finalWaves}
          kills={finalKills}
          missCount={finalMissCount}
          playTimeSeconds={finalPlayTime}
          sessionXP={finalSessionXP}
          sessionCrystals={finalSessionCrystals}
          biomeId={finalBiomeId}
          onRetry={handleRetry}
          onMainMenu={onMainMenu}
          newBiomes={newBiomes}
        />
      )}
    </div>
  );
}
