import WordleEngine from "../WordleEngine.js";

export interface PowerUpExecutionResult {
  info: string;
}

export interface InterfacePowerUp {
  execute(engine: WordleEngine, input?: string): PowerUpExecutionResult;
}
