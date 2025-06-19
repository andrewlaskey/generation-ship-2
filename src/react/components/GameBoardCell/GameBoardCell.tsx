import { BoardSpace } from '@/modules/BoardSpace';
import { TileType } from '@/modules/Tile';
import React, { useMemo } from 'react';
import GridPeople from '../GridPeople/GridPeople';
import { getTileCellClassList } from '@/utils/getTileCellClassList';
import { TileBlockLayout } from '@/modules/TileBlock';
import { GameBoard } from '@/modules/GameBoard';
import styles from './GameBoardCell.module.scss';
import GridTile from '../Tiles/GridTile';

interface GameBoardCellProps {
  gameBoard: GameBoard;
  space: BoardSpace;
  col: number;
  row: number;
  handleCellClick: (x: number, y: number) => void;
  isSelectedCell: boolean;
  isPreviewTileSecondGridCell: boolean;
  layout: TileBlockLayout | null;
  rotation: number;
  gridRef: React.RefObject<HTMLDivElement | null>;
  forceUpdate?: number;
  animate: boolean;
}

const GameBoardCell: React.FC<GameBoardCellProps> = ({
  gameBoard,
  space,
  col,
  row,
  handleCellClick,
  isSelectedCell,
  isPreviewTileSecondGridCell,
  layout,
  rotation,
  gridRef,
  forceUpdate,
  animate,
}) => {
  const primaryTile = useMemo(() => {
    if (!layout) {
      return null;
    }

    if (rotation === 180 || rotation === 270) {
      return layout.tiles[1];
    }
    return layout.tiles[0];
  }, [layout?.tiles]);
  const secondaryTile = useMemo(() => {
    if (!layout) {
      return null;
    }

    if (rotation === 180 || rotation === 270) {
      return layout.tiles[0];
    }
    return layout.tiles[1];
  }, [layout?.tiles]);
  const getCellClassList = (space: BoardSpace) => {
    const additionalClasses = space && space.isHighlighted ? ['highlight'] : [];

    return getTileCellClassList(space.tile, additionalClasses);
  };

  return (
    <div
      key={`cell-${col}-${row}`}
      data-x={col}
      data-y={row}
      className={getCellClassList(space)}
      onClick={() => handleCellClick(col, row)}
    >
      {space.tile && <GridTile tile={space.tile} animate={animate} />}
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
      {layout && isSelectedCell && (
        <div className={styles.previewItem}>
          <div className={`${styles.previewItemCell}`}>
            {primaryTile && <GridTile tile={primaryTile} animate={false} />}
          </div>
        </div>
      )}
      {layout && isPreviewTileSecondGridCell && (
        <div className={styles.previewItem}>
          <div className={`${styles.previewItemCell}`}>
            {secondaryTile && <GridTile tile={secondaryTile} animate={false} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoardCell;
