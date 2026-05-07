import { achievementSystem } from './AchievementSystem';
import { authManager } from './database/AuthManager';
import { GameConfig } from './GameConfig';
import { getBossForWave, Boss, BossConfig } from './BossConfig';
import { upgradeSystem } from './UpgradeSystem';
import type { GameEngine } from './GameEngine';

export class BossManager {
  engine: GameEngine;
  currentBoss: Boss | null = null;
  lastDefeatedBossId: string | null = null;
  lastDefeatedBossTimeSeconds: number | null = null;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  shouldSpawnBoss(wave: number, biomeId: string, prestigeLevel: number): boolean {
    return getBossForWave(wave, biomeId, prestigeLevel) !== null;
  }

  startBossForWave(wave: number, biomeId: string, prestigeLevel: number): Boss | null {
    const config = getBossForWave(wave, biomeId, prestigeLevel);
    if (!config) return null;
    return this.startBoss(config, wave);
  }

  startBoss(config: BossConfig, wave: number): Boss {
    const maxHp = config.baseHp + wave * config.hpPerWave;
    const boss: Boss = {
      id: `${config.id}_${wave}_${Date.now()}`,
      config,
      hp: maxHp,
      maxHp,
      phaseIndex: 0,
      x: this.engine.width / 2,
      y: Math.max(120, this.engine.height * 0.28),
      size: 54,
      attackTimer: 4,
      addSpawnTimer: config.phases[0].addSpawnInterval,
      state: 'active',
      weakPoint: {
        x: this.engine.width / 2,
        y: Math.max(120, this.engine.height * 0.28) + 8,
        radius: 24,
        active: true,
        pulse: 0,
      },
      elapsed: 0,
    };

    this.currentBoss = boss;
    this.lastDefeatedBossId = null;
    this.lastDefeatedBossTimeSeconds = null;
    this.engine.bugs = [];
    this.engine.particleSystem.spawnShockwave(boss.x, boss.y, config.color, 420);
    this.engine.shake(0.45, 14);
    return boss;
  }

  update(dt: number): void {
    const boss = this.currentBoss;
    if (!boss || boss.state !== 'active') return;

    boss.elapsed += dt;
    boss.weakPoint.pulse += dt;
    this.updatePhase(boss);

    const phase = boss.config.phases[boss.phaseIndex];
    boss.attackTimer -= dt;
    boss.addSpawnTimer -= dt;

    if (boss.attackTimer <= 0) {
      boss.attackTimer = Math.max(2.2, 4.2 - boss.phaseIndex * 0.65);
      if (this.engine.shieldTimer <= 0) {
        this.engine.health -= phase.corePressureDamage;
        this.engine.particleSystem.spawnDamageNumber(
          this.engine.width / 2,
          this.engine.height / 2 - 52,
          phase.corePressureDamage,
          '#ff4444',
        );
      }
      this.engine.particleSystem.spawnShockwave(
        this.engine.width / 2,
        this.engine.height / 2,
        boss.config.accentColor,
        260,
      );
      this.engine.shake(0.25, 10);
    }

    if (boss.addSpawnTimer <= 0) {
      boss.addSpawnTimer = phase.addSpawnInterval;
      const addCount = 1 + boss.phaseIndex;
      for (let i = 0; i < addCount; i++) {
        this.spawnAntAdd(i, addCount);
      }
    }
  }

  damageBossAt(x: number, y: number, amount: number, isCrit = false): boolean {
    const boss = this.currentBoss;
    if (!boss || boss.state !== 'active') return false;

    const bodyDist = Math.sqrt((boss.x - x) ** 2 + (boss.y - y) ** 2);
    const weakDist = Math.sqrt((boss.weakPoint.x - x) ** 2 + (boss.weakPoint.y - y) ** 2);
    const hitBody = bodyDist <= boss.size * 1.2;
    const hitWeakPoint = boss.weakPoint.active && weakDist <= boss.weakPoint.radius;
    if (!hitBody && !hitWeakPoint) return false;

    const phase = boss.config.phases[boss.phaseIndex];
    const critMultiplier = isCrit ? 1.35 : 1;
    const damage = amount * (hitWeakPoint ? phase.weakPointMultiplier : 0.65) * critMultiplier;
    boss.hp = Math.max(0, boss.hp - damage);

    this.engine.particleSystem.spawnDamageNumber(
      x,
      y - 18,
      Math.ceil(damage),
      hitWeakPoint ? boss.config.accentColor : boss.config.color,
    );
    this.engine.particleSystem.spawnShockwave(
      x,
      y,
      hitWeakPoint ? boss.config.accentColor : boss.config.color,
      hitWeakPoint ? 150 : 80,
    );
    this.engine.shake(hitWeakPoint ? 0.18 : 0.08, hitWeakPoint ? 8 : 4);

    if (boss.hp <= 0) {
      this.defeatBoss(boss);
    }

    return true;
  }

