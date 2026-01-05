import React, { useState, useEffect, useCallback } from 'react';
import StatsPanel from '../components/StatsPanel';
import WordleGrid, { TileData, LetterStatus } from '../components/WordleGrid';
import VirtualKeyboard from '../components/VirtualKeyboard';
import ShopModal from '../components/ShopModal';
import { gameManager } from '../services/gameInstance';

interface GameScreenProps {
  userKey: string;
  bet: number;
  maxAttempts: number;
  onReset: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ userKey, bet, maxAttempts, onReset }) => {
  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('');

  // Fetch balance initially
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Accessing private api property via cast for simplicity in this prototype
        // In a real app, we'd have a public method on gameManager
        const api = (gameManager as any).api;
        const bal = await api.getWallet("utilisateur", userKey);
        setBalance(bal);
      } catch (e) {
        console.error("Failed to fetch balance", e);
      }
    };
    fetchBalance();
  }, [userKey]);

  const handleKeyPress = useCallback(async (key: string) => {
    if (status !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage("Le mot doit faire 5 lettres !");
        return;
      }

      try {
        const result = await gameManager.makeGuess(currentGuess.toLowerCase());
        
        // Transform backend results to UI format
        const newGuess: TileData[] = result.letters.map(l => ({
          letter: l.letter.toUpperCase(),
          status: l.status as LetterStatus
        }));

        setGuesses(prev => [...prev, newGuess]);
        setCurrentGuess('');
        setStatus(result.status as any);

        if (result.status !== 'playing') {
          setMessage(result.transactionMessage || `Partie terminée: ${result.status}`);
        }
      } catch (e) {
        setMessage((e as Error).message);
      }
    } else if (key === 'DEL') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    }
  }, [currentGuess, status]);

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
      const result = gameManager.purchasePowerUp(type, cost, currentGuess.toLowerCase());
      if (result.success) {
        setMessage(`Bonus utilisé: ${result.info}`);
        setBalance(prev => prev - cost);
        // Special case for extra life: update grid/attempts if needed?
        // Actually the backend engine handles maxAttempts.
      } else {
        setMessage(`Échec: ${result.info}`);
      }
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  // Prepare the grid data (previous guesses + current guess)
  const displayGuesses = [...guesses];
  if (status === 'playing' && currentGuess.length > 0) {
    const currentTyped: TileData[] = currentGuess.split('').map(char => ({
      letter: char,
      status: 'empty'
    }));
    displayGuesses.push(currentTyped);
  }

  // Get current multiplier
  const attemptCount = guesses.length + 1;
  const multiplier = (gameManager as any).economy.calculatePayout(attemptCount);

  return (
    <div id="game-screen">
      <StatsPanel 
        bet={bet} 
        balance={balance} 
        multiplier={multiplier} 
        onOpenShop={() => setIsShopOpen(true)} 
      />

      <div className="right-panel">
        <div style={{ color: 'var(--neon-blue)', marginBottom: '10px', height: '20px' }}>
          {message}
        </div>
        
        <WordleGrid guesses={displayGuesses} maxAttempts={maxAttempts} />

        <div style={{ marginTop: '20px' }}>
          <VirtualKeyboard onKeyPress={handleKeyPress} />
        </div>
      </div>

      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
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
