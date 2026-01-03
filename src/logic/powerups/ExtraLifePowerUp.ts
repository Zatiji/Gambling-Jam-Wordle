import { IPowerUp, PowerUpExecutionResult } from "./IPowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class ExtraLifePowerUp implements IPowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    engine.grantExtraAttempt();
    return {
      info: `Extra attempt granted. Max attempts: ${engine.getMaxAttempts()}.`,
    };
  }
}
