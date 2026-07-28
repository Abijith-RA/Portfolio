import { useState, useRef } from 'react';

export function use3DTiltCard(maxTilt = 12, translateZ = 16) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 15, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = (mouseX * maxTilt).toFixed(2);
    const rotateX = (-mouseY * maxTilt).toFixed(2);
    const shadowX = (-rotateY * 1.5).toFixed(1);
    const shadowY = (rotateX * 1.5 + 18).toFixed(1);

    setTilt({ rotateX, rotateY, shadowX, shadowY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, shadowX: 0, shadowY: 15, isHovered: false });
  };

  const transformStyle = tilt.isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${translateZ}px) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';

  const boxShadowStyle = tilt.isHovered
    ? `${tilt.shadowX}px ${tilt.shadowY}px 32px rgba(0, 0, 0, 0.65), 0 0 30px rgba(56, 189, 248, 0.35)`
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
        WebkitTransform: transformStyle,
        boxShadow: boxShadowStyle,
        transition: tilt.isHovered
          ? 'transform 0.08s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.08s cubic-bezier(0.03, 0.98, 0.52, 0.99)'
          : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow'
      }
    }
  };
}
