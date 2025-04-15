import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Loading.module.scss';

export interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    const tl = gsap.timeline({
      repeat: -1,
    });

    if (containerRef.current) {
      gsap.set('.loading-icons div', {
        yPercent: 100,
        opacity: 0,
      });

      tl.to('.loading-icons div', {
        duration: 0.6,
        yPercent: 0,
        opacity: 1,
        stagger: {
          each: 0.2,
          from: 'start',
        },
      }).to(
        '.loading-icons div',
        {
          duration: 0.6,
          yPercent: -100,
          opacity: 0,
          stagger: {
            each: 0.2,
            from: 'start',
          },
        },
        '+=0.2'
      );
    }

    return () => {
      if (containerRef.current) {
        tl.clear();

        gsap.to(containerRef.current, {
          duration: 0.5,
          autoAlpha: 0,
          onComplete: () => {
            gsap.killTweensOf(containerRef.current);
          },
        });
      }
    };
  }, []);

  if (!isLoading) {
    return <div></div>;
  }

  return (
    <div ref={containerRef} className={styles.loadingWidget}>
      <div className={styles.loadingIcons}>
        <div className={`${styles.icon} ${styles.tree}`}>ᚫ</div>
        <div className={`${styles.icon} ${styles.people}`}>ᨊ</div>
        <div className={`${styles.icon} ${styles.farm}`}>፠</div>
        <div className={`${styles.icon} ${styles.power}`}>ᚢ</div>
      </div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
