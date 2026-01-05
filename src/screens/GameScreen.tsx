import React, { useEffect, useCallback, useReducer, useRef } from 'react';
import StatsPanel from '../components/StatsPanel';
import WordleGrid, { TileData, LetterStatus } from '../components/WordleGrid';
import VirtualKeyboard from '../components/VirtualKeyboard';
import ShopModal from '../components/ShopModal';
import ResultModal from '../components/ResultModal';
import { GAME_CONFIG } from '../data/GameConfig';
import type GameManager from '../logic/GameManager';
import type { PowerUpType } from '../logic/GameManager';

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
  extraLifeUsed: boolean;
  purchases: { type: PowerUpType; cost: number }[];
  scannerReveals: Record<string, LetterStatus>;
  twitchTile: { row: number; col: number; key: number } | null;
  revealTile: { row: number; col: number; key: number } | null;
  isRevealing: boolean;
  showResultModal: boolean;
  isJackpot: boolean;
  settlementMessage: string;
  isFinalizing: boolean;
  isSettled: boolean;
}

type GameScreenAction =
  | { type: 'set_balance'; balance: number }
  | { type: 'set_message'; message: string }
  | { type: 'set_current_guess'; guess: string }
  | { type: 'append_guess'; guess: TileData[] }
  | { type: 'set_status'; status: GameStatus }
  | { type: 'set_extra_life_used'; used: boolean }
  | { type: 'add_purchase'; purchase: { type: PowerUpType; cost: number } }
  | { type: 'set_scanner_reveal'; letter: string; status: LetterStatus }
  | { type: 'set_twitch_tile'; row: number; col: number }
  | { type: 'set_reveal_tile'; row: number; col: number }
  | { type: 'set_revealing'; isRevealing: boolean }
  | { type: 'set_tile_status'; row: number; col: number; status: LetterStatus }
  | { type: 'show_result_modal'; show: boolean }
  | { type: 'set_jackpot'; isJackpot: boolean }
  | { type: 'set_settlement_message'; message: string }
  | { type: 'set_finalizing'; isFinalizing: boolean }
  | { type: 'set_settled'; isSettled: boolean }
  | { type: 'open_shop' }
  | { type: 'close_shop' };

const initialState: GameScreenState = {
  guesses: [],
  currentGuess: '',
  isShopOpen: false,
  balance: 0,
  status: 'playing',
  message: '',
  extraLifeUsed: false,
  purchases: [],
  scannerReveals: {},
  twitchTile: null,
  revealTile: null,
  isRevealing: false,
  showResultModal: false,
  isJackpot: false,
  settlementMessage: '',
  isFinalizing: false,
  isSettled: false,
};

