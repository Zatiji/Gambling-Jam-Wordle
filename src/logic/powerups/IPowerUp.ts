import WordleEngine from "../WordleEngine.js";

export interface PowerUpExecutionResult {
  info: string;
}

export interface IPowerUp {
  execute(engine: WordleEngine, input?: string): PowerUpExecutionResult;
}
