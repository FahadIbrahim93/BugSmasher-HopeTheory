export const GAME_CONFIG = {
  FPS_TARGET: 60 as const,
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600
  },
  CORE: {
    MAX_HEALTH: 100,
    START_SHIELD: 0
  },
  WAVES: {
    INITIAL_SPAWN_RATE: 1200,
    MIN_SPAWN_RATE: 300,
    ENEMY_COUNT_MULTIPLIER: 1.18,
    DIFFICULTY_RAMP: 0.92
  },
  SCORING: {
    BASE_KILL: 10,
    COMBO_THRESHOLD: [0, 5, 12, 25, 50],
    MULTIPLIERS: [1, 1.5, 2.2, 3.5, 5.0]
  },
  UPGRADES: {
    MAX_LEVEL: 20,
    COST_BASE: 15,
    COST_EXPONENT: 1.45
  },
  BIOMES: [
    { id: 'neon-core', name: 'Neon Core', color: '#00f3ff' },
    // more to come
  ]
} as const;

export type GameConfig = typeof GAME_CONFIG;