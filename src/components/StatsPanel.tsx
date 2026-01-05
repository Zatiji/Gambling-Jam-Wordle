import React from 'react';

interface StatsPanelProps {
  bet: number;
  balance: number;
  multiplier: number;
  onOpenShop: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ bet, balance, multiplier, onOpenShop }) => {
  return (
    <div className="left-panel">
      <div className="stat-box">
        <span className="stat-label">MISE</span>
        <div className="stat-value">{bet}$</div>
      </div>
      <div className="stat-box">
        <span className="stat-label">BANKROLL</span>
        <div className="stat-value money">{balance}$</div>
      </div>
      <div className="stat-box">
        <span className="stat-label">MULT</span>
        <div className="stat-value multi">x{multiplier}</div>
      </div>

      <div className="shop-btn-container">
        <button id="btn-shop" onClick={onOpenShop}>SHOP</button>
      </div>
    </div>
  );
};

export default StatsPanel;
