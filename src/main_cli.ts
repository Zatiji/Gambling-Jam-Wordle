import * as readline from 'readline';
import GameManager, { PowerUpType } from './logic/GameManager.js';
import WordleEngine from './logic/WordleEngine.js';
import EconomySystem from './logic/EconomySystem.js';
import GamblingApi from './services/GamblingApi.js';
import MockGamblingApi from './services/MockGamblingApi.js'; // Import Mock
import { getRandomWord } from './data/dictionary.js';
import { LuckyShotPowerUp } from './logic/powerups/LuckyShotPowerUp.js';
import { ScannerPowerUp } from './logic/powerups/ScannerPowerUp.js';
import { ExtraLifePowerUp } from './logic/powerups/ExtraLifePowerUp.js';
import { InterfacePowerUp } from './logic/powerups/InterfacePowerUp.js';


const GAME_KEY = process.env.GAME_KEY || "TEST_GAME_KEY"; 
const useMock = process.argv.includes('--mock');

const economy = new EconomySystem(); 
const engine = new WordleEngine();

let api: GamblingApi;

if (useMock) {
    console.log("\x1b[33m[WARNING] RUNNING IN MOCK MODE. NO REAL MONEY WILL BE EXCHANGED.\x1b[0m");
    api = new MockGamblingApi(GAME_KEY);
} else {
    api = new GamblingApi(GAME_KEY);
}

const powerUps = new Map<PowerUpType, InterfacePowerUp>();
powerUps.set("scanner", new ScannerPowerUp());
powerUps.set("lucky_shot", new LuckyShotPowerUp());
powerUps.set("extra_life", new ExtraLifePowerUp());

const game = new GameManager(
    economy, 
    engine, 
    getRandomWord, 
    powerUps, 
    api
);


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer));
  });
}

async function promptForUserKey(): Promise<string> {
  while (true) {
    const input = (await ask("Enter user key: ")).trim();
    if (input.length > 0) {
      return input;
    }
    console.log("User key is required.");
  }
}

async function promptForBetAmount(): Promise<number> {
  while (true) {
    const input = (await ask("Enter bet amount: ")).trim();
    const amount = Number(input);
    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
    console.log("Bet amount must be a positive number.");
  }
}

async function main() {
  console.log("=== GAMBLING JAM WORDLE CLI ===");
  console.log(`Game Key: ${GAME_KEY}`);
  console.log(`Mode: ${useMock ? 'MOCK' : 'LIVE'}`);

  
  const userKey = await promptForUserKey();
  const betAmount = await promptForBetAmount();
  console.log(`\nStarting round with ${betAmount}$ bet...`);
  const startResult = await game.startRound(userKey, betAmount);

  if (!startResult.betAccepted) {
    console.error("Failed to start round:", startResult.message);
    console.log("Exiting due to initialization failure.");
    process.exit(1);
  }

  console.log("Round started! Guess the 5-letter word.");
  console.log(`Attempts remaining: ${startResult.maxAttempts}`);

  askGuess();
}

function askGuess() {
  rl.question('\nEnter guess (or "scanner", "lucky", "life"): ', async (input) => {
    const term = input.trim();

    // Handle PowerUps
    if (term === "scanner") {
        rl.question("Which vowel? ", (vowel) => {
            const res = game.purchasePowerUp("scanner", 50, vowel);
            console.log("POWER-UP:", res.info);
            askGuess();
        });
        return;
    }
    if (term === "lucky") {
        const res = game.purchasePowerUp("lucky_shot", 100);
        console.log("POWER-UP:", res.info);
        askGuess();
        return;
    }
    if (term === "life") {
        const res = game.purchasePowerUp("extra_life", 200);
        console.log("POWER-UP:", res.info);
        askGuess();
        return;
    }

    // Handle Guess
    try {
        const result = await game.makeGuess(term);
        
        // Display result
        console.log("Result:", result.letters.map(l => `${l.letter}(${l.status})`).join(" "));
        
        if (result.status !== "playing") {
            console.log(`\nGAME OVER: ${result.status.toUpperCase()}`);
            if (result.transactionMessage) {
                console.log(`TRANSACTION: ${result.transactionMessage}`);
            }
            rl.close();
        } else {
            askGuess();
        }
    } catch (e) {
        console.log("Error:", (e as Error).message);
        askGuess();
    }
  });
}

main();
