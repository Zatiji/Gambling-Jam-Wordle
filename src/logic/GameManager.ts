import EconomySystem from "./EconomySystem.js";
import WordleEngine, { LetterResult, GameStatus } from "./WordleEngine.js";
import { IPowerUp } from "./powerups/IPowerUp.js";

export type PowerUpType = "scanner" | "sniper" | "extra_life";
export type WordProvider = () => string;

export interface RoundStartResult {
  betAccepted: boolean;
  maxAttempts: number;
}

export interface GuessResult {
  letters: LetterResult[];
  status: GameStatus;
  payout: number;
  bankroll: number;
}

export interface PowerUpResult {
  success: boolean;
  type: PowerUpType;
  info?: string;
  bankroll: number;
}

export default class GameManager {
  private readonly economy: EconomySystem;
  private readonly engine: WordleEngine;
  private readonly wordProvider: WordProvider;
  private readonly powerUps: Map<PowerUpType, IPowerUp>;

  constructor(
    economy: EconomySystem,
    engine: WordleEngine,
    wordProvider: WordProvider,
    powerUps: Map<PowerUpType, IPowerUp>
  ) {
    this.economy = economy;
    this.engine = engine;
    this.wordProvider = wordProvider;
    this.powerUps = powerUps;
  }

  startRound(betAmount: number): RoundStartResult {
    this.ensureNoActiveRound();
    const betAccepted = this.economy.placeBet(betAmount);
    if (!betAccepted) {
      return {
        betAccepted,
        maxAttempts: this.engine.getMaxAttempts(),
      };
    }

    const word = this.wordProvider();
    this.engine.startNewGame(word);
    this.engine.setMaxAttempts(4);
    return {
      betAccepted,
      maxAttempts: this.engine.getMaxAttempts(),
    };
  }

  makeGuess(word: string): GuessResult {
    this.ensureRoundActive();
    const letters = this.engine.submitGuess(word);
    const status = this.engine.getStatus();
    let payout = 0;

    if (status === "won") {
      const multiplier = this.economy.calculatePayout(this.engine.getAttempts());
      payout = this.economy.cashOut(multiplier);
    } else if (status === "lost") {
      this.economy.cashOut(0);
    }

    return {
      letters,
      status,
      payout,
      bankroll: this.economy.getBankroll(),
    };
  }

  purchasePowerUp(type: PowerUpType, cost: number, currentGuess?: string): PowerUpResult {
    this.ensureRoundActive();

    const powerUp = this.powerUps.get(type);
    if (!powerUp) {
      throw new Error(`Power-up type '${type}' is not configured.`);
    }

    const success = this.economy.buyHint(cost);
    if (!success) {
      return {
        success,
        type,
        bankroll: this.economy.getBankroll(),
      };
    }

    const executionResult = powerUp.execute(this.engine, currentGuess);

    return {
      success,
      type,
      info: executionResult.info,
      bankroll: this.economy.getBankroll(),
    };
  }

  getBankroll(): number {
    return this.economy.getBankroll();
  }

  private ensureRoundActive(): void {
    if (!this.engine.isGameActive()) {
      throw new Error("No active round.");
    }
  }

  private ensureNoActiveRound(): void {
    if (this.engine.isGameActive()) {
      throw new Error("Round already in progress.");
    }
  }
}
