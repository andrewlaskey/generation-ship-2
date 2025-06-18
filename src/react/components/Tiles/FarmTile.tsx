import { Tile } from '@/modules/Tile';
import React, { useEffect, useState, useRef } from 'react';
import styles from './Tiles.module.scss';
import { useInitialAnimation } from '@/react/hooks/Animation';
import { gsap } from 'gsap/gsap-core';

interface FarmTileProps {
  tile: Tile;
  animate: boolean;
}

const FarmTile: React.FC<FarmTileProps> = ({ tile, animate }) => {
  const [icon, setIcon] = useState('፡');
  const iconRef = useRef<HTMLDivElement | null>(null);
  const prevLevel = useRef(tile.level);
  const isAnimating = useRef(false);

  const getIconForLevel = (level: number): string => {
    if (level === tile.maxLevel) {
      return '፨';
    } else if (level === tile.minLevel) {
      return '፡';
    } else {
      return '፠';
    }
  };

  const hasInitialAnimated = useInitialAnimation(iconRef, () => {
    if (!iconRef.current) return;

    if (animate) {
      gsap.set(iconRef.current, {
        opacity: 0,
        scale: 0.1,
        rotation: 360,
      });

      const tl = gsap.timeline();

      tl.to(iconRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      });
    }
  });

  useEffect(() => {
    setIcon(getIconForLevel(tile.level));
  }, []);

  useEffect(() => {
    if (!hasInitialAnimated || prevLevel.current === tile.level) {
      return;
    }

    if (isAnimating.current) return;

    const currentLevel = tile.level;
    const previousLevel = prevLevel.current;
    const isLevelUp = currentLevel > previousLevel;
    const newIcon = getIconForLevel(currentLevel);

    if (animate && iconRef.current && newIcon !== icon) {
      isAnimating.current = true;

      const timeline = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
          prevLevel.current = currentLevel;
        },
      });

      if (isLevelUp) {
        timeline
          .to(iconRef.current, {
            rotation: 360,
            duration: 0.8,
            ease: 'expo.in',
          })
          .call(() => setIcon(newIcon));
      } else {
        timeline
          .to(iconRef.current, {
            rotation: -360,
            duration: 0.8,
            ease: 'expo.in',
          })
          .call(() => setIcon(newIcon));
      }
    } else {
      setIcon(newIcon);
      prevLevel.current = currentLevel;
    }
  }, [tile.level]);

  return (
    <div
      ref={iconRef}
      translate="no"
      className={`notranslate ${styles.tile} ${styles.tileFarm} ${styles[`l${tile.level}`]}`}
    >
      {icon}
    </div>
  );
};

export default FarmTile;
