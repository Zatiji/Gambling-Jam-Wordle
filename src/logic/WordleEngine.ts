
export type LetterStatus = "correct" | "present" | "absent";

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export type GameStatus = "playing" | "won" | "lost";

export default class WordleEngine {
  private targetWord = "";
  private attempts = 0;
  private maxAttempts = 4;
  private gameStatus: GameStatus = "playing";
  private gameStarted = false;

  startNewGame(word: string): void {
    const normalized = word.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(normalized)) {
      throw new Error("Target word must be exactly 5 letters.");
    }

    this.targetWord = normalized;
    this.attempts = 0;
    this.gameStatus = "playing";
    this.gameStarted = true;
  }

  setMaxAttempts(maxAttempts: number): void {
    if (!Number.isInteger(maxAttempts) || maxAttempts <= 0) {
      throw new Error("Max attempts must be a positive integer.");
    }

    this.maxAttempts = maxAttempts;
  }

  grantExtraAttempt(): void {
    this.maxAttempts += 1;
  }

  submitGuess(guess: string): LetterResult[] {
    if (!this.gameStarted) {
      throw new Error("Game has not started.");
    }

    if (this.gameStatus !== "playing") {
      throw new Error("Game is not active.");
    }

    const normalized = guess.trim().toUpperCase();

    if (!/^[A-Z]{5}$/.test(normalized)) {
      throw new Error("Guess must be exactly 5 letters.");
    }

    this.attempts += 1;

    const result: LetterResult[] = Array.from({ length: 5 }, (_, index) => ({
      letter: normalized[index],
      status: "absent",
    }));

    const remainingCounts: Record<string, number> = {};

    for (let i = 0; i < 5; i += 1) {

      const guessLetter = normalized[i];
      const targetLetter = this.targetWord[i];

      if (guessLetter === targetLetter) {
        result[i].status = "correct";
      } else {
        remainingCounts[targetLetter] = (remainingCounts[targetLetter] ?? 0) + 1;
      }
    }

    for (let i = 0; i < 5; i += 1) {
      if (result[i].status === "correct") {
        continue;
      }

      const guessLetter = normalized[i];
      const remaining = remainingCounts[guessLetter] ?? 0;

      if (remaining > 0) {
        result[i].status = "present";
        remainingCounts[guessLetter] = remaining - 1;
      }
    }

    if (result.every((entry) => entry.status === "correct")) {
      this.gameStatus = "won";
    } else if (this.attempts >= this.maxAttempts) {
      this.gameStatus = "lost";
    }

    return result;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getStatus(): GameStatus {
    return this.gameStatus;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  isGameActive(): boolean {
    return this.gameStarted && this.gameStatus === "playing";
  }

  getFirstLetter(): string | null {
    if (!this.targetWord) {
      return null;
    }

    return this.targetWord[0];
  }

  hasLetter(letter: string): boolean {
    if (!this.targetWord) {
      return false;
    }

    return this.targetWord.includes(letter.toUpperCase());
  }
}
