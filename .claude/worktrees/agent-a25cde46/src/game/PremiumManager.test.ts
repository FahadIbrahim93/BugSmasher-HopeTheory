import { beforeEach, describe, expect, it } from 'vitest';
import { PremiumManager } from './PremiumManager';

describe('PremiumManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts as non-premium and shows ads', () => {
    const manager = new PremiumManager();

    expect(manager.isPremium()).toBe(false);
    expect(manager.shouldShowAds()).toBe(true);
    expect(manager.getBonusMultiplier()).toBe(1);
  });

  it('unlocks all local demo premium perks after purchase', () => {
    const manager = new PremiumManager();

    manager.purchase();

    expect(manager.isPremium()).toBe(true);
    expect(manager.shouldShowAds()).toBe(false);
    expect(manager.getBonusMultiplier()).toBe(2);
    expect(manager.getStartingLives()).toBe(2);
    expect(manager.getPerks().every((perk) => perk.unlocked)).toBe(true);
  });

  it('persists premium purchase state', () => {
    const manager = new PremiumManager();
    manager.purchase();

    const reloaded = new PremiumManager();

    expect(reloaded.isPremium()).toBe(true);
    expect(reloaded.getPurchaseDate()).toEqual(expect.any(String));
  });

  it('recovers from corrupt premium storage', () => {
    localStorage.setItem('bugsmasher_premium', '{broken');

    const manager = new PremiumManager();

    expect(manager.isPremium()).toBe(false);
    expect(manager.getPurchaseDate()).toBeNull();
    expect(manager.hasPerk('no_ads')).toBe(false);
  });
});
