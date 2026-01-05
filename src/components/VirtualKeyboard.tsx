import React from 'react';
import type { LetterStatus } from './WordleGrid';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: Record<string, LetterStatus | undefined>;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, letterStatuses }) => {
  const rows = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'DEL']
  ];

  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div className="key-row" key={i}>
          {row.map((key) => (
            <div 
              className={`key ${key.length > 1 ? 'wide' : ''} ${letterStatuses[key] || ''}`} 
              key={key}
              onClick={() => onKeyPress(key)}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
