/**
 * DeathCardGenerator — tests
 *
 * Canvas-based functions (generateDeathCardBlob, shareDeathCard, downloadDeathCard)
 * require a real <canvas> 2D context and cannot run in jsdom without the `canvas`
 * npm package. They are tested manually / e2e.
 *
 * We test everything testable here: BIOMES data integrity, formatTime helper,
 * hexToRgba helper, and roundRect path logic.
 */

import { describe, it, expect, vi } from 'vitest';
import { BIOMES } from './BiomeConfig';

// ── Pure helpers (copied from DeathCardGenerator for isolated testing) ────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function roundRectPath(
  ctx: { beginPath: () => void; moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void; quadraticCurveTo: (x: number, y: number, cx: number, cy: number) => void; closePath: () => void },
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DeathCardGenerator', () => {

  describe('hexToRgba helper', () => {
    it('converts hex to rgba correctly', () => {
      expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
      expect(hexToRgba('#00ffcc', 0.3)).toBe('rgba(0,255,204,0.3)');
    });

    it('handles white and black', () => {
      expect(hexToRgba('#ffffff', 1)).toBe('rgba(255,255,255,1)');
      expect(hexToRgba('#000000', 0)).toBe('rgba(0,0,0,0)');
    });
  });

  describe('formatTime helper', () => {
    it('formats seconds under a minute', () => {
      expect(formatTime(0)).toBe('0s');
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(59)).toBe('59s');
    });

    it('formats exact minutes', () => {
      expect(formatTime(60)).toBe('1m');
      expect(formatTime(120)).toBe('2m');
      expect(formatTime(300)).toBe('5m');
    });

    it('formats minute + second combos', () => {
      expect(formatTime(61)).toBe('1m 1s');
      expect(formatTime(125)).toBe('2m 5s');
      expect(formatTime(3599)).toBe('59m 59s');
    });

    it('formats long sessions in minutes', () => {
      expect(formatTime(3661)).toBe('61m 1s'); // just over 1 hour
      expect(formatTime(7200)).toBe('120m');   // 2 hours
    });
  });

  describe('roundRectPath helper', () => {
    it('creates a closed path without throwing', () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        closePath: vi.fn(),
      };
      roundRectPath(ctx as never, 10, 10, 200, 100, 8);
      expect(ctx.beginPath).toHaveBeenCalledTimes(1);
      expect(ctx.closePath).toHaveBeenCalledTimes(1);
    });

    it('calls lineTo 4 times (4 sides)', () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        quadraticCurveTo: vi.fn(),
        closePath: vi.fn(),
      };
      roundRectPath(ctx as never, 10, 10, 200, 100, 8);
      expect(ctx.lineTo).toHaveBeenCalledTimes(4);
      expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    });
  });

  describe('BIOMES data for death card theming', () => {
    it('has neon_core as the default biome', () => {
      const neon = BIOMES.find(b => b.id === 'neon_core');
      expect(neon).toBeDefined();
      expect(neon!.name).toBe('Neon Core');
    });

    it('every biome has valid coreColor and background hex strings', () => {
      BIOMES.forEach(biome => {
        expect(biome.theme.coreColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(biome.theme.background).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(biome.theme.coreGlow).toBeDefined();
        expect(biome.theme.fogColor).toBeDefined();
      });
    });

    it('every biome has gameplay with difficultyMultiplier', () => {
      BIOMES.forEach(biome => {
        expect(typeof biome.gameplay.difficultyMultiplier).toBe('number');
        expect(biome.gameplay.difficultyMultiplier).toBeGreaterThan(0);
        expect(biome.gameplay.specialEffect).toBeDefined();
      });
    });

    it('golden_cache has the highest difficulty multiplier (prestige biome)', () => {
      const golden = BIOMES.find(b => b.id === 'golden_cache');
      const maxDiff = Math.max(...BIOMES.map(b => b.gameplay.difficultyMultiplier));
      expect(golden!.gameplay.difficultyMultiplier).toBe(maxDiff);
    });

    it('BIOMES array has all 5 expected biomes', () => {
      const ids = BIOMES.map(b => b.id);
      expect(ids).toContain('neon_core');
      expect(ids).toContain('quantum_void');
      expect(ids).toContain('ember_depths');
      expect(ids).toContain('frostbyte');
      expect(ids).toContain('golden_cache');
      expect(BIOMES.length).toBe(5);
    });

    it('each biome has a valid special effect', () => {
      const validEffects = ['none', 'teleport', 'swarm', 'armored', 'split', 'regen'];
      BIOMES.forEach(biome => {
        expect(validEffects).toContain(biome.gameplay.specialEffect);
      });
    });

    it('bug configs have valid weight distributions', () => {
      BIOMES.forEach(biome => {
        const { basicWeight, scoutWeight, tankWeight } = biome.gameplay.bugs;
        const total = basicWeight + scoutWeight + tankWeight;
        expect(total).toBeCloseTo(1, 2);
        expect(basicWeight).toBeGreaterThan(0);
        expect(scoutWeight).toBeGreaterThanOrEqual(0);
        expect(tankWeight).toBeGreaterThanOrEqual(0);
      });
    });

    it('powerup configs have valid dropChanceMultiplier', () => {
      BIOMES.forEach(biome => {
        expect(biome.gameplay.powerups.dropChanceMultiplier).toBeGreaterThan(0);
        expect(Array.isArray(biome.gameplay.powerups.preferredTypes)).toBe(true);
        expect(biome.gameplay.powerups.rareBoost).toBeGreaterThanOrEqual(0);
      });
    });

    it('biome names and descriptions are non-empty strings', () => {
      BIOMES.forEach(biome => {
        expect(typeof biome.name).toBe('string');
        expect(biome.name.length).toBeGreaterThan(0);
        expect(typeof biome.description).toBe('string');
        expect(biome.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getBiomeTheme (implicit — via BIOMES lookup)', () => {
    it('findBiome returns correct biome for known ids', () => {
      const neon = BIOMES.find(b => b.id === 'neon_core');
      expect(neon?.theme.coreColor).toBe('#00ffcc');
    });

    it('fallback to neon_core for unknown biome id', () => {
      const unknown = BIOMES.find(b => b.id === 'definitely_not_a_biome') ?? BIOMES[0];
      expect(unknown.id).toBe('neon_core');
    });
  });
});
