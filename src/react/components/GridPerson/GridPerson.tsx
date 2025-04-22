import { GameBoard } from '@/modules/GameBoard';
import { TileType } from '@/modules/Tile';
import gsap from 'gsap';
import { draw, shuffle } from 'radash';
import React, { useEffect, useRef, useState } from 'react';
import styles from './GridPerson.module.scss';

interface GridPersonProps {
  x: number;
  y: number;
  gameBoard: GameBoard;
  forceUpdate?: number;
  parentRect: DOMRect;
}

const GridPerson: React.FC<GridPersonProps> = ({ x, y, gameBoard, forceUpdate, parentRect }) => {
  const divRef = useRef(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const colors = ['#ea3ed3', '#f03759', '#cd4189', '#e75ee9'];

  const getRectCenter = (rect: DOMRect): { x: number; y: number } => {
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    return { x, y };
  };

  // Initial animation setup - only runs once
  useEffect(() => {
    if (divRef.current && !isInitialized) {
      const personRect = (divRef.current as HTMLDivElement).getBoundingClientRect();
      //   const start = getRectCenter(parentRect);
      const fromX = gsap.utils.random(0, parentRect.width) - personRect.width / 2;
      const fromY = gsap.utils.random(0, parentRect.height) - personRect.height / 2;

      // Set initial position
      gsap.set(divRef.current, {
        x: fromX,
        y: fromY,
      });

      timeline.current = gsap.timeline();

      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Update target position when gameBoard or forceUpdate changes
  useEffect(() => {
    if (divRef.current && isInitialized && timeline.current) {
      if (timeline.current) {
        timeline.current.kill();
        timeline.current = gsap.timeline();
      }

      const personRect = (divRef.current as HTMLDivElement).getBoundingClientRect();
      const neighbors = gameBoard.getNeighborsWithCoords(x, y);
      const shuffled = shuffle(neighbors);

      const farmTile = shuffled.find(tile => tile.tile.type === TileType.Farm);

      let toX = gsap.utils.random(-parentRect.width, parentRect.width);
      let toY = gsap.utils.random(-parentRect.height, parentRect.height);
      const fromX = gsap.utils.random(0, parentRect.width) - personRect.width / 2;
      const fromY = gsap.utils.random(0, parentRect.height) - personRect.height / 2;

      if (farmTile) {
        const el = document.querySelector<HTMLDivElement>(
          `.cell[data-x="${farmTile.x}"][data-y="${farmTile.y}"]`
        );

        if (el) {
          const start = getRectCenter(parentRect);
          const targetRect = el.getBoundingClientRect();
          const targetCenter = getRectCenter(targetRect);
          toX =
            targetCenter.x -
            start.x -
            personRect.width / 2 +
            gsap.utils.random(0, targetRect.width);
          toY =
            targetCenter.y -
            start.y -
            personRect.height / 2 +
            gsap.utils.random(0, targetRect.height);
        }
      }

      timeline.current.to(divRef.current, {
        x: fromX,
        y: fromY,
        duration: 1,
        delay: Math.random(),
        ease: 'linear',
        onComplete: () => {
          tweenRef.current = gsap.fromTo(
            divRef.current,
            {
              x: fromX,
              y: fromY,
            },
            {
              translateX: toX,
              translateY: toY,
              duration: 1,
              ease: 'linear',
              yoyo: true,
              repeat: -1,
              repeatRefresh: true,
            }
          );
        },
      });
    }
  }, [gameBoard, forceUpdate, x, y, isInitialized]);

  // Clean up the animation when component unmounts
  useEffect(() => {
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
      if (timeline.current) {
        timeline.current.kill();
      }
    };
  }, []);

  return (
    <div ref={divRef} className={styles.gridPerson} style={{ color: draw(colors) || '#e75ee9' }}>
      ⫯
    </div>
  );
};

export default GridPerson;
