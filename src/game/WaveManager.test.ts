import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameEngine } from './GameEngine';
import { GameConfig } from './GameConfig';

// Mock the sound manager to prevent AudioContext errors in jsdom
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
  }
}));

describe('WaveManager (via GameEngine)', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      scale: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
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
    }) as unknown as CanvasRenderingContext2D);

    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    engine = new GameEngine(canvas);
  });

  afterEach(() => {
    engine.destroy();
    vi.restoreAllMocks();
  });

  it('should initialize with correct default values', () => {
    expect(engine.waveManager.bugsToSpawn).toBe(0);
    expect(engine.waveManager.spawnTimer).toBe(0);
    expect(engine.waveManager.waveActive).toBe(false);
  });

  it('should start wave correctly', () => {
    engine.wave = 1;
    engine.waveManager.startWave();
    
    expect(engine.waveManager.waveActive).toBe(true);
    expect(engine.waveManager.bugsToSpawn).toBe(GameConfig.waves.baseBugs + 1 * GameConfig.waves.bugsPerWave);
  });

  it('should not update when wave is not active', () => {
    engine.waveManager.update(0.016);
    expect(engine.waveManager.bugsToSpawn).toBe(0);
    expect(engine.bugs.length).toBe(0);
  });

  it('should complete wave and call onWaveComplete callback', () => {
    const onWaveComplete = vi.fn();
    engine.onWaveComplete = onWaveComplete;
    engine.isRunning = true;
    engine.wave = 1;
    engine.waveManager.startWave();

    // Clear remaining bugs and bugsToSpawn to trigger wave completion
    engine.waveManager.bugsToSpawn = 0;
    engine.bugs = [];
    engine.waveManager.update(0.016);

    expect(onWaveComplete).toHaveBeenCalledWith(1);
    expect(engine.wave).toBe(2);
    expect(engine.isRunning).toBe(false); // stop() should have been called
  });

  it('should increment wave counter on completion', () => {
    engine.isRunning = true;
    engine.wave = 1;
    engine.waveManager.startWave();

    engine.waveManager.bugsToSpawn = 0;
    engine.bugs = [];
    engine.waveManager.update(0.016);

    expect(engine.wave).toBe(2);
  });

  it('should spawn bugs at correct rate', () => {
    engine.wave = 1;
    engine.waveManager.startWave();
    
    // Manually trigger spawn by setting timer past threshold
    const initialBugs = engine.waveManager.bugsToSpawn;
    
    // Fast-forward time to trigger spawn
    for (let i = 0; i < 100; i++) {
      engine.waveManager.update(0.1);
    }
    
    expect(engine.bugs.length).toBeGreaterThan(0);
    expect(engine.waveManager.bugsToSpawn).toBeLessThan(initialBugs);
  });
});