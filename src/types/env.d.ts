declare const process: {
  env: {
    GAME_KEY?: string;
    USER_KEY?: string;
  };
  argv: string[];
  exit(code?: number): void;
};
