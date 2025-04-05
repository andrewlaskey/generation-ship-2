import { BoardSpace } from '@/modules/BoardSpace';
import { GameBoard } from '@/modules/GameBoard';
import { getTileCellClassList } from '@/utils/getTileCellClassList';
import React from 'react';

interface GameBoardGridProps {
  gameBoard: GameBoard;
  handleCellClick: (x: number, y: number) => void;
}

const GameBoardGrid: React.FC<GameBoardGridProps> = ({ gameBoard, handleCellClick }) => {
  const rows = Array.from({ length: gameBoard.size }, (_, i) => i);

  const getCellClassList = (space: BoardSpace) => {
    const additionalClasses = space && space.isHighlighted ? ['highlight'] : [];

    return getTileCellClassList(space.tile, additionalClasses);
  };

  return (
    <div className="grid-container">
      <div className="grid-border">
        <div className="grid-inner-wrap">
          <div id="gridContainer" className="grid" data-size={gameBoard.size}>
            {rows.map(row => (
              <div key={`row-${row}`} className="row">
                {Array.from({ length: gameBoard.size }, (_, col) => {
                  const space = gameBoard.getSpace(col, row);

                  if (space) {
                    return (
                      <div
                        key={`cell-${col}-${row}`}
                        data-x={col}
                        data-y={row}
                        className={getCellClassList(space)}
                        onClick={() => handleCellClick(col, row)}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
          <div id="placementPreview" className="tile-preview"></div>
        </div>
      </div>
    </div>
  );
};

export default GameBoardGrid;
