import React from 'react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (type: 'scanner' | 'lucky_shot' | 'extra_life', cost: number) => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onPurchase }) => {
  if (!isOpen) return null;

  return (
    <div id="shop-modal">
      <div className="modal-content">
        <h2>SHOP</h2>
        <p>Achetez des indices ici...</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
          <button 
            style={{ border: '1px solid #fff', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
            onClick={() => onPurchase('scanner', 5)}
          >
            SCANNER (5$)
          </button>
          <button 
            style={{ border: '1px solid #fff', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
            onClick={() => onPurchase('lucky_shot', 15)}
          >
            SNIPER (15$)
          </button>
          <button 
            style={{ border: '1px solid #fff', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
            onClick={() => onPurchase('extra_life', 25)}
          >
            EXTRA LIFE (25$)
          </button>
        </div>
        <button className="close-shop" onClick={onClose}>FERMER</button>
      </div>
    </div>
  );
};

export default ShopModal;
