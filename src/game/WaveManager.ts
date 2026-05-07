import { GameConfig } from './GameConfig';
import { GameEngine } from './GameEngine';
import { biomeManager } from './BiomeManager';
import { getBiomeBugStats } from './BiomeConfig';

export class WaveManager {
  engine: GameEngine;
  bugsToSpawn: number = 0;
  spawnTimer: number = 0;
  waveActive: boolean = false;
  private specialCooldowns: Record<string, number> = {};

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  startWave() {
    this.waveActive = true;
    this.bugsToSpawn = GameConfig.waves.baseBugs + this.engine.wave * GameConfig.waves.bugsPerWave;
    this.spawnTimer = 0;
    // Reset special cooldowns on new wave
    this.specialCooldowns = {};
  }

  update(dt: number) {
    if (!this.waveActive) return;

    // Update special effect cooldowns
    this.updateSpecialEffects(dt);

    if (this.bugsToSpawn > 0) {
      this.spawnTimer += dt;
      const baseSpawnRate = Math.max(
        GameConfig.waves.minSpawnRate,
        GameConfig.waves.baseSpawnRate - this.engine.wave * GameConfig.waves.spawnRateReduction
      );
      // Harder biomes spawn faster
      const difficultyMult = biomeManager.getDifficulty(this.engine.currentBiome?.id);
      const spawnRate = baseSpawnRate / Math.sqrt(difficultyMult);

      if (this.spawnTimer > spawnRate) {
        this.spawnTimer = 0;
        this.spawnBug();
      }
    } else if (this.engine.bugs.length === 0) {
      this.waveActive = false;
      const completedWave = this.engine.wave;
      this.engine.saveManager.setHighestWave(completedWave);

      const newlyUnlocked = biomeManager.checkUnlocks(
        completedWave,
        this.engine.saveManager.getHighScore(),
        this.engine.saveManager.getPrestigeLevel()
      );

      for (const biomeId of newlyUnlocked) {
        this.engine.saveManager.unlockBiome(biomeId);
      }

      this.engine.wave++;

      // Award XP for completing wave (scaled by biome difficulty)
      const difficultyMult = biomeManager.getDifficulty(this.engine.currentBiome?.id);
      const waveXP = Math.floor(completedWave * 10 * difficultyMult);
      this.engine.awardXP(waveXP, 'wave_complete');

      this.engine.onWaveComplete?.(completedWave);
      this.engine.stop();
    }
  }

  private updateSpecialEffects(dt: number) {
    const biome = biomeManager.getCurrentBiome();
    const effect = biome.gameplay.specialEffect;

    if (effect === 'regen') {
      // All bugs regenerate 1 HP per second
      for (const bug of this.engine.bugs) {
        if (bug.active && bug.hp < bug.maxHp) {
          bug.hp = Math.min(bug.maxHp, bug.hp + dt);
        }
      }
    }

    // Healer bug effect - heals nearby bugs every 3 seconds
    this.specialCooldowns['healer'] = (this.specialCooldowns['healer'] ?? 0) - dt;
    if (this.specialCooldowns['healer'] <= 0) {
      this.specialCooldowns['healer'] = 3; // Heal every 3 seconds
      for (const healer of this.engine.bugs) {
        if (healer.active && healer.type === 'healer') {
          // Find nearby bugs within 80px
          for (const bug of this.engine.bugs) {
            if (bug.active && bug.type !== 'healer') {
              const dx = bug.x - healer.x;
              const dy = bug.y - healer.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 80 && bug.hp < bug.maxHp) {
                bug.hp = Math.min(bug.maxHp, bug.hp + 1);
                // Spawn heal particles
                this.engine.particleSystem.spawnShockwave(bug.x, bug.y, '#22c55e', 30);
              }
            }
          }
        }
      }
    }

