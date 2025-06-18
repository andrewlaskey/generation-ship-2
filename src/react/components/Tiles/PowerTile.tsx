import { Tile, TileState } from '@/modules/Tile';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Tiles.module.scss';
import { useInitialAnimation } from '@/react/hooks/Animation';
import { gsap } from 'gsap/gsap-core';

interface PowerTileProps {
  tile: Tile;
  animate: boolean;
}

const PowerTile: React.FC<PowerTileProps> = ({ tile, animate }) => {
  const [icon, setIcon] = useState('ᚣ');
  const iconRef = useRef<HTMLDivElement | null>(null);

  useInitialAnimation(iconRef, () => {
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
    if (tile.state === TileState.Dead) {
      setIcon('ᚢ');
    } else {
      setIcon('ᚣ');
    }
  }, [tile.level, tile.state]);

  return (
    <div
      ref={iconRef}
      translate="no"
      className={`notranslate ${styles.tile} ${styles.tilePower} ${styles[`l${tile.level}`]} ${tile.state === TileState.Dead ? styles.deadPower : ''}`}
    >
      {icon}
      {tile.state !== TileState.Dead && <span className={styles.powerSpark}>⚡</span>}
    </div>
  );
};

export default PowerTile;
