
import { GAME_CONFIG } from "../data/GameConfig.js";

export default class EconomySystem {
  private totalCost = 0;
  private totalGain = 0;
  private currentBet = 0;

  reset(): void {
    this.totalCost = 0;
    this.totalGain = 0;
    this.currentBet = 0;
  }

  placeBet(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Bet amount must be a positive number.");
    }

    if (amount < GAME_CONFIG.BETTING.MIN_BET) {
      throw new Error(`Bet amount must be at least ${GAME_CONFIG.BETTING.MIN_BET}.`);
    }

    if (amount > GAME_CONFIG.BETTING.MAX_BET) {
      throw new Error(`Bet amount cannot exceed ${GAME_CONFIG.BETTING.MAX_BET}.`);
    }

    this.currentBet = amount;
    this.totalCost += amount;
  }

  calculatePayout(attemptNumber: number): number {
    return GAME_CONFIG.PAYOUT_MULTIPLIERS[attemptNumber] ?? 0;
  }

  recordPowerUpCost(cost: number): void {
    if (!Number.isFinite(cost) || cost <= 0) {
      throw new Error("Power-up cost must be a positive number.");
    }

    this.totalCost += cost;
  }

  recordWin(multiplier: number): number {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new Error("Multiplier must be a non-negative number.");
    }

    const winAmount = this.currentBet * multiplier;
    this.totalGain += winAmount;
    return winAmount;
  }

  getNetResult(): number {
    return this.totalGain - this.totalCost;
  }

  getTotalCost(): number {
    return this.totalCost;
  }

  getTotalGain(): number {
    return this.totalGain;
  }
}