    if (effect === 'teleport') {
      // Phase bugs randomly teleport
      this.specialCooldowns['teleport'] = (this.specialCooldowns['teleport'] ?? 0) - dt;
      if (this.specialCooldowns['teleport'] <= 0) {
        this.specialCooldowns['teleport'] = 2 + Math.random() * 2;
        for (const bug of this.engine.bugs) {
          if (bug.active && bug.type === 'phase') {
            // Teleport to random edge
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { bug.x = Math.random() * this.engine.width; bug.y = -30; }
            else if (edge === 1) { bug.x = this.engine.width + 30; bug.y = Math.random() * this.engine.height; }
            else if (edge === 2) { bug.x = Math.random() * this.engine.width; bug.y = this.engine.height + 30; }
            else { bug.x = -30; bug.y = Math.random() * this.engine.height; }
            // Spawn shimmer particles
            this.engine.particleSystem.spawnShockwave(bug.x, bug.y, '#a855f7', 80);
          }
        }
      }
    }
  }

  private spawnBug() {
    if (this.bugsToSpawn <= 0) return;
    this.bugsToSpawn--;

    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (edge === 0) { x = Math.random() * this.engine.width; y = -50; }
    else if (edge === 1) { x = this.engine.width + 50; y = Math.random() * this.engine.height; }
    else if (edge === 2) { x = Math.random() * this.engine.width; y = this.engine.height + 50; }
    else { x = -50; y = Math.random() * this.engine.height; }

    const wave = this.engine.wave;
    const biome = biomeManager.getCurrentBiome();
    const stats = getBiomeBugStats(biome, wave, GameConfig.bugs);

    // Determine bug type based on biome weights
    const g = biome.gameplay.bugs;
    const r = Math.random();

    // Base bug selection
    let type: string;
    let color: string;
    let size: number;
    let speed: number;
    let scoreValue: number;
    let hp: number;

    // Extra biome-specific bug types
    const extraRoll = Math.random();
    let extraWeight = 0.1; // 10% base for extra types

    // Adjust extra type spawn rate based on wave number
    if (this.engine.wave >= 10) {
      extraWeight = 0.15; // 15% from wave 10
    }
    if (this.engine.wave >= 20) {
      extraWeight = 0.20; // 20% from wave 20
    }

    if (biome.gameplay.bugs.extraTypes.length > 0 && extraRoll < extraWeight) {
      // Weighted extra type selection based on type
      const weightedTypes = [];
      for (const extraType of biome.gameplay.bugs.extraTypes) {
        if (extraType === 'swarmer' || extraType === 'healer') {
          // Swarmer and healer are rarer - 5-10% spawn rate
          const weight = extraType === 'swarmer' ? 0.7 : 0.3;
          if (this.engine.wave >= 10 && Math.random() < weight * 0.5) {
            weightedTypes.push(extraType);
          }
        } else {
          weightedTypes.push(extraType);
        }
      }
      if (weightedTypes.length > 0) {
        type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
      } else {
        type = biome.gameplay.bugs.extraTypes[Math.floor(Math.random() * biome.gameplay.bugs.extraTypes.length)];
      }
    } else if (this.engine.wave >= 20 && Math.random() < 0.15) {
      // Boss/Elite bug types from visual design system - 15% spawn rate from wave 20+
      const eliteTypes = ['armored_beetle', 'shadow_moth', 'crystal_stag', 'venom_widow', 'thunder_hornet'];
      type = eliteTypes[Math.floor(Math.random() * eliteTypes.length)];
    } else if (r < g.basicWeight) {
      type = 'basic';
    } else if (r < g.basicWeight + g.scoutWeight) {
      type = 'scout';
    } else {
      type = 'tank';
    }

    // Get biome-specific values
    switch (type) {
      case 'basic':
        color = biome.bugs.baseColor;
        size = GameConfig.bugs.basic.size;
        speed = stats.basic.speed;
        scoreValue = stats.basic.score;
        hp = stats.basic.hp;
        break;
      case 'scout':
        color = biome.bugs.scoutColor;
        size = GameConfig.bugs.scout.size;
        speed = stats.scout.speed;
        scoreValue = stats.scout.score;
        hp = stats.scout.hp;
        break;
      case 'tank':
        color = biome.bugs.tankColor;
        size = GameConfig.bugs.tank.size;
        speed = stats.tank.speed;
        scoreValue = stats.tank.score;
        hp = stats.tank.hp;
        // Armored: tanks in ember_depths take 1 extra hit minimum
        if (biome.gameplay.specialEffect === 'armored') {
          hp = Math.max(hp, Math.ceil(wave * 0.5) + 2);
        }
        break;
      case 'phase':
        color = biome.bugs.eliteColor ?? '#a855f7';
        size = GameConfig.bugs.scout.size * 1.1;
        speed = stats.scout.speed * 1.2;
        scoreValue = Math.ceil(stats.scout.score * 1.5);
        hp = Math.ceil(stats.scout.hp * 0.8);
        break;
      case 'ember':
        color = '#ef4444';
        size = GameConfig.bugs.basic.size * 0.9;
        speed = stats.basic.speed * 1.1;
        scoreValue = Math.ceil(stats.basic.score * 1.3);
        hp = Math.ceil(stats.basic.hp * 1.1);
        break;
      case 'frost':
        color = '#7dd3fc';
        size = GameConfig.bugs.scout.size * 0.95;
        speed = stats.scout.speed * 0.95;
        scoreValue = Math.ceil(stats.scout.score * 1.2);
        hp = Math.ceil(stats.scout.hp * 1.0);
        break;
      case 'golden':
        color = '#eab308';
        size = GameConfig.bugs.tank.size * 1.3;
        speed = stats.tank.speed * 0.7;
        scoreValue = Math.ceil(stats.tank.score * 3.0); // 3× gold multiplier
        hp = Math.ceil(stats.tank.hp * 2.0);
        break;
      case 'swarmer':
        color = '#8a2be2';
        size = GameConfig.bugs.swarmer.size;
        speed = stats.basic.speed * 1.2; // Very fast
        scoreValue = Math.ceil(stats.basic.score * 3); // 3× score value
        hp = 1; // Low HP
        break;
      case 'healer':
        color = '#22c55e';
        size = GameConfig.bugs.healer.size;
        speed = stats.basic.speed * 0.8; // Slow
        scoreValue = Math.ceil(stats.tank.score * 1.2); // 1.2× tank score
        hp = Math.ceil(stats.basic.hp * 2); // Medium HP
        break;
      // NEW: Elite boss types from visual design system
      case 'armored_beetle':
        color = '#ff4444';
        size = 55;
        speed = stats.tank.speed * 0.8; // Slow but tough
        scoreValue = Math.ceil(stats.tank.score * 5); // 5× score
        hp = Math.ceil(stats.tank.hp * 3); // Triple HP
        break;
      case 'shadow_moth':
        color = '#aa44ff';
        size = 50;
        speed = stats.scout.speed * 1.2; // Fast and evasive
        scoreValue = Math.ceil(stats.scout.score * 4);
        hp = Math.ceil(stats.scout.hp * 2);
        break;
      case 'crystal_stag':
        color = '#0ea5e9';
        size = 48;
        speed = stats.tank.speed * 0.9;
        scoreValue = Math.ceil(stats.tank.score * 4);
        hp = Math.ceil(stats.tank.hp * 2.5);
        break;
      case 'venom_widow':
        color = '#32cd32';
        size = 46;
        speed = stats.basic.speed * 0.7;
        scoreValue = Math.ceil(stats.basic.score * 3);
        hp = Math.ceil(stats.basic.hp * 2);
        break;
      case 'thunder_hornet':
        color = '#facc15';
        size = 44;
        speed = stats.scout.speed * 1.3; // Very fast
        scoreValue = Math.ceil(stats.scout.score * 3.5);
        hp = Math.ceil(stats.scout.hp * 1.5);
        break;
      default:
        color = biome.bugs.baseColor;
        size = GameConfig.bugs.basic.size;
        speed = stats.basic.speed;
        scoreValue = stats.basic.score;
        hp = stats.basic.hp;
    }

    this.engine.bugs.push({
      active: true,
      x, y,
      type,
      speed,
      color,
      size,
      scoreValue,
      hp,
      maxHp: hp,
      walkCycle: Math.random() * Math.PI * 2,
      rotation: 0,
      offsetTime: Math.random() * 100,
    });
  }

  /** Called when a golden bug dies — spawns 2 mini golden bugs */
  onBugDeath(bug: { type: string; x: number; y: number; color: string; size: number; scoreValue: number }) {
    const biome = biomeManager.getCurrentBiome();
    if (biome.gameplay.specialEffect === 'split' && bug.type === 'golden') {
      // Spawn 2 mini bugs
      for (let i = 0; i < 2; i++) {
        const angle = (Math.PI * 2 / 2) * i + Math.random() * 0.5;
        const dist = 30;
        this.engine.bugs.push({
          active: true,
          x: bug.x + Math.cos(angle) * dist,
          y: bug.y + Math.sin(angle) * dist,
          type: 'golden_mini',
          speed: GameConfig.bugs.basic.baseSpeed * 1.3,
          color: bug.color,
          size: bug.size * 0.5,
          scoreValue: Math.ceil(bug.scoreValue * 0.3),
          hp: 1,
          maxHp: 1,
          walkCycle: Math.random() * Math.PI * 2,
          rotation: 0,
          offsetTime: Math.random() * 100,
        });
      }
      this.engine.particleSystem.spawnShockwave(bug.x, bug.y, '#eab308', 120);
      this.engine.shake(0.3, 10);
    }

    // Swarmer death - spawns 2-3 mini-basic bugs
    if (bug.type === 'swarmer') {
      const miniCount = 2 + Math.floor(Math.random() * 2); // 2-3 mini bugs
      for (let i = 0; i < miniCount; i++) {
        const angle = (Math.PI * 2 / miniCount) * i + Math.random() * 0.5;
        const dist = 20;
        this.engine.bugs.push({
          active: true,
          x: bug.x + Math.cos(angle) * dist,
          y: bug.y + Math.sin(angle) * dist,
          type: 'mini_basic',
          speed: GameConfig.bugs.basic.baseSpeed * 1.1,
          color: '#a855f7',
          size: 8,
          scoreValue: 5,
          hp: 1,
          maxHp: 1,
          walkCycle: Math.random() * Math.PI * 2,
          rotation: 0,
          offsetTime: Math.random() * 100,
        });
      }
      this.engine.particleSystem.spawnShockwave(bug.x, bug.y, '#8a2be2', 100);
      this.engine.shake(0.2, 5);
    }
  }
}
