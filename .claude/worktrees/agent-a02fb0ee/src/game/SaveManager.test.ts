import { beforeEach, describe, expect, it } from 'vitest';
import { SaveManager } from './SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with safe defaults when no save exists', () => {
    const manager = new SaveManager();

    expect(manager.getHighScore()).toBe(0);
    expect(manager.getGamesPlayed()).toBe(0);
    expect(manager.isSoundEnabled()).toBe(true);
    expect(manager.getUnlockedBiomes()).toEqual(['neon_core']);
  });

  it('recovers from corrupt save data without throwing', () => {
    localStorage.setItem('bugsmasher_save', '{not-json');

    const manager = new SaveManager();

    expect(manager.getHighScore()).toBe(0);
    expect(manager.getUnlockedBiomes()).toEqual(['neon_core']);
  });

  it('persists high score only when the new score is higher', () => {
    const manager = new SaveManager();

    expect(manager.updateHighScore(500)).toBe(true);
    expect(manager.updateHighScore(100)).toBe(false);

    const reloaded = new SaveManager();
    expect(reloaded.getHighScore()).toBe(500);
  });

  it('does not duplicate unlocked biomes', () => {
    const manager = new SaveManager();

    manager.unlockBiome('frostbyte');
    manager.unlockBiome('frostbyte');

    expect(manager.getUnlockedBiomes().filter((id) => id === 'frostbyte')).toHaveLength(1);
  });

  it('resets all local progress to defaults', () => {
    const manager = new SaveManager();
    manager.updateHighScore(9000);
    manager.addBugsSmashed(12);

    manager.resetData();

    expect(manager.getHighScore()).toBe(0);
    expect(manager.getTotalBugsSmashed()).toBe(0);
  });

  it('tracks prestige, settings, and highest wave state', () => {
    const manager = new SaveManager();

    manager.setSoundEnabled(false);
    manager.setMusicEnabled(false);
    manager.recordGamePlayed();
    manager.setHighestWave(8);
    manager.setHighestWave(3);
    manager.addPrestigePoints(25);
    manager.prestige(2);

    expect(manager.isSoundEnabled()).toBe(false);
    expect(manager.isMusicEnabled()).toBe(false);
    expect(manager.getGamesPlayed()).toBe(1);
    expect(manager.getHighestWave()).toBe(8);
    expect(manager.getPrestigeLevel()).toBe(2);
    expect(manager.getPrestigeMultiplier()).toBeCloseTo(1.2);
    expect(manager.getPrestigePoints()).toBeGreaterThan(25);
  });

  it('handles daily challenge completion and formatted stats', () => {
    const manager = new SaveManager();

    expect(manager.hasCompletedDailyChallenge()).toBe(false);
    manager.completeDailyChallenge();

    expect(manager.hasCompletedDailyChallenge()).toBe(true);
    expect(manager.getDailyChallengesCompleted()).toBe(1);
    expect(manager.getDailyChallengeBonus()).toBeGreaterThanOrEqual(1);
    expect(manager.getFormattedStats()).toContain('High Score:');
  });
});
