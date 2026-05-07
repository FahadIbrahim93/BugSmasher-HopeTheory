export type BossSpecies = 'ant' | 'spider' | 'beetle' | 'mantis' | 'centipede' | 'wasp' | 'scarab';

export interface BossPhaseConfig {
  name: string;
  hpThreshold: number;
  addSpawnInterval: number;
  corePressureDamage: number;
  weakPointMultiplier: number;
}

export interface BossRewardConfig {
  materialId: string;
  materialAmount: number;
  xp: number;
  crystals: number;
}

export interface BossConfig {
  id: string;
  name: string;
  species: BossSpecies;
  biomeId: string;
  unlock: {
    wave: number;
    prestigeLevel?: number;
  };
  baseHp: number;
  hpPerWave: number;
  scoreValue: number;
  color: string;
  accentColor: string;
  loreIntro: string;
  loreDefeat: string;
  phases: BossPhaseConfig[];
  reward: BossRewardConfig;
}

export interface BossWeakPoint {
  x: number;
  y: number;
  radius: number;
  active: boolean;
  pulse: number;
}

export interface Boss {
  id: string;
  config: BossConfig;
  hp: number;
  maxHp: number;
  phaseIndex: number;
  x: number;
  y: number;
  size: number;
  attackTimer: number;
  addSpawnTimer: number;
  state: 'intro' | 'active' | 'staggered' | 'defeated';
  weakPoint: BossWeakPoint;
  elapsed: number;
}

export const BOSS_CONFIGS: BossConfig[] = [
  {
    id: 'motherboard_myrmex',
    name: 'Motherboard Myrmex',
    species: 'ant',
    biomeId: 'neon_core',
    unlock: { wave: 5 },
    baseHp: 65,
    hpPerWave: 9,
    scoreValue: 750,
    color: '#00ffcc',
    accentColor: '#ff00ff',
    loreIntro: 'The queen has learned your click pattern. Break the swarm mind.',
    loreDefeat: 'Hope is not prediction. Hope is adaptation.',
    phases: [
      {
        name: 'Lane Protocol',
        hpThreshold: 1,
        addSpawnInterval: 3.2,
        corePressureDamage: 4,
        weakPointMultiplier: 1.4,
      },
      {
        name: 'Worker Surge',
        hpThreshold: 0.66,
        addSpawnInterval: 2.4,
        corePressureDamage: 6,
        weakPointMultiplier: 1.7,
      },
      {
        name: 'Royal Panic',
        hpThreshold: 0.33,
        addSpawnInterval: 1.7,
        corePressureDamage: 8,
        weakPointMultiplier: 2,
      },
    ],
    reward: {
      materialId: 'queen_chitin',
      materialAmount: 1,
      xp: 125,
      crystals: 8,
    },
  },
];

export function getBossById(bossId: string): BossConfig | null {
  return BOSS_CONFIGS.find((boss) => boss.id === bossId) ?? null;
}

export function getBossForWave(
  wave: number,
  biomeId: string,
  prestigeLevel: number,
): BossConfig | null {
  return (
    BOSS_CONFIGS.find((boss) => {
      if (boss.unlock.wave !== wave) return false;
      if (boss.biomeId !== biomeId) return false;
      if ((boss.unlock.prestigeLevel ?? 0) > prestigeLevel) return false;
      return true;
    }) ?? null
  );
}
