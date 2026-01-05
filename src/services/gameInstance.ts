import { createGameManager } from "./createGameManager";

const GAME_KEY = import.meta.env.VITE_GAME_KEY || "WEB_GAME_KEY";

export const gameManager = createGameManager({
  gameKey: GAME_KEY,
  mockTransactionsOnly: true,
});
