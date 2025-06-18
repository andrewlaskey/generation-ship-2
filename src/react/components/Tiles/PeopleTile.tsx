import { Tile } from '@/modules/Tile';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Tiles.module.scss';
import { gsap } from 'gsap/gsap-core';
import { useInitialAnimation } from '@/react/hooks/Animation';

interface PeopleTileProps {
  tile: Tile;
  animate: boolean;
}

const PeopleTile: React.FC<PeopleTileProps> = ({ tile, animate }) => {
  const [icon, setIcon] = useState('ᨊ');
  const iconRef = useRef<HTMLDivElement | null>(null);
  const prevLevel = useRef(tile.level);
  const isAnimating = useRef(false);

  const getIconForLevel = (level: number): string => {
    if (level === tile.maxLevel) {
      return 'ᕱ';
    } else if (level === tile.minLevel) {
      return 'ᕄ';
    } else {
      return 'ᕬ';
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
        ease: 'steps(6)',
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
            scaleY: 1.5,
            duration: 0.2,
            ease: 'step(6)',
          })
          .call(() => setIcon(newIcon))
          .to(iconRef.current, {
            scaleY: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)',
          });
      } else {
        timeline
          .to(iconRef.current, {
            scaleY: 0.3,
            duration: 0.15,
            ease: 'step(6)',
          })
          .call(() => setIcon(newIcon))
          .to(iconRef.current, {
            scaleY: 1,
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
      className={`notranslate ${styles.tile} ${styles.tilePeople} ${styles[`l${tile.level}`]}`}
    >
      {icon}
    </div>
  );
};

export default PeopleTile;
