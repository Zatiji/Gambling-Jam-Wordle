# Gambling Jam Wordle

A high-stakes Wordle variant built for the Gambling Jam. This project combines the classic word-guessing game with a persistent economy system where players bet real (simulated) currency on their performance.

## Architecture & Design

This project is built with **TypeScript** and trieed its beast to be clean coded. (Its not that pretty for now)

### Key Components

- **`GameManager` (Orchestrator-ish):** The central hub that coordinates the game. It uses Dependency Injection (DIP) to remain decoupled from specific implementations.
- **`WordleEngine` (Logic):** A pure logic engine handling word validation, letter comparisons, and win/loss states. It knows nothing about money.
- **`EconomySystem` (Accounting):** Tracks the session's financial state (bets placed, power-ups purchased, winnings). It calculates the "Net Result" at the end of a game.
- **`GamblingApi` (Infrastructure):** A service dedicated to communicating with the external `api.gamblingjamaeglo.dev`. It handles the real money transactions.
- **Power-Ups (Strategy Pattern):**
  - **Scanner:** Checks for vowel presence.
  - **Lucky Shot:** Gambles on revealing a random letter (risk/reward).
  - **Extra Life:** Buys an additional attempt.

---

## Game Flow & API Workflow

To ensure fairness and stability, transactions are processed using a **"Deferred Settlement"** model.

1.  **Start Round (User Key + Betting):**
    - The player enters their **User Key** (required).
    - The player chooses a bet amount (e.g., $100).
    - **API Check:** The game checks the user's wallet balance via `GET /portefeuille`.
    - If funds are sufficient, the game starts. **No money is taken yet.**
    - *Local State:* The economy system records a "debt" of $100.

2.  **Gameplay & Power-Ups:**
    - The player guesses words.
    - **Buying Power-Ups:** If a player buys a hint ($50), the cost is added to their local debt. No API call is made instantly.

3.  **End of Game (Settlement):**
    - The game calculates the **Net Result**: `(Winnings - Total Bets - Total PowerUp Costs)`.
    - **If Net Result > 0 (Profit):** The **Game pays the User** via `POST /echangerArgent`.
    - **If Net Result < 0 (Loss):** The **User pays the Game** via `POST /echangerArgent`.
    - **If Net Result = 0:** No transaction is made.

This approach minimizes API calls to **one per game**, reducing latency and the risk of partial failures.

---

## 🛠 Setup & Configuration

### Prerequisites
- Node.js (v18+)
- A valid Game Key from the Gambling Jam API.

### Installation

```bash
npm install
```

### Configuration
Edit `src/data/GameConfig.ts` to adjust:
- Minimum/Maximum bets.
- Payout multipliers.
- Power-up costs.

### Running the CLI
To test the game logic in your terminal:

```bash
# Run the CLI
npm run build
npm start # to test the game with real keys

npm start --mock # To test the game in dev mode
```

*Note: The CLI prompts for a User Key and bet amount before each round.*
