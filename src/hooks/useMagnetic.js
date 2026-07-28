import { useEffect } from 'react';

export function useMagneticGlobal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch {
      // ignore safely
    }

    const magneticSelector = `
      a:not(.detail-value), button, .nav-link, .btn-nav-contact, .btn-primary-glow, 
      .btn-secondary-glass, .social-link, .tab-btn, .card-btn-primary, 
      .card-btn-outline, .btn-submit, .btn-scroll-top, .footer-link
    `;

    let activeEl = null;

    const handleMouseMove = (e) => {
      if (!e || !e.target) return;
      const target = e.target.closest(magneticSelector);
      if (target) {
        if (activeEl && activeEl !== target) {
          activeEl.style.transform = 'translate3d(0px, 0px, 0px)';
          activeEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        }
        activeEl = target;
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const pullX = (dx * 0.18).toFixed(2);
        const pullY = (dy * 0.18).toFixed(2);
        target.style.transform = `translate3d(${pullX}px, ${pullY}px, 0px)`;
        target.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
      } else if (activeEl) {
        activeEl.style.transform = 'translate3d(0px, 0px, 0px)';
        activeEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        activeEl = null;
      }
    };

    const handleMouseLeave = () => {
      if (activeEl) {
        activeEl.style.transform = 'translate3d(0px, 0px, 0px)';
        activeEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        activeEl = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
}
