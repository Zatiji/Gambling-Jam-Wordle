import React, { useEffect, useState } from 'react';
import GamblingApi from '../services/GamblingApi';

interface HomeScreenProps {
  onPlay: (userKey: string, betAmount: number) => void;
  apiMode: 'mock' | 'hybrid' | 'live';
  onModeChange: (mode: 'mock' | 'hybrid' | 'live') => void;
  gameKey: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, apiMode, onModeChange, gameKey }) => {
  const [userKey, setUserKey] = useState('');
  const [betAmount, setBetAmount] = useState(25);
  const [isGameBroke, setIsGameBroke] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const checkGameBalance = async () => {
    if (!gameKey) {
      return;
    }
    setIsCheckingBalance(true);
    try {
      const api = new GamblingApi(gameKey);
      const balance = await api.getWallet('jeu', gameKey);
      setIsGameBroke(balance === 0);
    } catch {
      // Ignore balance check errors on the home screen.
    } finally {
      setIsCheckingBalance(false);
    }
  };

  useEffect(() => {
    checkGameBalance();
  }, [gameKey]);

  const handlePlay = () => {
    if (!userKey || betAmount <= 0) {
      alert("Wsh, remplis les infos !");
      return;
    }
    onPlay(userKey, betAmount);
  };

  return (
    <div id="home-screen">
      <h1 className="title">SPELL or BUST</h1>
      {isGameBroke ? (
        <>
          <div className="game-broke">Le jeu est en faillite (Le jeu a 0 $)</div>
          <button
            className="btn-main btn-main-shop"
            onClick={checkGameBalance}
            disabled={isCheckingBalance}
          >
            {isCheckingBalance ? 'Vérification...' : 'Réessayer'}
          </button>
        </>
      ) : (
        <>
          <div className="input-group">
            <label>CLÉ UTILISATEUR</label>
            <input 
              type="password" 
              value={userKey} 
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="Ex: USER_123" 
            />
          </div>

          <div className="input-group">
            <label>MISE ($)</label>
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="input-group">
            <label>MODE API</label>
            <div className="api-mode-grid">
              <button
                type="button"
                className={`api-mode-tile ${apiMode === 'mock' ? 'active' : ''}`}
                onClick={() => onModeChange('mock')}
              >
                Mock
                <span>tout simulé</span>
              </button>
              <button
                type="button"
                className={`api-mode-tile ${apiMode === 'hybrid' ? 'active' : ''}`}
                onClick={() => onModeChange('hybrid')}
              >
                Hybride
                <span>solde réel, transaction mock</span>
              </button>
              <button
                type="button"
                className={`api-mode-tile ${apiMode === 'live' ? 'active' : ''}`}
                onClick={() => onModeChange('live')}
              >
                Live
                <span>API réelle</span>
              </button>
            </div>
          </div>

          <button className="btn-main btn-main-shop" onClick={handlePlay}>JOUER</button>
        </>
      )}
    </div>
  );
};

export default HomeScreen;
