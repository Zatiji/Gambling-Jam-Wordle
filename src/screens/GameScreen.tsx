import React, { useEffect, useCallback, useReducer } from 'react';
import StatsPanel from '../components/StatsPanel';
import WordleGrid, { TileData, LetterStatus } from '../components/WordleGrid';
import VirtualKeyboard from '../components/VirtualKeyboard';
import ShopModal from '../components/ShopModal';
import { GAME_CONFIG } from '../data/GameConfig';
import type GameManager from '../logic/GameManager';

interface GameScreenProps {
  userKey: string;
  bet: number;
  maxAttempts: number;
  gameManager: GameManager;
  onReset: () => void;
}

type GameStatus = 'playing' | 'won' | 'lost';

interface GameScreenState {
  guesses: TileData[][];
  currentGuess: string;
  isShopOpen: boolean;
  balance: number;
  status: GameStatus;
  message: string;
}

type GameScreenAction =
  | { type: 'set_balance'; balance: number }
  | { type: 'set_message'; message: string }
  | { type: 'set_current_guess'; guess: string }
  | { type: 'append_guess'; guess: TileData[] }
  | { type: 'set_status'; status: GameStatus }
  | { type: 'open_shop' }
  | { type: 'close_shop' };

const initialState: GameScreenState = {
  guesses: [],
  currentGuess: '',
  isShopOpen: false,
  balance: 0,
  status: 'playing',
  message: '',
};

function gameScreenReducer(state: GameScreenState, action: GameScreenAction): GameScreenState {
  switch (action.type) {
    case 'set_balance':
      return { ...state, balance: action.balance };
    case 'set_message':
      return { ...state, message: action.message };
    case 'set_current_guess':
      return { ...state, currentGuess: action.guess };
    case 'append_guess':
      return {
        ...state,
        guesses: [...state.guesses, action.guess],
        currentGuess: '',
      };
    case 'set_status':
      return { ...state, status: action.status };
    case 'open_shop':
      return { ...state, isShopOpen: true };
    case 'close_shop':
      return { ...state, isShopOpen: false };
    default:
      return state;
  }
}

const GameScreen: React.FC<GameScreenProps> = ({ userKey, bet, maxAttempts, gameManager, onReset }) => {
  const [state, dispatch] = useReducer(gameScreenReducer, initialState);

  // Fetch balance initially
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const bal = await gameManager.getUserBalance(userKey);
        dispatch({ type: 'set_balance', balance: bal });
      } catch (e) {
        console.error("Failed to fetch balance", e);
      }
    };
    fetchBalance();
  }, [userKey]);

  const handleKeyPress = useCallback(async (key: string) => {
    if (state.status !== 'playing') return;

    if (key === 'ENTER') {
      if (state.currentGuess.length !== 5) {
        dispatch({ type: 'set_message', message: "Le mot doit faire 5 lettres !" });
        return;
      }

      try {
        const result = await gameManager.makeGuess(state.currentGuess.toLowerCase());
        
        // Transform backend results to UI format
        const newGuess: TileData[] = result.letters.map(l => ({
          letter: l.letter.toUpperCase(),
          status: l.status as LetterStatus
        }));

        dispatch({ type: 'append_guess', guess: newGuess });
        dispatch({ type: 'set_status', status: result.status as GameStatus });

        if (result.status !== 'playing') {
          dispatch({
            type: 'set_message',
            message: result.transactionMessage || `Partie terminée: ${result.status}`
          });
        }
      } catch (e) {
        dispatch({ type: 'set_message', message: (e as Error).message });
      }
    } else if (key === 'DEL') {
      dispatch({ type: 'set_current_guess', guess: state.currentGuess.slice(0, -1) });
    } else if (/^[A-Z]$/.test(key)) {
      if (state.currentGuess.length < 5) {
        dispatch({ type: 'set_current_guess', guess: state.currentGuess + key });
      }
    }
  }, [state.currentGuess, state.status]);

  // Listen to physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKeyPress('ENTER');
      else if (key === 'BACKSPACE') handleKeyPress('DEL');
      else if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const handlePurchase = (type: 'scanner' | 'lucky_shot' | 'extra_life', cost: number) => {
    try {
      const tier = GAME_CONFIG.POWERUPS.TIERS[type];
      const expectedCost = GAME_CONFIG.POWERUPS.COSTS[tier];
      if (cost !== expectedCost) {
        dispatch({ type: 'set_message', message: "Coût invalide pour ce bonus." });
        return;
      }

      const result = gameManager.purchasePowerUp(type, cost, state.currentGuess.toLowerCase());
      if (result.success) {
        dispatch({ type: 'set_message', message: `Bonus utilisé: ${result.info}` });
        dispatch({ type: 'set_balance', balance: state.balance - cost });
        // Special case for extra life: update grid/attempts if needed?
        // Actually the backend engine handles maxAttempts.
      } else {
        dispatch({ type: 'set_message', message: `Échec: ${result.info}` });
      }
    } catch (e) {
      dispatch({ type: 'set_message', message: (e as Error).message });
    }
  };

  // Prepare the grid data (previous guesses + current guess)
  const displayGuesses = [...state.guesses];
  if (state.status === 'playing' && state.currentGuess.length > 0) {
    const currentTyped: TileData[] = state.currentGuess.split('').map(char => ({
      letter: char,
      status: 'empty'
    }));
    displayGuesses.push(currentTyped);
  }

  const letterStatuses: Record<string, LetterStatus> = {};
  const statusPriority: Record<LetterStatus, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    empty: 0,
  };

  state.guesses.forEach((guess) => {
    guess.forEach((tile) => {
      const key = tile.letter.toUpperCase();
      const current = letterStatuses[key];
      if (!current || statusPriority[tile.status] > statusPriority[current]) {
        letterStatuses[key] = tile.status;
      }
    });
  });

  // Get current multiplier
  const attemptCount = state.guesses.length + 1;
  const multiplier = gameManager.getPayoutMultiplier(attemptCount);

  return (
    <div id="game-screen">
      <StatsPanel 
        bet={bet} 
        balance={state.balance} 
        multiplier={multiplier} 
        onOpenShop={() => dispatch({ type: 'open_shop' })} 
      />

      <div className="right-panel">
        <div style={{ color: 'var(--neon-blue)', marginBottom: '10px', height: '20px' }}>
          {state.message}
        </div>
        
        <WordleGrid guesses={displayGuesses} maxAttempts={maxAttempts} />

        <div style={{ marginTop: '20px' }}>
          <VirtualKeyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
        </div>
      </div>

      <ShopModal 
        isOpen={state.isShopOpen} 
        onClose={() => dispatch({ type: 'close_shop' })} 
        onPurchase={handlePurchase} 
      />

      <button 
        onClick={onReset} 
        style={{ position: 'absolute', bottom: '10px', right: '10px', opacity: 0.5, background: 'none', border: '1px solid #444', color: '#fff', cursor: 'pointer' }}
      >
        [RETOUR]
      </button>
    </div>
  );
};

export default GameScreen;
