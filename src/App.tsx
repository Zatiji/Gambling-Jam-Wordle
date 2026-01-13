import React, { useState } from 'react';
import CRTContainer from './layout/CRTContainer';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import { createGameManager } from './services/createGameManager';
import type GameManager from './logic/GameManager';
import RulesModal from './components/RulesModal';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [userKey, setUserKey] = useState('');
  const [betAmount, setBetAmount] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(4);
  const [apiMode, setApiMode] = useState<'mock' | 'hybrid' | 'live'>('hybrid');
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [pendingSession, setPendingSession] = useState<{
    manager: GameManager;
    userKey: string;
    betAmount: number;
    maxAttempts: number;
  } | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const gameKey = import.meta.env.VITE_GAME_KEY || "WEB_GAME_KEY";

  const buildGameManager = (mode: 'mock' | 'hybrid' | 'live'): GameManager => {
    if (mode === 'mock') {
      return createGameManager({ gameKey, useMockApi: true });
    }
    if (mode === 'hybrid') {
      return createGameManager({ gameKey, mockTransactionsOnly: true });
    }
    return createGameManager({ gameKey });
  };

  const handleStartGame = async (key: string, bet: number) => {
    try {
      const manager = buildGameManager(apiMode);
      const result = await manager.startRound(key, bet);
      if (result.betAccepted) {
        setPendingSession({
          manager,
          userKey: key,
          betAmount: bet,
          maxAttempts: result.maxAttempts,
        });
        setIsRulesOpen(true);
      } else {
        alert("Erreur: " + result.message);
      }
    } catch (e) {
      alert("Erreur fatale: " + (e as Error).message);
    }
  };

  const handleReset = () => {
    setScreen('home');
  };

  const handleConfirmRules = () => {
    if (!pendingSession) return;
    setGameManager(pendingSession.manager);
    setUserKey(pendingSession.userKey);
    setBetAmount(pendingSession.betAmount);
    setMaxAttempts(pendingSession.maxAttempts);
    setScreen('game');
    setIsRulesOpen(false);
    setPendingSession(null);
  };

  return (
    <CRTContainer>
      <RulesModal isOpen={isRulesOpen} onConfirm={handleConfirmRules} />
      {screen === 'home' ? (
        <HomeScreen
          onPlay={handleStartGame}
          apiMode={apiMode}
          onModeChange={setApiMode}
          gameKey={gameKey}
        />
      ) : (
        gameManager ? (
          <GameScreen 
            userKey={userKey} 
            bet={betAmount} 
            maxAttempts={maxAttempts}
            gameManager={gameManager}
            onReset={handleReset} 
          />
        ) : (
          <HomeScreen
            onPlay={handleStartGame}
            apiMode={apiMode}
            onModeChange={setApiMode}
            gameKey={gameKey}
          />
        )
      )}
    </CRTContainer>
  );
};

export default App;
