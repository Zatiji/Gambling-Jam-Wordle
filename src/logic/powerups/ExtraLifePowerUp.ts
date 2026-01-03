import { InterfacePowerUp, PowerUpExecutionResult } from "./InterfacePowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class ExtraLifePowerUp implements InterfacePowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    engine.grantExtraAttempt();
    return {
      info: `Extra attempt granted. Max attempts: ${engine.getMaxAttempts()}.`,
    };
  }
}
