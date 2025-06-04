import { BoardSpace } from '@/modules/BoardSpace';
import { GameBoard } from '@/modules/GameBoard';
import { HandItem } from '@/modules/PlayerHand';
import { TileBlock, TileBlockLayout } from '@/modules/TileBlock';
import { getTileCellClassList } from '@/utils/getTileCellClassList';
import React, { useRef } from 'react';
import { GridCell } from '../GameView';
import { Tile, TileType } from '@/modules/Tile';
import styles from './GameBoardGrid.module.scss';
import GridPeople from '../GridPeople/GridPeople';

interface GameBoardGridProps {
  gameBoard: GameBoard;
  handleCellClick: (x: number, y: number) => void;
  selectedHandItem?: HandItem | null;
  selectedGridCell?: GridCell | null;
  forceUpdate?: number;
  usePerspective?: boolean;
}

const GameBoardGrid: React.FC<GameBoardGridProps> = ({
  gameBoard,
  handleCellClick,
  selectedHandItem,
  selectedGridCell,
  usePerspective = true,
  forceUpdate,
}) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const rows = Array.from({ length: gameBoard.size }, (_, i) => i);

  const layout: TileBlockLayout | null =
    selectedHandItem instanceof TileBlock ? selectedHandItem.getLayout() : null;
  const rotation: number =
    selectedHandItem instanceof TileBlock ? selectedHandItem.getRotation() : 0;

  const getCellClassList = (space: BoardSpace) => {
    const additionalClasses = space && space.isHighlighted ? ['highlight'] : [];

    return getTileCellClassList(space.tile, additionalClasses);
  };

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

  const getLayoutTile = (primary: boolean): Tile | null => {
    if (!layout) {
      return null;
    }

    if (primary) {
      if (rotation === 180 || rotation === 270) {
        return layout.tiles[1];
      }
      return layout.tiles[0];
    }

    if (rotation === 180 || rotation === 270) {
      return layout.tiles[0];
    }
    return layout.tiles[1];
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
                      <div
                        key={`cell-${col}-${row}`}
                        data-x={col}
                        data-y={row}
                        className={getCellClassList(space)}
                        onClick={() => handleCellClick(col, row)}
                      >
                        {space.tile && space.tile.type === TileType.People && (
                          <GridPeople
                            tile={space.tile}
                            x={col}
                            y={row}
                            gameBoard={gameBoard}
                            forceUpdate={forceUpdate}
                            gridRef={gridRef}
                          />
                        )}
                        {selectedHandItem && layout && isSelectedCell(col, row) && (
                          <div className={styles.previewItem}>
                            <div
                              className={`${styles.previewItemCell} ${getTileCellClassList(getLayoutTile(true))}`}
                            ></div>
                          </div>
                        )}
                        {layout && isPreviewTileSecondGridCell(col, row) && (
                          <div className={styles.previewItem}>
                            <div
                              className={`${styles.previewItemCell} ${getTileCellClassList(getLayoutTile(false))}`}
                            ></div>
                          </div>
                        )}
                      </div>
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
