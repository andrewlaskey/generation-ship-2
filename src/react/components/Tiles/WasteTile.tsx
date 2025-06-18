import { Tile } from '@/modules/Tile';
import React, { useRef, useState } from 'react';
import styles from './Tiles.module.scss';
import { useInitialAnimation } from '@/react/hooks/Animation';
import { gsap } from 'gsap/gsap-core';

interface WasteTileProps {
  tile: Tile;
  animate: boolean;
}

const WasteTile: React.FC<WasteTileProps> = ({ tile, animate }) => {
  const [icon] = useState('░');
  const iconRef = useRef<HTMLDivElement | null>(null);

  useInitialAnimation(iconRef, () => {
    if (!iconRef.current) return;

    if (animate) {
      gsap.set(iconRef.current, {
        opacity: 0,
        scale: 0.3,
      });

      const tl = gsap.timeline();

      tl.to(iconRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out(1.7)',
      });
    }
  });

  return (
    <div
      ref={iconRef}
      translate="no"
      className={`notranslate ${styles.tile} ${styles.tileWaste} ${styles[`l${tile.level}`]}`}
    >
      {icon}
    </div>
  );
};

export default WasteTile;
