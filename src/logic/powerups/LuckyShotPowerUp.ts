import { InterfacePowerUp, PowerUpExecutionResult } from "./InterfacePowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class LuckyShotPowerUp implements InterfacePowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    const randomIndex = Math.floor(Math.random() * 5);
    const letter = engine.getLetterAt(randomIndex);
    
    const positionDisplay = randomIndex + 1;

    return {
      info: letter 
        ? `Lucky Shot reveals position ${positionDisplay}: ${letter}` 
        : "Lucky Shot failed (Game not active).",
    };
  }
}
