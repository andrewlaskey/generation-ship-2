import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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
    <div ref={containerRef}>
      <div className="loading-icons">
        <div className="tree">ᚫ</div>
        <div className="people">ᨊ</div>
        <div className="farm">፠</div>
        <div className="power">ᚢ</div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default Loading;
