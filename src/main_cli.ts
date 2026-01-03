import GameManager from "./logic/GameManager.js";

const game = new GameManager();
game.initialize(100);

console.log("Starting bankroll:", game.getBankroll());

const round = game.startRound(10);
if (!round.betAccepted) {
  console.log("Bet rejected. Bankroll:", game.getBankroll());
  process.exit(0);
}

console.log(`Round started. Max attempts: ${round.maxAttempts}`);

try {
  const firstGuess = game.makeGuess("crane");
  console.log("Guess 1 result:", firstGuess);

  const secondGuess = game.makeGuess("apple");
  console.log("Guess 2 result:", secondGuess);
} catch (error) {
  console.error("Error during round:", (error as Error).message);
}
