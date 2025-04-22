import { Tile } from '@/modules/Tile';
import React, { useEffect, useRef, useState } from 'react';
import GridPerson from '../GridPerson/GridPerson';
import { GameBoard } from '@/modules/GameBoard';
import styles from './GridPeople.module.scss';

interface GridPeopleProps {
  tile: Tile;
  x: number;
  y: number;
  gameBoard: GameBoard;
  forceUpdate?: number;
}

const GridPeople: React.FC<GridPeopleProps> = ({ tile, x, y, gameBoard, forceUpdate }) => {
  const containerRef = useRef(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const updateRect = () => {
        if (containerRef.current) {
          const rect = (containerRef.current as HTMLDivElement).getBoundingClientRect();
          setContainerRect(rect);
        }
      };

      // Initial calculation
      updateRect();

      // Recalculate on resize
      window.addEventListener('resize', updateRect);
      return () => window.removeEventListener('resize', updateRect);
    }
  }, []);

  return (
    <div className={styles.gridPeople} ref={containerRef}>
      {containerRect &&
        Array.from({ length: tile.level * 2 }, (_, index) => (
          <GridPerson
            key={index}
            x={x}
            y={y}
            gameBoard={gameBoard}
            forceUpdate={forceUpdate}
            parentRect={containerRect}
          />
        ))}
    </div>
  );
};

export default GridPeople;
