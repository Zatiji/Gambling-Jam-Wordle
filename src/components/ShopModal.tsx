import React, { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../data/GameConfig';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (type: 'scanner' | 'lucky_shot' | 'extra_life', cost: number, input?: string) => void;
  extraLifeAvailable: boolean;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onPurchase, extraLifeAvailable }) => {
  if (!isOpen) return null;

  const costs = GAME_CONFIG.POWERUPS.COSTS;
  const [scannerMode, setScannerMode] = useState(false);
  const [scannerInput, setScannerInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setScannerMode(false);
      setScannerInput('');
    }
  }, [isOpen]);

  const handleScannerClick = () => {
    setScannerMode(true);
    setScannerInput('');
  };

  const handleScannerSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = scannerInput.trim().toUpperCase();
    if (!value) return;
    onPurchase('scanner', costs.LEVEL_1, value);
    onClose();
  };

  return (
    <div id="shop-modal" role="dialog" aria-modal="true">
      <div className="shop-panel">
        <div className="shop-sign" aria-label="Shop title">
          <div className="shop-sign-inner">
            <span className="shop-sign-text">SHOP</span>
          </div>
        </div>

        {scannerMode ? (
          <div className="shop-body">
            <div className="shop-subtitle">SCANNER</div>
            <div className="shop-hint">Entre une voyelle (A, E, I, O, U, Y)</div>

            <form className="scanner-form shop-scanner" onSubmit={handleScannerSubmit}>
              <input
                className="scanner-input"
                type="text"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 1))}
                maxLength={1}
                autoFocus
              />
              <button type="submit" className="shop-buy-btn scanner-submit">VALIDER</button>
            </form>

            <button className="close-shop shop-close" onClick={onClose}>
              FERMER
            </button>
          </div>
        ) : (
          <div className="shop-body">

            <div className="shop-list">
              <div className="shop-row">
                <div className="shop-item">
                  <span className="shop-item-name">SCANNER</span>
                  <div className="shop-tooltip" role="tooltip">
                    Scanne une voyelle et indique si elle est dans le mot.
                  </div>
                  <span className="shop-item-price">- {costs.LEVEL_1}$</span>
                </div>
                <button className="shop-buy-btn" onClick={handleScannerClick}>
                  BUY
                </button>
              </div>

              <div className="shop-row">
                <div className="shop-item">
                  <span className="shop-item-name">LUCKY SHOT</span>
                  <div className="shop-tooltip" role="tooltip">
                    Revele une lettre a une position aleatoire du mot.
                  </div>
                  <span className="shop-item-price">- {costs.LEVEL_2}$</span>
                </div>
                <button
                  className="shop-buy-btn"
                  onClick={() => {
                    onPurchase('lucky_shot', costs.LEVEL_2);
                    onClose();
                  }}
                >
                  BUY
                </button>
              </div>

              <div className="shop-row">
                <div className="shop-item">
                  <span className="shop-item-name">EXTRA LIFE</span>
                  <div className="shop-tooltip" role="tooltip">
                    Ajoute une tentative supplementaire pour cette partie.
                  </div>
                  <span className="shop-item-price">- {costs.LEVEL_3}$</span>
                </div>
                <button
                  className={`shop-buy-btn ${!extraLifeAvailable ? 'is-disabled' : ''}`}
                  onClick={() => {
                    onPurchase('extra_life', costs.LEVEL_3);
                    onClose();
                  }}
                  disabled={!extraLifeAvailable}
                  aria-disabled={!extraLifeAvailable}
                >
                  BUY
                </button>
              </div>
            </div>

            <button className="close-shop shop-close" onClick={onClose}>
              FERMER
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopModal;