  reset(): void {
    this.currentBoss = null;
    this.lastDefeatedBossId = null;
    this.lastDefeatedBossTimeSeconds = null;
  }

  private updatePhase(boss: Boss): void {
    const hpRatio = boss.hp / boss.maxHp;
    let nextPhase = boss.phaseIndex;
    for (let i = 0; i < boss.config.phases.length; i++) {
      if (hpRatio <= boss.config.phases[i].hpThreshold) {
        nextPhase = i;
      }
    }

    if (nextPhase > boss.phaseIndex) {
      boss.phaseIndex = nextPhase;
      boss.addSpawnTimer = Math.min(
        boss.addSpawnTimer,
        boss.config.phases[nextPhase].addSpawnInterval,
      );
      this.engine.particleSystem.spawnShockwave(boss.x, boss.y, boss.config.accentColor, 520);
      this.engine.shake(0.55, 18);
    }
  }

  private spawnAntAdd(index: number, total: number): void {
    const angle = -Math.PI / 2 + (index - (total - 1) / 2) * 0.35;
    const edgeY = -40;
    const x = this.engine.width / 2 + Math.sin(angle) * 160;
    this.engine.bugs.push({
      active: true,
      x,
      y: edgeY,
      type: 'boss_ant',
      speed: GameConfig.bugs.basic.baseSpeed * (1.15 + this.engine.wave * 0.02),
      color: '#00ffcc',
      size: GameConfig.bugs.basic.size * 0.9,
      scoreValue: 15 + this.engine.wave,
      hp: 1 + Math.floor(this.engine.wave / 8),
      maxHp: 1 + Math.floor(this.engine.wave / 8),
      walkCycle: Math.random() * Math.PI * 2,
      rotation: 0,
      offsetTime: Math.random() * 100,
    });
  }

  private defeatBoss(boss: Boss): void {
    boss.state = 'defeated';
    this.currentBoss = null;
    this.lastDefeatedBossId = boss.config.id;
    this.lastDefeatedBossTimeSeconds = Math.ceil(boss.elapsed);

    const mult = this.engine.multiplierTimer > 0 ? 2 : 1;
    const pointsEarned = boss.config.scoreValue * mult;
    this.engine.score += pointsEarned;
    if (this.engine.score > this.engine.highScore) {
      this.engine.highScore = this.engine.score;
      this.engine.saveManager.updateHighScore(this.engine.highScore);
    }
    this.engine.saveManager.recordBossDefeat(
      boss.config.id,
      boss.config.reward.materialId,
      boss.config.reward.materialAmount,
    );
    this.engine.awardXP(boss.config.reward.xp, 'boss_defeat');

    const crystals = Math.floor(boss.config.reward.crystals * upgradeSystem.getCrystalMultiplier());
    authManager.addCrystals(crystals);
    upgradeSystem.addCrystals(crystals);
    this.engine.saveManager.addCrystalsEarned(crystals);
    this.engine.sessionCrystals += crystals;

    achievementSystem.onBossDefeated(boss.config.id);
    this.engine.particleSystem.spawnDamageNumber(
      boss.x,
      boss.y - 70,
      pointsEarned,
      boss.config.accentColor,
    );
    this.engine.particleSystem.spawnShockwave(boss.x, boss.y, boss.config.color, 720);
    this.engine.particleSystem.spawnSplatter(boss.x, boss.y, boss.config.color);
    this.engine.shake(0.8, 26);
    this.engine.waveManager.completeWave();
  }
}
