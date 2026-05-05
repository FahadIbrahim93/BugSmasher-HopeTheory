import { describe, it, expect, beforeEach } from 'vitest';
import { upgradeSystem } from './UpgradeSystem';

describe('UpgradeSystem', () => {
  beforeEach(() => {
    // Reset the module-level singleton before each test
    sys.reset();
  });

  const sys = upgradeSystem;

  it('loads defaults on first run', () => {
    expect(sys.getLevel('click_power')).toBe(0);
    expect(sys.getLevel('crit_chance')).toBe(0);
    expect(sys.getCrystals()).toBe(0);
  });

  it('adds and spends crystals correctly', () => {
    sys.addCrystals(500);
    expect(sys.getCrystals()).toBe(500);

    expect(sys.spendCrystals(200)).toBe(true);
    expect(sys.getCrystals()).toBe(300);

    expect(sys.spendCrystals(300)).toBe(true);
    expect(sys.getCrystals()).toBe(0);

    expect(sys.spendCrystals(1)).toBe(false);
  });

  it('purchases upgrades and persists', () => {
    sys.addCrystals(1000);
    sys.setCrystals(1000);

    const before = sys.getLevel('click_power');
    const result = sys.purchaseUpgrade('click_power');
    expect(result).toBe(true);
    expect(sys.getLevel('click_power')).toBe(before + 1);
  });

  it('does not purchase if cannot afford', () => {
    sys.setCrystals(0);
    const result = sys.purchaseUpgrade('click_power');
    expect(result).toBe(false);
    expect(sys.getLevel('click_power')).toBe(0);
  });

  it('does not exceed max level', () => {
    // Give enough crystals to max out
    sys.setCrystals(100000);
    for (let i = 0; i < 30; i++) {
      sys.purchaseUpgrade('starting_shield');
    }
    expect(sys.isMaxed('starting_shield')).toBe(true);
    expect(sys.getLevel('starting_shield')).toBe(3); // max is 3
  });

  it('calculates cost correctly (exponential scaling)', () => {
        // level 0 → baseCost
    expect(sys.getUpgradeCost('click_power')).toBe(50);
    // After 1 purchase (level 1), cost = baseCost * mult^1
    sys.setCrystals(100000);
    sys.purchaseUpgrade('click_power');
    expect(sys.getUpgradeCost('click_power')).toBe(Math.floor(50 * 1.8)); // 90
  });

  it('computes crit chance capped at 75%', () => {
    // Crit chance: 5% per level, max 15 levels = 75% cap
    // Cost grows exponentially: 100*2^0 + 100*2^1 + ... + 100*2^14 = 3,276,700
    sys.reset();
    sys.setCrystals(5000000);
    for (let i = 0; i < 20; i++) {
      if (!sys.isMaxed('crit_chance')) sys.purchaseUpgrade('crit_chance');
    }
    expect(sys.getCritChance()).toBe(75); // 15 levels × 5% = 75%, capped
  });

  it('computes crystal multiplier from upgrade', () => {
    sys.setCrystals(100000);
    sys.purchaseUpgrade('crystal_finder'); // +10% per level
    expect(sys.getCrystalMultiplier()).toBe(1.10);
    sys.purchaseUpgrade('crystal_finder');
    expect(sys.getCrystalMultiplier()).toBe(1.20);
  });

  it('computes XP boost from upgrade', () => {
    sys.setCrystals(100000);
    sys.purchaseUpgrade('xp_boost'); // +15% per level
    expect(sys.getXPBoost()).toBe(1.15);
  });

  it('getAllUpgrades returns all 8 upgrades', () => {
    const all = sys.getAllUpgrades();
    expect(all.length).toBe(8);
    const ids = all.map(u => u.def.id);
    expect(ids).toContain('click_power');
    expect(ids).toContain('crit_chance');
    expect(ids).toContain('crystal_finder');
    expect(ids).toContain('starting_shield');
    expect(ids).toContain('extra_life');
    expect(ids).toContain('xp_boost');
    expect(ids).toContain('combo_master');
    expect(ids).toContain('turret_power');
  });

  it('getClickDamage accounts for prestige multiplier', () => {
    // Base: 10 + 0 upgrade bonus = 10
    expect(sys.getClickDamage(1)).toBe(10);
    // With 2 levels of click power: 10 + 2*1 = 12, × 1.1 prestige
    sys.setCrystals(100000);
    sys.purchaseUpgrade('click_power');
    sys.purchaseUpgrade('click_power');
    expect(sys.getClickDamage(1)).toBe(12); // no prestige
    expect(sys.getClickDamage(1.1)).toBeCloseTo(13.2); // 10+2=12 × 1.1
  });

  it('shield duration is 0 when not purchased', () => {
    expect(sys.getShieldDuration()).toBe(0);
  });

  it('shield duration increases per level', () => {
    sys.setCrystals(100000);
    sys.purchaseUpgrade('starting_shield'); // +2s per level, starts at 5s
    expect(sys.getShieldDuration()).toBe(7);
    sys.purchaseUpgrade('starting_shield');
    expect(sys.getShieldDuration()).toBe(9);
  });

  it('getExtraLives returns correct count', () => {
    expect(sys.getExtraLives()).toBe(0);
    sys.setCrystals(100000);
    sys.purchaseUpgrade('extra_life');
    expect(sys.getExtraLives()).toBe(1);
    sys.purchaseUpgrade('extra_life');
    expect(sys.getExtraLives()).toBe(2);
  });

  it('totalBonus is level × effectPerLevel', () => {
    sys.setCrystals(100000);
    sys.purchaseUpgrade('click_power');
    sys.purchaseUpgrade('click_power');
    expect(sys.getTotalBonus('click_power')).toBe(2); // 2 levels × 1 dmg
  });
});
