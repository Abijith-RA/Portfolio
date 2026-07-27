/**
 * ==============================================================================
 * Custom Hook: Cursor-Reactive Interactive Text Tilt & Glow
 * (src/hooks/useInteractiveText.js)
 * ==============================================================================
 * Purpose: Provides a site-wide refined 3D tilt perspective and soft electric blue
 *          text-shadow glow for section headings and titles as the cursor passes near.
 * ==============================================================================
 */

import { useState, useRef, useCallback } from 'react';

export function useInteractiveText(maxShift = 12, maxTilt = 6) {
  const elementRef = useRef(null);
  const [styleState, setStyleState] = useState({
    transform: 'perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)',
    textShadow: 'none',
    colorIntensity: 1,
    isHovered: false,
  });

  const handleMouseMove = useCallback((e) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (e.clientY - rect.top) / rect.height - 0.5;

    const shiftX = offsetX * maxShift; // max ~12px shift
    const shiftY = offsetY * maxShift; // max ~12px shift
    const tiltX = -offsetY * maxTilt;  // max ~6 deg tilt X
    const tiltY = offsetX * maxTilt;   // max ~6 deg tilt Y

    const distFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const glowAlpha = Math.max(0, (1 - distFromCenter * 1.5) * 0.75);

    setStyleState({
      transform: `perspective(1000px) translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`,
      textShadow: glowAlpha > 0.05 ? `0 0 ${Math.round(glowAlpha * 25)}px rgba(59, 130, 246, ${glowAlpha.toFixed(2)})` : 'none',
      colorIntensity: 1 + glowAlpha * 0.15,
      isHovered: true,
    });
  }, [maxShift, maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setStyleState({
      transform: 'perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)',
      textShadow: 'none',
      colorIntensity: 1,
      isHovered: false,
    });
  }, []);

  return {
    elementRef,
    styleProps: {
      ref: elementRef,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        transform: styleState.transform,
        textShadow: styleState.textShadow,
        transition: 'transform 0.22s cubic-bezier(0.03, 0.98, 0.52, 0.99), text-shadow 0.3s ease-out',
        willChange: 'transform, text-shadow',
        cursor: 'pointer',
      }
    }
  };
}
