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
  private currentUserKey: string | null = null;
  private transactionFinalized = false;
  private firstAttemptMultiplierOverride: number | null = null;

  constructor(
    economy: EconomySystem,
    engine: WordleEngine,
    wordProvider: WordProvider,
    powerUps: Map<PowerUpType, InterfacePowerUp>,
    api: GamblingApi
  ) {
    this.economy = economy;
    this.engine = engine;
    this.wordProvider = wordProvider;
    this.powerUps = powerUps;
    this.api = api;
  }

  async startRound(userKey: string, betAmount: number): Promise<RoundStartResult> {
    this.ensureNoActiveRound();
    this.currentUserKey = null;
    this.transactionFinalized = false;
    this.firstAttemptMultiplierOverride = null;

    this.economy.reset();

    if (!userKey) {
      return {
        betAccepted: false,
        maxAttempts: 0,
        message: "User key is required to start a round.",
      };
    }

    try {
      const balance = await this.api.getWallet("utilisateur", userKey);
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
    this.currentUserKey = userKey;

    return {
      betAccepted: true,
      maxAttempts: this.engine.getMaxAttempts(),
    };
  }

  async getUserBalance(userKey: string): Promise<number> {
    if (!userKey) {
      throw new Error("User key is required.");
    }

    return this.api.getWallet("utilisateur", userKey);
  }

  getPayoutMultiplier(attemptNumber: number): number {
    if (attemptNumber === 1 && this.firstAttemptMultiplierOverride !== null) {
      return this.firstAttemptMultiplierOverride;
    }
    return this.economy.calculatePayout(attemptNumber);
  }

  getTargetWord(): string | null {
    return this.engine.getTargetWord();
  }

  async makeGuess(word: string): Promise<GuessResult> {
    this.ensureRoundActive();
    const letters = this.engine.submitGuess(word);
    const status = this.engine.getStatus();
    let payout = 0;

    if (status === "won" || status === "lost") {
      if (status === "won") {
        const multiplier = this.getPayoutMultiplier(this.engine.getAttempts());
        payout = this.economy.recordWin(multiplier);
      }
    }

    return {
      letters,
      status,
      payout,
    };
  }

  async finalizeRound(): Promise<string> {
    if (this.engine.getStatus() === "playing") {
      throw new Error("Round is still in progress.");
    }
    if (this.transactionFinalized) {
      throw new Error("Transaction already finalized.");
    }

    try {
      const message = await this.finalizeTransaction();
      this.transactionFinalized = true;
      this.currentUserKey = null;
      return message;
    } catch (e) {
      throw e;
    }
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
    if (type === "scanner") {
      this.firstAttemptMultiplierOverride = Math.min(this.firstAttemptMultiplierOverride ?? Infinity, 7);
    } else if (type === "lucky_shot") {
      this.firstAttemptMultiplierOverride = Math.min(this.firstAttemptMultiplierOverride ?? Infinity, 5);
    }

    return {
      success: true,
      type,
      info: executionResult.info,
    };
  }

  // Calculates net result (Winnings - Costs) and executes API transaction.
  private async finalizeTransaction(): Promise<string> {
    const netResult = this.economy.getNetResult();
    const userKey = this.currentUserKey;

    if (!userKey) {
      throw new Error("User key missing for transaction.");
    }

    if (netResult === 0) {
      return "No money exchange (Break even).";
    }

    if (netResult > 0) {
      const response = await this.api.exchangeMoney({
        source: this.api.getGameKey(), 
        destination: userKey,
        montant: Math.floor(netResult),
      });
      return `You won ${netResult}! ${response.message}`;
    } else {
      const amountToPay = Math.abs(netResult);
      const response = await this.api.exchangeMoney({
        source: userKey,
        destination: this.api.getGameKey(), 
        montant: Math.floor(amountToPay),
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
