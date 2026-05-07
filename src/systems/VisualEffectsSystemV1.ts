// Visual Effects System - Shows stage 1 of bug visuals
import { ParticleSystem } from './ParticleSystem';
import { Bug, GameState } from '../types';

export class VisualEffectsSystemV1 {
  private particleSystem: ParticleSystem;
  private screenShake: number = 0;
  private screenShakeDuration: number = 0;

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  triggerBugHit(x: number, y: number, bugType: string, isCrit: boolean = false) {
    const size = isCrit ? 30 : 15;

    // Color-coded bug hit effects per visual design
    const hitColors: Record<string, string> = {
      beetle: '#ff4444',      // Armored Beetle - red
      stag: '#44aaff',         // Crystal Stag - blue
      moth: '#aa44ff',         // Shadow Moth - purple
      ember_firefly: '#ff8800',
      frost_needle: '#44ffff',
      magma_crawler: '#ff4400',
      electric_jolt: '#ffff00',
      healer: '#22ff88',
      tank: '#ff4444',
      scout: '#44ff88',
      boss: '#ff00ff',
      default: '#ffffff',
    };

    const color = hitColors[bugType] || hitColors.default;

    // Three-layer particle burst for AAA feel
    this.particleSystem.spawnSplatter(x, y, color, 3);
    if (isCrit) {
      this.particleSystem.spawnShockwave(x, y, '#ff00ff', 200);
      this.particleSystem.spawnSplatter(x, y, '#ff00ff', 5);
    }

    this.screenShake = isCrit ? 8 : 3;
    this.screenShakeDuration = 0.15;
  }

  triggerBugDeath(x: number, y: number, bugType: string, boss: boolean = false) {
    const skipBasic = ['beetle', 'stag', 'moth'];
    const colorMap: Record<string, string> = {
      beetle: '#dc2626',
      stag: '#0ea5e9',
      moth: '#9333ea',
      default: '#f59e0b',
    };

    const color = colorMap[bugType] || colorMap.default;

    // Death explosion - compound blast
    this.particleSystem.spawnSplatter(x, y, color, boss ? 10 : 5);
    this.particleSystem.spawnSplatter(x, y, '#ffffff', boss ? 5 : 2);

    if (boss) {
      this.particleSystem.spawnShockwave(x, y, '#ff00ff', 500);
      this.screenShake = 16;
      this.screenShakeDuration = 0.6;
    } else {
      this.screenShake = 4;
      this.screenShakeDuration = 0.2;
    }
  }

  triggerPowerupCollect(x: number, y: number, powerupType: string) {
    const colors: Record<string, string> = {
      shield: '#3b82f6',
      multiplier: '#fbbf24',
      rapidfire: '#ef4444',
      slowmo: '#a855f7',
      freeze: '#06b6d4',
      magnet: '#f97316',
      nuke: '#ef4444',
      spikeburst: '#f97316',
    };

    const color = colors[powerupType] || '#ffffff';
    this.particleSystem.spawnShockwave(x, y, color, 300);
    this.particleSystem.spawnSplatter(x, y, color, 8);
  }

  update(dt: number) {
    if (this.screenShakeDuration > 0) {
      this.screenShakeDuration -= dt;
    }
  }

  getScreenShake(): { active: boolean; magnitude: number } {
    return {
      active: this.screenShakeDuration > 0,
      magnitude: this.screenShake,
    };
  }
}
