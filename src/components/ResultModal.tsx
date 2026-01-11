import React from 'react';
import type { PowerUpType } from '../logic/GameManager';

interface PurchaseItem {
  type: PowerUpType;
  cost: number;
}

interface ResultModalProps {
  isOpen: boolean;
  status: 'won' | 'lost';
  isJackpot: boolean;
  targetWord: string | null;
  bet: number;
  multiplier: number;
  winAmount: number;
  totalCost: number;
  netTotal: number;
  purchases: PurchaseItem[];
  onFinalize: () => void;
  isFinalizing: boolean;
  settlementMessage?: string;
}

const POWERUP_LABELS: Record<PowerUpType, string> = {
  scanner: 'Scanner',
  lucky_shot: 'Lucky Shot',
  extra_life: 'Extra Life',
};

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  status,
  isJackpot,
  targetWord,
  bet,
  multiplier,
  winAmount,
  totalCost,
  netTotal,
  purchases,
  onFinalize,
  isFinalizing,
  settlementMessage,
}) => {
  if (!isOpen) return null;

  const totalLabel = netTotal >= 0 ? `+$${netTotal.toFixed(2)}` : `-$${Math.abs(netTotal).toFixed(2)}`;
  const finalLabel = 'Retour écran titre';

  const contentClassName = [
    'result-content',
    status === 'won' ? 'result-win' : 'result-loss',
    isJackpot ? 'result-jackpot-bg' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="result-modal">
      <div className={contentClassName}>
        <div className="result-title">
          {status === 'won' ? 'GAGNÉ' : 'PERDU'}
        </div>
        {isJackpot && (
          <div className="result-jackpot">JACKPOT !!!!!</div>
        )}

        <div className="result-line">
          Mot: {targetWord ? targetWord.toUpperCase() : '-'}
        </div>
        <div className="result-line">Mise: ${bet.toFixed(2)}</div>
        <div className="result-line">Multiplicateur: x{multiplier.toFixed(2)}</div>
        <div className="result-line">Retour: ${winAmount.toFixed(2)}</div>
        <div className="result-line">Coûts totaux: ${totalCost.toFixed(2)}</div>

        <div className="result-section">
          <div className="result-section-title">Objets achetés</div>
          {purchases.length === 0 ? (
            <div className="result-muted">Aucun</div>
          ) : (
            <div className="result-purchases">
              {purchases.map((item, index) => (
                <div key={`${item.type}-${index}`} className="result-line">
                  {POWERUP_LABELS[item.type]}: -${item.cost.toFixed(2)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="result-total">{totalLabel}</div>

        {settlementMessage && (
          <div className="result-message">{settlementMessage}</div>
        )}

        <button
          className="result-action"
          onClick={onFinalize}
          disabled={isFinalizing}
        >
          {isFinalizing ? 'Traitement...' : finalLabel}
        </button>
      </div>
    </div>
  );
};

export default ResultModal;
