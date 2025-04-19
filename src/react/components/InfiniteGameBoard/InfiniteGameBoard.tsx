import { GameBoard } from '@/modules/GameBoard';
import GameBoardGrid from '../GameBoardGrid/GameBoardGrid';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import styles from './InfiniteGameBoard.module.scss';

interface InfiniteGameBoardProps {
  gameBoard: GameBoard;
  handleCellClick: (x: number, y: number) => void;
  forceUpdate: number;
}

gsap.registerPlugin(Draggable);

const InfiniteGameBoard: React.FC<InfiniteGameBoardProps> = ({
  gameBoard,
  handleCellClick,
  forceUpdate,
}) => {
  const draggableRef = useRef(null);
  const rows = 3;
  const cols = 3;

  useEffect(() => {
    if (draggableRef.current) {
      const gridEl = (draggableRef.current as HTMLDivElement).querySelector<HTMLDivElement>(
        `.${styles.gameBoar}`
      );
      const gridWidth = gridEl?.offsetWidth || 1440;
      Draggable.zIndex = 1;
      Draggable.create(draggableRef.current, {
        zIndexBoost: false,
        onClick: function (event: MouseEvent): boolean | void {
          if (event.target !== draggableRef.current) {
            return false;
          }
        } as GSAPCallback,
        onDrag: function () {
          const currentX = this.x;
          const currentY = this.y;

          if (currentX > gridWidth / 2) {
            this.x = currentX - gridWidth;
            gsap.set(this.target, { x: this.x });
          } else if (currentX < -gridWidth / 2) {
            this.x = currentX + gridWidth;
            gsap.set(this.target, { x: this.x, zIndex: 1 });
          }

          if (currentY > gridWidth / 2) {
            this.y = currentY - gridWidth;
            gsap.set(this.target, { y: this.y });
          } else if (currentY < -gridWidth / 2) {
            this.y = currentY + gridWidth;
            gsap.set(this.target, { y: this.y, zIndex: 1 });
          }
        },
      });
    }
  }, []);
  return (
    <div ref={draggableRef} className={styles.infiniteGrid}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div className={styles.infiniteGridRow} key={rowIndex}>
          {Array.from({ length: cols }, (_, colIndex) => (
            <div className={styles.gameBoard} key={colIndex}>
              <GameBoardGrid
                gameBoard={gameBoard}
                handleCellClick={handleCellClick}
                forceUpdate={forceUpdate}
                usePerspective={false}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default InfiniteGameBoard;
