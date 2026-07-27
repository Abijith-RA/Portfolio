/**
 * ==============================================================================
 * Reusable 3D Perspective Tilt & Elevation Hook (src/hooks/use3DTiltCard.js)
 * ==============================================================================
 * Purpose: Calculates cursor-relative 3D rotation angles, translateZ elevation,
 *          and dynamic directional shadow shifting for secondary UI cards.
 * ==============================================================================
 */

import { useState, useRef } from 'react';

export function use3DTiltCard(maxTilt = 10, translateZ = 14) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 15, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = mouseX * maxTilt;
    const rotateX = -mouseY * maxTilt;
    const shadowX = -rotateY * 1.5;
    const shadowY = rotateX * 1.5 + 18;

    setTilt({ rotateX, rotateY, shadowX, shadowY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 15, isHovered: false });
  };

  const transformStyle = tilt.isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateZ(${translateZ}px) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';

  const boxShadowStyle = tilt.isHovered
    ? `${tilt.shadowX.toFixed(1)}px ${tilt.shadowY.toFixed(1)}px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(56, 189, 248, 0.2)`
    : 'none';

  return {
    cardRef,
    isHovered: tilt.isHovered,
    tiltProps: {
      ref: cardRef,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        transform: transformStyle,
        boxShadow: boxShadowStyle,
        transition: tilt.isHovered
          ? 'transform 0.1s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.1s cubic-bezier(0.03, 0.98, 0.52, 0.99)'
          : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow'
      }
    }
  };
}
