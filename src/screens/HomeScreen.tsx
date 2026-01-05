import React, { useState } from 'react';

interface HomeScreenProps {
  onPlay: (userKey: string, betAmount: number) => void;
  apiMode: 'mock' | 'hybrid' | 'live';
  onModeChange: (mode: 'mock' | 'hybrid' | 'live') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, apiMode, onModeChange }) => {
  const [userKey, setUserKey] = useState('');
  const [betAmount, setBetAmount] = useState(10);

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
      
      <div className="input-group">
        <label>CLÉ UTILISATEUR</label>
        <input 
          type="text" 
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
        <select
          value={apiMode}
          onChange={(e) => onModeChange(e.target.value as 'mock' | 'hybrid' | 'live')}
        >
          <option value="mock">Mock (tout simulé)</option>
          <option value="hybrid">Hybride (solde réel, transaction mock)</option>
          <option value="live">Live (API réelle)</option>
        </select>
      </div>

      <button className="btn-main" onClick={handlePlay}>JOUER</button>
    </div>
  );
};

export default HomeScreen;
