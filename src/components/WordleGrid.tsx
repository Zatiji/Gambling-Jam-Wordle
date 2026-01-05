import React from 'react';

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface TileData {
  letter: string;
  status: LetterStatus;
}

interface WordleGridProps {
  guesses: TileData[][];
  maxAttempts: number;
  bonusRowIndex?: number;
}

const WordleGrid: React.FC<WordleGridProps> = ({ guesses, maxAttempts, bonusRowIndex }) => {
  const rows = Array.from({ length: maxAttempts });

  return (
    <div className="game-grid">
      {rows.map((_, rowIndex) => (
        <div className={`row ${bonusRowIndex === rowIndex ? 'bonus' : ''}`} key={rowIndex}>
          {Array.from({ length: 5 }).map((_, colIndex) => {
            const tile = guesses[rowIndex]?.[colIndex];
            return (
              <div 
                className={`tile ${tile?.status || ''}`} 
                key={colIndex}
              >
                {tile?.letter || ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WordleGrid;
