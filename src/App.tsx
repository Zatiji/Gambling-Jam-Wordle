import React, { useState } from 'react';
import CRTContainer from './layout/CRTContainer';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import { gameManager } from './services/gameInstance';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [userKey, setUserKey] = useState('');
  const [betAmount, setBetAmount] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(4);

  const handleStartGame = async (key: string, bet: number) => {
    try {
      const result = await gameManager.startRound(key, bet);
      if (result.betAccepted) {
        setUserKey(key);
        setBetAmount(bet);
        setMaxAttempts(result.maxAttempts);
        setScreen('game');
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

  return (
    <CRTContainer>
      {screen === 'home' ? (
        <HomeScreen onPlay={handleStartGame} />
      ) : (
        <GameScreen 
          userKey={userKey} 
          bet={betAmount} 
          maxAttempts={maxAttempts}
          onReset={handleReset} 
        />
      )}
    </CRTContainer>
  );
};

export default App;
