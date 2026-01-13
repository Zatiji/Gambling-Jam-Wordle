export const GAME_CONFIG = {
  BETTING: {
    MIN_BET: 10,
    MAX_BET: 50,
  },
  PAYOUT_MULTIPLIERS: {
    1: 25,  // Victoire en 1 coup
    2: 2,   // Victoire en 2 coups
    3: 1.5, // Victoire en 3 coups
    4: 0.5, // Victoire en 4 coups
    5: 0.5, // Victoire en 5 coups (extra life)
  } as Record<number, number>,
  POWERUPS: {
    COSTS: {
      LEVEL_1: 40,  // Ex: Scanner
      LEVEL_2: 90, // Ex: Lucky Shot
      LEVEL_3: 130, // Ex: Extra Life
    },
    // Mapping des types vers les niveaux de coût par défaut
    TIERS: {
      scanner: "LEVEL_1",
      lucky_shot: "LEVEL_2",
      extra_life: "LEVEL_3",
    } as const,
  },
};