function triggerWinAnimation(rowElement: HTMLElement, isJackpot: boolean) {
  const tiles = Array.from(rowElement.children) as HTMLElement[];
  tiles.forEach((tile, index) => {
    tile.classList.remove('wave', 'jackpot-win');
    tile.style.animationDelay = `${index * 100}ms`;
    tile.classList.add(isJackpot ? 'jackpot-win' : 'wave');
  });
}

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
    case 'set_extra_life_used':
      return { ...state, extraLifeUsed: action.used };
    case 'add_purchase':
      return { ...state, purchases: [...state.purchases, action.purchase] };
    case 'set_scanner_reveal':
      return {
        ...state,
        scannerReveals: {
          ...state.scannerReveals,
          [action.letter]: action.status,
        },
      };
    case 'set_twitch_tile':
      return {
        ...state,
        twitchTile: {
          row: action.row,
          col: action.col,
          key: (state.twitchTile?.key ?? 0) + 1,
        },
      };
    case 'set_reveal_tile':
      return {
        ...state,
        revealTile: {
          row: action.row,
          col: action.col,
          key: (state.revealTile?.key ?? 0) + 1,
        },
      };
    case 'set_revealing':
      return { ...state, isRevealing: action.isRevealing };
    case 'set_tile_status':
      return {
        ...state,
        guesses: state.guesses.map((row, rowIndex) =>
          rowIndex === action.row
            ? row.map((tile, colIndex) =>
                colIndex === action.col ? { ...tile, status: action.status } : tile
              )
            : row
        ),
      };
    case 'show_result_modal':
      return { ...state, showResultModal: action.show };
    case 'set_jackpot':
      return { ...state, isJackpot: action.isJackpot };
    case 'set_settlement_message':
      return { ...state, settlementMessage: action.message };
    case 'set_finalizing':
      return { ...state, isFinalizing: action.isFinalizing };
    case 'set_settled':
      return { ...state, isSettled: action.isSettled };
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
  const gridRef = useRef<HTMLDivElement | null>(null);
  const winAnimationRef = useRef<{ rowIndex: number; isJackpot: boolean } | null>(null);
  const resultTimerRef = useRef<number | null>(null);
  const revealTimersRef = useRef<number[]>([]);

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
    if (state.status !== 'playing' || state.isRevealing) return;

    if (key === 'ENTER') {
      if (state.currentGuess.length !== 5) {
        dispatch({ type: 'set_message', message: "Le mot doit faire 5 lettres !" });
        return;
      }

      try {
        const result = await gameManager.makeGuess(state.currentGuess.toLowerCase());
        const rowIndex = state.guesses.length;
        const isJackpot = result.status === 'won' && rowIndex === 0;
        
        // Transform backend results to UI format
        const newGuess: TileData[] = result.letters.map(l => ({
          letter: l.letter.toUpperCase(),
          status: 'empty'
        }));

        dispatch({ type: 'append_guess', guess: newGuess });
        dispatch({ type: 'set_revealing', isRevealing: true });
        revealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        revealTimersRef.current = [];

        const revealDelay = 140;
        result.letters.forEach((letter, index) => {
          const timer = window.setTimeout(() => {
            dispatch({ type: 'set_reveal_tile', row: rowIndex, col: index });
            dispatch({ type: 'set_tile_status', row: rowIndex, col: index, status: letter.status as LetterStatus });
            if (index === result.letters.length - 1) {
              dispatch({ type: 'set_status', status: result.status as GameStatus });
              dispatch({ type: 'set_revealing', isRevealing: false });
              if (result.status !== 'playing') {
                dispatch({
                  type: 'set_message',
                  message: result.transactionMessage || `Partie terminée: ${result.status}`
                });
                if (result.status === 'won') {
                  winAnimationRef.current = { rowIndex, isJackpot };
                  dispatch({ type: 'set_jackpot', isJackpot });
                } else {
                  dispatch({ type: 'set_jackpot', isJackpot: false });
                }
              }
            }
          }, index * revealDelay);
          revealTimersRef.current.push(timer);
        });
      } catch (e) {
        dispatch({ type: 'set_message', message: (e as Error).message });
      }
    } else if (key === 'DEL') {
      dispatch({ type: 'set_current_guess', guess: state.currentGuess.slice(0, -1) });
    } else if (/^[A-Z]$/.test(key)) {
      if (state.currentGuess.length < 5) {
        dispatch({ type: 'set_twitch_tile', row: state.guesses.length, col: state.currentGuess.length });
        dispatch({ type: 'set_current_guess', guess: state.currentGuess + key });
      }
    }
  }, [state.currentGuess, state.status, state.isRevealing, state.guesses.length]);

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

  useEffect(() => {
    return () => {
      revealTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      revealTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'won' || !winAnimationRef.current) return;
    const { rowIndex, isJackpot } = winAnimationRef.current;
    const row = gridRef.current?.querySelectorAll('.row')[rowIndex] as HTMLElement | undefined;
    if (row) {
      triggerWinAnimation(row, isJackpot);
      winAnimationRef.current = null;
    }
  }, [state.status, state.guesses.length]);

  useEffect(() => {
    if (state.showResultModal) return;

    if (state.status === 'won') {
      const baseDuration = state.isJackpot ? 900 : 600;
      const staggerTotal = 100 * 4;
      const totalDelay = baseDuration + staggerTotal;
      if (resultTimerRef.current) {
        window.clearTimeout(resultTimerRef.current);
      }
      resultTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'show_result_modal', show: true });
      }, totalDelay);
    } else if (state.status === 'lost') {
      dispatch({ type: 'show_result_modal', show: true });
    }

    return () => {
      if (resultTimerRef.current) {
        window.clearTimeout(resultTimerRef.current);
        resultTimerRef.current = null;
      }
    };
  }, [state.status, state.isJackpot, state.showResultModal]);

  useEffect(() => {
    if (!state.showResultModal || state.isFinalizing || state.isSettled) return;
    const timer = window.setTimeout(() => {
      handleFinalize();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state.showResultModal, state.isFinalizing, state.isSettled]);

  const handlePurchase = (type: 'scanner' | 'lucky_shot' | 'extra_life', cost: number, input?: string) => {
    try {
      if (type === 'extra_life' && state.extraLifeUsed) {
        dispatch({ type: 'set_message', message: "Extra Life déjà utilisé pour cette partie." });
        return;
      }

      const tier = GAME_CONFIG.POWERUPS.TIERS[type];
      const expectedCost = GAME_CONFIG.POWERUPS.COSTS[tier];
      if (cost !== expectedCost) {
        dispatch({ type: 'set_message', message: "Coût invalide pour ce bonus." });
        return;
      }

      const normalizedInput = input ? input.trim().toUpperCase() : '';
      const result = gameManager.purchasePowerUp(
        type,
        cost,
        type === 'scanner' ? normalizedInput : state.currentGuess.toLowerCase()
      );
      if (result.success) {
        dispatch({ type: 'set_message', message: `Bonus utilisé: ${result.info}` });
        dispatch({ type: 'set_balance', balance: state.balance - cost });
        dispatch({ type: 'add_purchase', purchase: { type, cost } });
        if (type === 'extra_life') {
          dispatch({ type: 'set_extra_life_used', used: true });
        }
        if (type === 'scanner' && /^[A-Z]$/.test(normalizedInput)) {
          const target = gameManager.getTargetWord();
          if (target) {
            const status: LetterStatus = target.toUpperCase().includes(normalizedInput) ? 'present' : 'absent';
            dispatch({ type: 'set_scanner_reveal', letter: normalizedInput, status });
          }
        }
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

  const letterStatuses: Record<string, LetterStatus> = { ...state.scannerReveals };
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
  const displayMaxAttempts = state.extraLifeUsed ? maxAttempts + 1 : maxAttempts;
  const bonusRowIndex = state.extraLifeUsed ? displayMaxAttempts - 1 : undefined;
  const purchasesTotal = state.purchases.reduce((total, item) => total + item.cost, 0);
  const winMultiplier = state.status === 'won' ? gameManager.getPayoutMultiplier(state.guesses.length) : 0;
  const winAmount = state.status === 'won' ? bet * winMultiplier : 0;
  const totalCost = bet + purchasesTotal;
  const netTotal = winAmount - totalCost;
  const targetWord = gameManager.getTargetWord();

  const handleFinalize = async () => {
    if (state.isFinalizing || state.isSettled) return;
    dispatch({ type: 'set_finalizing', isFinalizing: true });
    try {
      const message = await gameManager.finalizeRound();
      dispatch({ type: 'set_settlement_message', message });
      dispatch({ type: 'set_settled', isSettled: true });
      const bal = await gameManager.getUserBalance(userKey);
      dispatch({ type: 'set_balance', balance: bal });
    } catch (e) {
      dispatch({ type: 'set_settlement_message', message: `Transaction failed: ${(e as Error).message}` });
    } finally {
      dispatch({ type: 'set_finalizing', isFinalizing: false });
    }
  };

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
        
        <div ref={gridRef}>
          <WordleGrid
            guesses={displayGuesses}
            maxAttempts={displayMaxAttempts}
            bonusRowIndex={bonusRowIndex}
            twitchTile={state.twitchTile}
            revealTile={state.revealTile}
          />
        </div>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <VirtualKeyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
        </div>
      </div>

      <ShopModal 
        isOpen={state.isShopOpen} 
        onClose={() => dispatch({ type: 'close_shop' })} 
        onPurchase={handlePurchase}
        extraLifeAvailable={!state.extraLifeUsed}
      />

      <ResultModal
        isOpen={state.showResultModal}
        status={state.status === 'won' ? 'won' : 'lost'}
        isJackpot={state.isJackpot}
        targetWord={targetWord}
        bet={bet}
        multiplier={winMultiplier}
        winAmount={winAmount}
        totalCost={totalCost}
        netTotal={netTotal}
        purchases={state.purchases}
        onFinalize={onReset}
        isFinalizing={state.isFinalizing}
        settlementMessage={state.settlementMessage}
        isSettled={state.isSettled}
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
