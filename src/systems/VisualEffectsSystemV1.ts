// Visual Effects System - Entry point for all VFX
import { ParticleSystem } from '../game/ParticleSystem';

export class VisualEffectsSystemV1 {
  private particleSystem: ParticleSystem;
  private activeEffects: Map<string, any> = new Map();

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  // Spawn bug-specific effects
  spawnBugHit(x: number, y: number, bugType: string, isCrit: boolean = false) {
    const color = this.getBugHitColor(bugType);
    // Note: spawnSplatter takes 3 args, not 4
    this.particleSystem.spawnSplatter(x, y, color);
    if (isCrit) {
      this.particleSystem.spawnShockwave(x, y, '#ff00ff', 200);
    }
  }

  private getBugHitColor(bugType: string): string {
    const colorMap: Record<string, string> = {
      beetle: '#ff4444',
      stag: '#44aaff',
      moth: '#aa44ff',
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
    return colorMap[bugType] || '#ffffff';
  }

  update(dt: number) {
    Array.from(this.activeEffects.entries()).forEach(([id, effect]) => {
      effect.timer -= dt;
      if (effect.timer <= 0) {
        this.activeEffects.delete(id);
      }
    });
  }
}