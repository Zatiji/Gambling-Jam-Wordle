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
    <div id="shop-modal">
      <div className="modal-content">
        {scannerMode ? (
          <>
            <h2>SCANNER</h2>
            <p>Entre une voyelle (A, E, I, O, U, Y)</p>
            <form className="scanner-form" onSubmit={handleScannerSubmit}>
              <input
                className="scanner-input"
                type="text"
                value={scannerInput}
                onChange={(e) => setScannerInput(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 1))}
                maxLength={1}
                autoFocus
              />
              <button type="submit" className="scanner-submit">VALIDER</button>
            </form>
            <button className="close-shop" onClick={onClose}>FERMER</button>
          </>
        ) : (
          <>
            <h2>SHOP</h2>
            <p>Achetez des indices ici...</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
              <button 
                style={{ border: '1px solid #fff', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                onClick={handleScannerClick}
              >
                SCANNER ({costs.LEVEL_1}$)
              </button>
              <button 
                style={{ border: '1px solid #fff', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                onClick={() => {
                  onPurchase('lucky_shot', costs.LEVEL_2);
                  onClose();
                }}
              >
                SNIPER ({costs.LEVEL_2}$)
              </button>
              <button 
                style={{
                  border: '1px solid #fff',
                  padding: '10px',
                  background: 'transparent',
                  color: '#fff',
                  cursor: extraLifeAvailable ? 'pointer' : 'not-allowed',
                  opacity: extraLifeAvailable ? 1 : 0.4,
                }}
                onClick={() => {
                  onPurchase('extra_life', costs.LEVEL_3);
                  onClose();
                }}
                disabled={!extraLifeAvailable}
              >
                EXTRA LIFE ({costs.LEVEL_3}$)
              </button>
            </div>
            <button className="close-shop" onClick={onClose}>FERMER</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopModal;
