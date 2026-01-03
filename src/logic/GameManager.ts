import EconomySystem from "./EconomySystem.js";
import WordleEngine, { LetterResult, GameStatus } from "./WordleEngine.js";
import { InterfacePowerUp } from "./powerups/InterfacePowerUp.js";
import GamblingApi from "../services/GamblingApi.js";

export type PowerUpType = "scanner" | "lucky_shot" | "extra_life";
export type WordProvider = () => string;

export interface RoundStartResult {
  betAccepted: boolean;
  maxAttempts: number;
  message?: string;
}

export interface GuessResult {
  letters: LetterResult[];
  status: GameStatus;
  payout: number;
  transactionMessage?: string;
}

export interface PowerUpResult {
  success: boolean;
  type: PowerUpType;
  info?: string;
}

export default class GameManager {
  private readonly economy: EconomySystem;
  private readonly engine: WordleEngine;
  private readonly wordProvider: WordProvider;
  private readonly powerUps: Map<PowerUpType, InterfacePowerUp>;
  private readonly api: GamblingApi;
  private readonly userKey: string;

  constructor(
    economy: EconomySystem,
    engine: WordleEngine,
    wordProvider: WordProvider,
    powerUps: Map<PowerUpType, InterfacePowerUp>,
    api: GamblingApi,
    userKey: string
  ) {
    this.economy = economy;
    this.engine = engine;
    this.wordProvider = wordProvider;
    this.powerUps = powerUps;
    this.api = api;
    this.userKey = userKey;
  }

  async startRound(betAmount: number): Promise<RoundStartResult> {
    this.ensureNoActiveRound();

    this.economy.reset();

    try {
      const balance = await this.api.getWallet("utilisateur", this.userKey);
      if (balance < betAmount) {
        return {
          betAccepted: false,
          maxAttempts: 0,
          message: "Insufficient funds on server.",
        };
      }
    } catch (error) {
       return {
          betAccepted: false,
          maxAttempts: 0,
          message: `API Error: ${(error as Error).message}`,
        };
    }

    try {
      this.economy.placeBet(betAmount);
    } catch (e) {
      return {
        betAccepted: false,
        maxAttempts: 0,
        message: (e as Error).message,
      };
    }

    const word = this.wordProvider();
    this.engine.startNewGame(word);
    this.engine.setMaxAttempts(4);

    return {
      betAccepted: true,
      maxAttempts: this.engine.getMaxAttempts(),
    };
  }

  async makeGuess(word: string): Promise<GuessResult> {
    this.ensureRoundActive();
    const letters = this.engine.submitGuess(word);
    const status = this.engine.getStatus();
    let payout = 0;
    let transactionMessage = undefined;

    if (status === "won" || status === "lost") {
      if (status === "won") {
        const multiplier = this.economy.calculatePayout(this.engine.getAttempts());
        payout = this.economy.recordWin(multiplier);
      }
      
      try {
        transactionMessage = await this.finalizeTransaction();
      } catch (e) {
        transactionMessage = `Transaction failed: ${(e as Error).message}`;
      }
    }

    return {
      letters,
      status,
      payout,
      transactionMessage,
    };
  }

  purchasePowerUp(type: PowerUpType, cost: number, currentGuess?: string): PowerUpResult {
    this.ensureRoundActive();

    const powerUp = this.powerUps.get(type);
    if (!powerUp) {
      throw new Error(`Power-up type '${type}' is not configured.`);
    }

    // Record cost only, no immediate API check (deferred rule)
    try {
      this.economy.recordPowerUpCost(cost);
    } catch (e) {
      return { success: false, type, info: (e as Error).message };
    }

    const executionResult = powerUp.execute(this.engine, currentGuess);

    return {
      success: true,
      type,
      info: executionResult.info,
    };
  }

  // Calculates net result (Winnings - Costs) and executes API transaction.
  private async finalizeTransaction(): Promise<string> {
    const netResult = this.economy.getNetResult();

    if (netResult === 0) {
      return "No money exchange (Break even).";
    }

    if (netResult > 0) {
      const response = await this.api.exchangeMoney({
        source: this.api.getGameKey(), 
        destination: this.userKey,
        montant: netResult,
      });
      return `You won ${netResult}! ${response.message}`;
    } else {
      const amountToPay = Math.abs(netResult);
      const response = await this.api.exchangeMoney({
        source: this.userKey,
        destination: this.api.getGameKey(), 
        montant: amountToPay,
      });
      return `You lost ${amountToPay}. ${response.message}`;
    }
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
