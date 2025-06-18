import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { Tile } from '@/modules/Tile';
import styles from './Tiles.module.scss';
import { useInitialAnimation } from '@/react/hooks/Animation';

interface TreeTileProps {
  tile: Tile;
  animate: boolean;
}

const TreeTile: React.FC<TreeTileProps> = ({ tile, animate }) => {
  const [icon, setIcon] = useState('ᚭ');
  const iconRef = useRef<HTMLDivElement>(null);
  const prevLevel = useRef(tile.level);
  const isAnimating = useRef(false);

  const getIconForLevel = (level: number): string => {
    if (level === tile.maxLevel) {
      return 'ᚫ';
    } else if (level === tile.minLevel) {
      return 'ᚭ';
    } else {
      return 'ᚨ';
    }
  };

  const hasInitialAnimated = useInitialAnimation(iconRef, () => {
    if (!iconRef.current) return;

    if (animate) {
      gsap.set(iconRef.current, {
        y: 50,
        opacity: 0,
      });

      const tl = gsap.timeline();

      tl.to(iconRef.current, {
        y: -5,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }).to(iconRef.current, {
        y: 0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)',
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
            scale: 1.5,
            duration: 0.2,
            ease: 'back.out(1.7)',
          })
          .call(() => setIcon(newIcon))
          .to(iconRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)',
          });
      } else {
        timeline
          .to(iconRef.current, {
            scale: 0.3,
            duration: 0.15,
            ease: 'back.in(1.7)',
          })
          .call(() => setIcon(newIcon))
          .to(iconRef.current, {
            scale: 1,
            duration: 0.4,
            ease: 'elastic.out(1.2, 0.4)',
          });
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
      className={`notranslate ${styles.tile} ${styles.tileTree} ${styles[`l${tile.level}`]}`}
    >
      {icon}
    </div>
  );
};

export default TreeTile;
