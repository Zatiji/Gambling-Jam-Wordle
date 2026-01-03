import { IPowerUp, PowerUpExecutionResult } from "./IPowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class ScannerPowerUp implements IPowerUp {
  execute(engine: WordleEngine, input?: string): PowerUpExecutionResult {
    const vowels = ["A", "E", "I", "O", "U", "Y"];
    if (!input) {
      return { info: "Provide a vowel to scan for." };
    }

    const vowel = input.trim().toUpperCase();
    if (!vowels.includes(vowel)) {
      return { info: "Scanner accepts a single vowel (A, E, I, O, U, Y)." };
    }

    const hasVowel = engine.hasLetter(vowel);
    const info = hasVowel ? `${vowel} is present.` : `${vowel} is not present.`;
    return { info };
  }
}
