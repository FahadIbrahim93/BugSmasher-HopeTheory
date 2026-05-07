// Biome Atmosphere System - 6 biome-specific visual effects
import { Biome, BiomeConfig } from '../BiomeConfig';

export interface AtmosphereConfig {
  primaryColors: string[];
  secondaryColors: string[];
  particleDensity: number;
  ambientGlow: string;
  distortionStrength: number;
  speedMultiplier: number;
}

// Biome atmosphere specifications from visual design document
export const BIOME_ATMOSPHERES: Record<string, AtmosphereConfig> = {
  neon_core: {
    primaryColors: ['#00FFFF', '#FF00FF', '#00FF00'],
    secondaryColors: ['#4B0082', '#C0C0C0'],
    particleDensity: 0.5,
    ambientGlow: 'rgba(0, 255, 255, 0.15)',
    distortionStrength: 0.3,
    speedMultiplier: 1.0,
  },
  quantum_void: {
    primaryColors: ['#9400D3', '#FF69B4', '#000080'],
    secondaryColors: ['#000000', '#FFFFFF'],
    particleDensity: 1.2,
    ambientGlow: 'rgba(148, 0, 211, 0.2)',
    distortionStrength: 0.8,
    speedMultiplier: 0.8,
  },
  ember_depths: {
    primaryColors: ['#FF4500', '#FF0000', '#696969'],
    secondaryColors: ['#8B4513', '#FF8C00'],
    particleDensity: 1.0,
    ambientGlow: 'rgba(255, 69, 0, 0.2)',
    distortionStrength: 0.4,
    speedMultiplier: 1.2,
  },
  frostbyte: {
    primaryColors: ['#87CEEB', '#F0F8FF', '#7FFFD4'],
    secondaryColors: ['#CCCCFF', '#4682B4'],
    particleDensity: 0.8,
    ambientGlow: 'rgba(135, 206, 235, 0.2)',
    distortionStrength: 0.5,
    speedMultiplier: 0.7,
  },
  void_abyss: {
    primaryColors: ['#9400D3', '#FF1493', '#1a1a2e'],
    secondaryColors: ['#000000', '#e94560'],
    particleDensity: 1.5,
    ambientGlow: 'rgba(148, 0, 211, 0.3)',
    distortionStrength: 1.0,
    speedMultiplier: 0.6,
  },
  golden_spire: {
    primaryColors: ['#FFD700', '#FFA500', '#FFE4B5'],
    secondaryColors: ['#87CEEB', '#FF8C00'],
    particleDensity: 0.7,
    ambientGlow: 'rgba(255, 215, 0, 0.25)',
    distortionStrength: 0.3,
    speedMultiplier: 1.1,
  },
};

export class BiomeAtmosphereSystem {
  private config: AtmosphereConfig;
  private time: number = 0;
  private currentBiomeId: string = 'neon_core';

  constructor() {
    this.config = BIOME_ATMOSPHERES[this.currentBiomeId];
  }

  setBiome(biomeId: string) {
    this.currentBiomeId = biomeId;
    this.config = BIOME_ATMOSPHERES[biomeId] || BIOME_ATMOSPHERES.neon_core;
  }

  update(dt: number) {
    this.time += dt;
  }

  getAmbientColor(t: number = 0): string {
    // Cycle through primary colors based on time
    const idx = Math.floor((this.time + t) * 0.2) % this.config.primaryColors.length;
    return this.config.primaryColors[idx];
  }

  getAmbientGlow(): string {
    return this.config.ambientGlow;
  }

  getDistortionStrength(): number {
    return this.config.distortionStrength;
  }

  getConfig(): AtmosphereConfig {
    return this.config;
  }
}
