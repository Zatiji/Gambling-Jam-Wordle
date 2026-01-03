export const GAME_CONFIG = {
  BETTING: {
    MIN_BET: 10,
    MAX_BET: 5000,
  },
  PAYOUT_MULTIPLIERS: {
    1: 50,  // Victoire en 1 coup
    2: 5,   // Victoire en 2 coups
    3: 2,   // Victoire en 3 coups
    4: 0.5, // Victoire en 4 coups
  } as Record<number, number>,
  POWERUPS: {
    COSTS: {
      LEVEL_1: 50,  // Ex: Scanner
      LEVEL_2: 100, // Ex: Sniper
      LEVEL_3: 200, // Ex: Extra Life
    },
    // Mapping des types vers les niveaux de coût par défaut
    TIERS: {
      scanner: "LEVEL_1",
      lucky_shot: "LEVEL_2",
      extra_life: "LEVEL_3",
    } as const,
  },
};
