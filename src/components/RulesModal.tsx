import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div id="rules-modal" role="dialog" aria-modal="true" aria-label="Rules">
      <div className="rules-panel">
        <div className="rules-title">RULES</div>
        <ul className="rules-list">
          <li>Si tu découvres le mot du premier coup sans power-ups, c'est le JACKPOT. Utiliser un pouvoir au premier tour réduit le multiplicatif.</li>
          <li>Applique les mêmes règles que Wordle (si tu ne sais pas ce que c'est, cherche sur Google, c'est simple).</li>
          <li>Contrairement à Wordle, ici tu es sur un timer à chaque essai. Ne prends pas trop de temps, sinon le jeu fera un guess pour toi (et il est très mauvais).</li>
          <li>À chaque essai, le multiplicatif diminue, donc fais attention.</li>
          <li>Les mots sont en anglais sauf pour un seul...</li>
        </ul>
        <div className="rules-signoff">_ Amusez-vous bien !</div>
        <button className="btn-main btn-main-shop rules-action" onClick={onConfirm}>
          JOUER
        </button>
      </div>
    </div>
  );
};

export default RulesModal;
