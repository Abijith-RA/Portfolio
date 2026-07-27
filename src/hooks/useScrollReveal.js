/**
 * ==============================================================================
 * Custom Hook: Scroll-Triggered Reveal Animation (src/hooks/useScrollReveal.js)
 * ==============================================================================
 * Purpose: Provides high-performance IntersectionObserver scroll reveal animations.
 *          Applies directional slide-ins (up, left, right), opacity fades, and
 *          staggered delays for list/grid items.
 * ==============================================================================
 */

import { useState, useEffect, useRef } from 'react';

export function useScrollReveal({
  direction = 'up', // 'up' | 'left' | 'right' | 'down'
  delay = 0,        // delay in ms
  duration = 500,   // duration in ms
  threshold = 0.1   // intersection threshold
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDoneAnimating, setIsDoneAnimating] = useState(false);

  useEffect(() => {
    // Respect user prefers-reduced-motion preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      setIsDoneAnimating(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Trigger only once

          const timer = setTimeout(() => {
            setIsDoneAnimating(true);
          }, delay + duration + 100);

          return () => clearTimeout(timer);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold, delay, duration]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return 'translate3d(-40px, 0, 0)';
      case 'right':
        return 'translate3d(40px, 0, 0)';
      case 'down':
        return 'translate3d(0, -30px, 0)';
      case 'up':
      default:
        return 'translate3d(0, 30px, 0)';
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translate3d(0, 0, 0)' : getInitialTransform(),
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: isDoneAnimating ? 'auto' : 'transform, opacity'
  };

  return { ref, isVisible, style };
}
