import { InterfacePowerUp, PowerUpExecutionResult } from "./InterfacePowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class LuckyShotPowerUp implements IPowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    // Choose a random index between 0 and 4
    const randomIndex = Math.floor(Math.random() * 5);
    const letter = engine.getLetterAt(randomIndex);
    
    // Format for display (1-based index for humans)
    const positionDisplay = randomIndex + 1;

    return {
      info: letter 
        ? `Lucky Shot reveals position ${positionDisplay}: ${letter}` 
        : "Lucky Shot failed (Game not active).",
    };
  }
}
