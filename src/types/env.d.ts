declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GAME_KEY?: string;
    }
  }
}

export {};
