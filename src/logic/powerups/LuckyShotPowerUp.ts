import { InterfacePowerUp, PowerUpExecutionResult } from "./InterfacePowerUp.js";
import WordleEngine from "../WordleEngine.js";

export class LuckyShotPowerUp implements InterfacePowerUp {
  execute(engine: WordleEngine): PowerUpExecutionResult {
    // Choisir un index aléatoire entre 0 et 4
    const randomIndex = Math.floor(Math.random() * 5);
    const letter = engine.getLetterAt(randomIndex);
    
    // Formatter pour l'affichage (1-based index pour l'humain)
    const positionDisplay = randomIndex + 1;

    return {
      info: letter 
        ? `Lucky Shot reveals position ${positionDisplay}: ${letter}` 
        : "Lucky Shot failed (Game not active).",
    };
  }
}
