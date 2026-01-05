import React from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress }) => {
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
              className={`key ${key.length > 1 ? 'wide' : ''}`} 
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
