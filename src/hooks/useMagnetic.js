/**
 * ==============================================================================
 * Magnetic Cursor Interaction Hook (src/hooks/useMagnetic.js)
 * ==============================================================================
 * Purpose: Provides spring-like GPU-accelerated magnetic cursor pull effect for all
 *          interactive elements (buttons, links, social icons, tabs, nav items).
 * ==============================================================================
 */

import { useEffect } from 'react';

export function useMagneticGlobal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect prefers-reduced-motion setting
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const magneticSelector = `
      a:not(.detail-value), button, .nav-link, .btn-nav-contact, .btn-primary-glow, 
      .btn-secondary-glass, .social-link, .tab-btn, .card-btn-primary, 
      .card-btn-outline, .btn-submit, .btn-scroll-top, .footer-link
    `;

    const handleMouseMove = (e) => {
      const targets = document.querySelectorAll(magneticSelector);

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Proximity radius (70px or element radius + 40px)
        const proximityRadius = Math.max(70, Math.max(rect.width, rect.height) * 0.75);

        if (distance < proximityRadius) {
          // Subtle magnetic pull (max 5-6px shift)
          const pullFactor = (1 - distance / proximityRadius);
          const pullX = (dx * 0.25 * pullFactor).toFixed(2);
          const pullY = (dy * 0.25 * pullFactor).toFixed(2);

          el.style.transform = `translate3d(${pullX}px, ${pullY}px, 0px)`;
          el.style.transition = 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          // Eased return to default position
          if (el.style.transform && el.style.transform !== 'none' && el.style.transform !== 'translate3d(0px, 0px, 0px)') {
            el.style.transform = 'translate3d(0px, 0px, 0px)';
            el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          }
        }
      });
    };

    const handleMouseLeave = () => {
      const targets = document.querySelectorAll(magneticSelector);
      targets.forEach((el) => {
        el.style.transform = 'translate3d(0px, 0px, 0px)';
        el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
}
