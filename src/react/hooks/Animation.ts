import { useEffect, useRef } from 'react';

export const useInitialAnimation = (
  elementRef: React.RefObject<HTMLElement | null>,
  animationCallback: () => gsap.core.Timeline | void
) => {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasAnimated.current && elementRef.current) {
      hasAnimated.current = true;
      animationCallback();
    }
  }, []);

  return hasAnimated.current;
};
