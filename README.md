# Gambling Jam Wordle

A high-stakes Wordle variant built for the Gambling Jam. The game pairs classic word guessing with a wallet-backed betting loop, power-ups, and a deferred settlement transaction model.

## Architecture & Design

This project is built with TypeScript + React. The app is organized around a UI flow (home -> game -> results) and a core game manager that coordinates logic, economy, and API calls.

### Key Modules

- `GameManager` (orchestrator): Starts rounds, validates bets, handles guesses, and triggers final settlement.
- `WordleEngine` (logic): Pure word validation, letter comparison, and win/loss states.
- `EconomySystem` (accounting): Tracks bet, power-up costs, payouts, and net result.
- `GamblingApi` (infrastructure): Wallet lookup and money exchange with the Gambling Jam API.
- Power-ups (strategy): `Scanner`, `Lucky Shot`, `Extra Life`.

### UI Flow

- `HomeScreen`: user key, bet amount, API mode selection.
- `GameScreen`: gameplay, power-up shop, live stats, and result modal.
- `ResultModal`: shows outcome, totals, and settlement message.

## Game Flow (Deferred Settlement)

To minimize API calls, money is settled once per round.

1. Start round:
   - User enters key + bet.
   - API wallet balance is checked (`GET /portefeuille`).
   - If valid, the round starts and the bet is recorded locally.
2. During play:
   - Power-ups add to local costs (no immediate API call).
3. End of round:
   - Net result = winnings - (bet + power-ups).
   - A single transfer is executed via `POST /echangerArgent`.

## API Modes

The UI supports three runtime modes:

- Mock: all API calls are mocked.
- Hybrid: real wallet reads, mocked money transfers.
- Live: full API integration.

## Configuration

Runtime game tuning lives in `src/data/GameConfig.ts`:
- Bet limits
- Payout multipliers
- Power-up costs and tiers

Game keys:
- Web: `VITE_GAME_KEY` (Vite env)
- CLI: `GAME_KEY` (node env)

## Setup

Prerequisites:
- Node.js (v18+)
- A valid Game Key from the Gambling Jam API (for live mode)

Install:

```bash
npm install
```

## Scripts

```bash
# Web UI
npm run dev
npm run build
npm run preview

# CLI
npm run build:cli
npm run start:cli

# Lint
npm run lint
```

## CLI Usage

The CLI runs a single round in the terminal and supports power-up commands.

```bash
# Live API (requires GAME_KEY)
GAME_KEY=YOUR_KEY npm run start:cli

# Mock API
GAME_KEY=TEST_KEY npm run start:cli -- --mock
```

Power-up inputs:
- `scanner` -> prompts for a vowel
- `lucky` -> Lucky Shot
- `life` -> Extra Life
