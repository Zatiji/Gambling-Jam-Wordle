import { IPowerUp, PowerUpExecutionResult } from "./IPowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class SniperPowerUp implements IPowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    const hintLetter = engine.getFirstLetter();
    return {
      info: hintLetter ? `First letter: ${hintLetter}.` : "First letter unavailable.",
    };
  }
}
