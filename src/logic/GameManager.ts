import EconomySystem from "./EconomySystem.js";
import WordleEngine, { LetterResult, GameStatus } from "./WordleEngine.js";
import { getRandomWord } from "../data/dictionary.js";

export type PowerUpType = "scanner" | "sniper" | "extra_life";

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
  private economy?: EconomySystem;
  private engine?: WordleEngine;

  initialize(startingMoney: number): void {
    this.economy = new EconomySystem(startingMoney);
    this.engine = new WordleEngine();
  }

  startRound(betAmount: number): RoundStartResult {
    if (!this.economy || !this.engine) {
      throw new Error("GameManager is not initialized.");
    }

    this.ensureNoActiveRound();
    const betAccepted = this.economy.placeBet(betAmount);
    if (!betAccepted) {
      return {
        betAccepted,
        maxAttempts: this.engine.getMaxAttempts(),
      };
    }

    const word = getRandomWord();
    this.engine.startNewGame(word);
    this.engine.setMaxAttempts(4);
    return {
      betAccepted,
      maxAttempts: this.engine.getMaxAttempts(),
    };
  }

  makeGuess(word: string): GuessResult {
    if (!this.economy || !this.engine) {
      throw new Error("GameManager is not initialized.");
    }

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
    if (!this.economy || !this.engine) {
      throw new Error("GameManager is not initialized.");
    }

    this.ensureRoundActive();
    const success = this.economy.buyHint(cost);
    if (!success) {
      return {
        success,
        type,
        bankroll: this.economy.getBankroll(),
      };
    }

    if (type === "extra_life") {
      this.engine.grantExtraAttempt();
      return {
        success,
        type,
        info: `Extra attempt granted. Max attempts: ${this.engine.getMaxAttempts()}.`,
        bankroll: this.economy.getBankroll(),
      };
    }

    if (type === "sniper") {
      const hintLetter = this.engine.getFirstLetter();

      return {
        success,
        type,
        info: hintLetter ? `First letter: ${hintLetter}.` : "First letter unavailable.",
        bankroll: this.economy.getBankroll(),
      };
    }

    const scannerInfo = this.scanVowelPresence(currentGuess);
    return {
      success,
      type,
      info: scannerInfo,
      bankroll: this.economy.getBankroll(),
    };
  }

  getBankroll(): number {
    if (!this.economy) {
      throw new Error("GameManager is not initialized.");
    }

    return this.economy.getBankroll();
  }

  private scanVowelPresence(currentGuess?: string): string {
    const vowels = ["A", "E", "I", "O", "U", "Y"];
    if (!currentGuess) {
      return "Provide a vowel to scan for.";
    }

    const vowel = currentGuess.trim().toUpperCase();
    if (!vowels.includes(vowel)) {
      return "Scanner accepts a single vowel (A, E, I, O, U, Y).";
    }

    const hasVowel = this.engine?.hasLetter(vowel) ?? false;
    return hasVowel ? `${vowel} is present.` : `${vowel} is not present.`;
  }

  private ensureRoundActive(): void {
    if (!this.engine?.isGameActive()) {
      throw new Error("No active round.");
    }
  }

  private ensureNoActiveRound(): void {
    if (this.engine?.isGameActive()) {
      throw new Error("Round already in progress.");
    }
  }
}
