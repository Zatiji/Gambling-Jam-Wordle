

export default class EconomySystem {

  private bankroll: number;
  private currentBet = 0;

  constructor(startingMoney: number) {
    if (!Number.isFinite(startingMoney) || startingMoney < 0) {
      throw new Error("Starting money must be a non-negative number.");
    }

    this.bankroll = startingMoney;
  }

  placeBet(amount: number): boolean {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Bet amount must be a positive number.");
    }

    if (amount > this.bankroll) {
      return false;
    }

    this.bankroll -= amount;
    this.currentBet = amount;
    return true;
  }

  calculatePayout(attemptNumber: number): number {
    switch (attemptNumber) {
      case 1:
        return 50;
      case 2:
        return 5;
      case 3:
        return 2;
      case 4:
        return 0.5;
      default:
        return 0;
    }
  }

  buyHint(cost: number): boolean {
    if (!Number.isFinite(cost) || cost <= 0) {
      throw new Error("Hint cost must be a positive number.");
    }

    if (cost > this.bankroll) {
      return false;
    }

    this.bankroll -= cost;
    return true;
  }

  cashOut(multiplier: number): number {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new Error("Multiplier must be a non-negative number.");
    }

    const payout = this.currentBet * multiplier;
    this.bankroll += payout;
    this.currentBet = 0;
    return payout;
  }

  getBankroll(): number {
    return this.bankroll;
  }

  getCurrentBet(): number {
    return this.currentBet;
  }
}
