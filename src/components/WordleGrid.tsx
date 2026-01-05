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
  twitchTile?: { row: number; col: number; key: number } | null;
  revealTile?: { row: number; col: number; key: number } | null;
}

const WordleGrid: React.FC<WordleGridProps> = ({ guesses, maxAttempts, bonusRowIndex, twitchTile, revealTile }) => {
  const rows = Array.from({ length: maxAttempts });

  return (
    <div className="game-grid">
      {rows.map((_, rowIndex) => (
        <div className={`row ${bonusRowIndex === rowIndex ? 'bonus' : ''}`} key={rowIndex}>
          {Array.from({ length: 5 }).map((_, colIndex) => {
            const tile = guesses[rowIndex]?.[colIndex];
            const isTwitch = twitchTile?.row === rowIndex && twitchTile?.col === colIndex;
            const isReveal = revealTile?.row === rowIndex && revealTile?.col === colIndex;
            return (
              <div 
                className={`tile ${tile?.status || ''} ${isTwitch ? 'twitch' : ''} ${isReveal ? 'reveal' : ''}`} 
                key={
                  isReveal
                    ? `${colIndex}-reveal-${revealTile?.key ?? 0}`
                    : isTwitch
                      ? `${colIndex}-twitch-${twitchTile?.key ?? 0}`
                      : colIndex
                }
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
