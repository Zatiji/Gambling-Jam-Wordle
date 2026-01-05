import GameManager, { PowerUpType, WordProvider } from "../logic/GameManager.js";
import WordleEngine from "../logic/WordleEngine.js";
import EconomySystem from "../logic/EconomySystem.js";
import MockGamblingApi from "./MockGamblingApi.js";
import GamblingApi from "./GamblingApi.js";
import TransactionMockGamblingApi from "./TransactionMockGamblingApi.js";
import { getRandomWord } from "../data/dictionary.js";
import { LuckyShotPowerUp } from "../logic/powerups/LuckyShotPowerUp.js";
import { ScannerPowerUp } from "../logic/powerups/ScannerPowerUp.js";
import { ExtraLifePowerUp } from "../logic/powerups/ExtraLifePowerUp.js";
import { InterfacePowerUp } from "../logic/powerups/InterfacePowerUp.js";

export interface CreateGameManagerOptions {
  gameKey: string;
  useMockApi?: boolean;
  mockTransactionsOnly?: boolean;
  wordProvider?: WordProvider;
}

export function createGameManager(options: CreateGameManagerOptions): GameManager {
  const {
    gameKey,
    useMockApi = false,
    mockTransactionsOnly = false,
    wordProvider = getRandomWord,
  } = options;

  const economy = new EconomySystem();
  const engine = new WordleEngine();
  const api = useMockApi
    ? new MockGamblingApi(gameKey)
    : mockTransactionsOnly
      ? new TransactionMockGamblingApi(gameKey)
      : new GamblingApi(gameKey);

  const powerUps = new Map<PowerUpType, InterfacePowerUp>();
  powerUps.set("scanner", new ScannerPowerUp());
  powerUps.set("lucky_shot", new LuckyShotPowerUp());
  powerUps.set("extra_life", new ExtraLifePowerUp());

  return new GameManager(
    economy,
    engine,
    wordProvider,
    powerUps,
    api
  );
}
