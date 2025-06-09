// frontend/src/hooks/useAnimatedCounter.js
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animated counter with smooth number increment
 * @param {number} endValue - The final value to count to
 * @param {number} duration - Duration of animation in milliseconds (default: 2000ms)
 * @param {boolean} startAnimation - When to start the animation
 * @param {Function} formatFunction - Optional function to format the display value
 */
export const useAnimatedCounter = (
  endValue = 0, 
  duration = 2000, 
  startAnimation = false,
  formatFunction = null
) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!startAnimation || endValue === 0) {
      setCurrentValue(0);
      return;
    }

    if (isAnimating && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsAnimating(true);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(endValue * easeOut);

      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [endValue, duration, startAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const displayValue = formatFunction ? formatFunction(currentValue) : currentValue;

  return {
    value: currentValue,
    displayValue,
    isAnimating
  };
};

/**
 * Hook for multiple counters with staggered animations
 * @param {Array} counters - Array of counter configurations
 * @param {boolean} startAnimation - When to start animations
 * @param {number} staggerDelay - Delay between starting each counter (ms)
 */
export const useStaggeredCounters = (counters = [], startAnimation = false, staggerDelay = 200) => {
  const [activeCounters, setActiveCounters] = useState(new Set());
  
  useEffect(() => {
    if (!startAnimation) {
      setActiveCounters(new Set());
      return;
    }

    const timeouts = [];
    
    counters.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setActiveCounters(prev => new Set([...prev, index]));
      }, index * staggerDelay);
      
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [startAnimation, counters.length, staggerDelay]);

  return counters.map((config, index) => ({
    ...config,
    shouldAnimate: activeCounters.has(index)
  }));
};