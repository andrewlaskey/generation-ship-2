import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  decimals?: number;
  delay?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 2,
  decimals = 0,
  delay = 0,
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (counterRef.current) {
      // Kill any existing animation
      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      // Create an object to hold the current value
      const obj = { value: 0 };

      // Animate the value
      tweenRef.current = gsap.to(obj, {
        value: target,
        duration: duration,
        delay: delay,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = obj.value.toFixed(decimals);
          }
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, [target, duration, decimals, delay]);

  return <span ref={counterRef}>0</span>;
};

export default AnimatedCounter;
