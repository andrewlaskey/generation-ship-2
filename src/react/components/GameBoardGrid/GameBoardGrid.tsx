import { GameBoard } from '@/modules/GameBoard';
import { HandItem } from '@/modules/PlayerHand';
import { TileBlock, TileBlockLayout } from '@/modules/TileBlock';
import React, { useRef } from 'react';
import { GridCell } from '../GameView';
import styles from './GameBoardGrid.module.scss';
import GameBoardCell from '../GameBoardCell/GameBoardCell';

interface GameBoardGridProps {
  gameBoard: GameBoard;
  handleCellClick: (x: number, y: number) => void;
  selectedHandItem?: HandItem | null;
  selectedGridCell?: GridCell | null;
  forceUpdate?: number;
  usePerspective?: boolean;
  animate: boolean;
}

const GameBoardGrid: React.FC<GameBoardGridProps> = ({
  gameBoard,
  handleCellClick,
  selectedHandItem,
  selectedGridCell,
  usePerspective = true,
  forceUpdate,
  animate,
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const rows = Array.from({ length: gameBoard.size }, (_, i) => i);

  const layout: TileBlockLayout | null =
    selectedHandItem instanceof TileBlock ? selectedHandItem.getLayout() : null;
  const rotation: number =
    selectedHandItem instanceof TileBlock ? selectedHandItem.getRotation() : 0;

  const isSelectedCell = (x: number, y: number): boolean => {
    return Boolean(selectedGridCell && x === selectedGridCell.x && y === selectedGridCell.y);
  };

  const isPreviewTileSecondGridCell = (x: number, y: number): boolean => {
    if (!selectedGridCell || !layout) {
      return false;
    }

    let shiftX = 0;
    let shiftY = 0;

    switch (rotation) {
      case 90: {
        shiftY++;
        break;
      }
      case 180: {
        shiftX--;
        break;
      }
      case 270: {
        shiftY--;
        break;
      }
      default: {
        shiftX++;
        break;
      }
    }

    if (x === selectedGridCell.x + shiftX && y === selectedGridCell.y + shiftY) {
      return true;
    }

    return false;
  };

  return (
    <div className="grid-container">
      <div className="grid-border">
        <div className={`${styles.gridInnerWrap} ${usePerspective ? styles.perspective : ''}`}>
          <div ref={gridRef} className="grid" data-size={gameBoard.size}>
            {rows.map(row => (
              <div key={`row-${row}`} className="row">
                {Array.from({ length: gameBoard.size }, (_, col) => {
                  const space = gameBoard.getSpace(col, row);

                  if (space) {
                    return (
                      <GameBoardCell
                        gameBoard={gameBoard}
                        forceUpdate={forceUpdate}
                        gridRef={gridRef}
                        col={col}
                        row={row}
                        space={space}
                        handleCellClick={handleCellClick}
                        isSelectedCell={isSelectedCell(col, row)}
                        isPreviewTileSecondGridCell={isPreviewTileSecondGridCell(col, row)}
                        layout={layout}
                        rotation={rotation}
                        key={`${col}-${row}`}
                        animate={animate}
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
