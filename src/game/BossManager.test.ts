import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GameEngine } from './GameEngine';
import { GameConfig } from './GameConfig';

vi.mock('./SoundManager', () => ({
  soundManager: {
    init: vi.fn(),
    shoot: vi.fn(),
    splat: vi.fn(),
    hitBase: vi.fn(),
    powerup: vi.fn(),
    nuke: vi.fn(),
    upgrade: vi.fn(),
    uiClick: vi.fn(),
    uiHover: vi.fn(),
    uiError: vi.fn(),
    scoreTick: vi.fn(),
  },
}));

describe('BossManager', () => {
  let engine: GameEngine;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () =>
        ({
          scale: vi.fn(),
          setTransform: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          ellipse: vi.fn(),
          fillText: vi.fn(),
          createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
          setLineDash: vi.fn(),
          quadraticCurveTo: vi.fn(),
          globalCompositeOperation: 'source-over',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
          shadowColor: '',
          shadowBlur: 0,
        }) as unknown as CanvasRenderingContext2D,
    );

    localStorage.clear();
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    Object.defineProperty(canvas, 'parentElement', {
      value: { clientWidth: 800, clientHeight: 600 },
      configurable: true,
    });
    engine = new GameEngine(canvas);
    engine.isRunning = true;
  });

  it('spawns Motherboard Myrmex as the wave 5 Neon Core boss instead of normal bugs', () => {
    engine.wave = 5;
    engine.startWave();

    expect(engine.boss?.config.id).toBe('motherboard_myrmex');
    expect(engine.waveManager.bugsToSpawn).toBe(0);
    expect(engine.waveManager.waveActive).toBe(true);
  });

  it('transitions phases, spawns adds, and applies telegraphed core pressure', () => {
    engine.wave = 5;
    engine.startWave();
    const boss = engine.boss!;

    engine.bossManager.damageBossAt(boss.weakPoint.x, boss.weakPoint.y, boss.maxHp * 0.4);
    engine.bossManager.update(4.5);

    expect(boss.phaseIndex).toBeGreaterThan(0);
    expect(engine.bugs.some((bug) => bug.type === 'boss_ant')).toBe(true);
    expect(engine.health).toBeLessThan(GameConfig.player.maxHealth);
  });

  it('defeats the boss, grants persistent rewards, and completes the wave', () => {
    const onWaveComplete = vi.fn();
    engine.onWaveComplete = onWaveComplete;
    engine.wave = 5;
    engine.startWave();
    const boss = engine.boss!;

    engine.bossManager.damageBossAt(boss.weakPoint.x, boss.weakPoint.y, boss.maxHp);

    expect(engine.boss).toBeNull();
    expect(engine.score).toBeGreaterThanOrEqual(boss.config.scoreValue);
    expect(engine.saveManager.getBossDefeats().motherboard_myrmex).toBe(1);
    expect(engine.saveManager.getBossMaterials().queen_chitin).toBe(1);
    expect(onWaveComplete).toHaveBeenCalledWith(5);
    expect(engine.wave).toBe(6);
  });
});
