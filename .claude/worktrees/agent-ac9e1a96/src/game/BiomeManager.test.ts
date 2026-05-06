import { describe, expect, it } from 'vitest';
import { BiomeManager } from './BiomeManager';

describe('BiomeManager', () => {
  it('starts with only the default biome unlocked', () => {
    const manager = new BiomeManager();

    expect(manager.getCurrentBiome().id).toBe('neon_core');
    expect(manager.isUnlocked('neon_core')).toBe(true);
    expect(manager.setCurrentBiome('quantum_void')).toBe(false);
  });

  it('unlocks biomes when requirements are met', () => {
    const manager = new BiomeManager();

    const unlocked = manager.checkUnlocks(999, 999999, 999);

    expect(unlocked.length).toBeGreaterThan(0);
    expect(manager.getUnlockedCount()).toBe(manager.getAllBiomes().length);
  });
});
