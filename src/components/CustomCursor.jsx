/**
 * ==============================================================================
 * Universal Ambient GPU Trailing Glow Aura Ring Component
 * (src/components/CustomCursor.jsx)
 * ==============================================================================
 * Purpose: Provides a smooth 60fps GPU-accelerated ambient glowing aura ring
 *          that tracks behind the native custom SVG AI reticle pointer.
 *          100% resilient - even if JS is disabled or blocked, the site's native
 *          SVG AI reticle cursor remains 100% active and perfectly styled across
 *          Brave (with Shields ON/OFF/Strict), Chrome, Firefox, Safari, and Edge.
 * ==============================================================================
 */

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const haloRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let haloX = mouseX;
    let haloY = mouseY;
    let rafId;

    const onMouseMove = (e) => {
      if (typeof e.clientX === 'number') {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('pointermove', onMouseMove, { passive: true });
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // Target hover detection for halo expansion
    const handleTargetOver = (e) => {
      if (!e || !e.target) return;
      const target = e.target.closest(
        'a, button, input, textarea, select, .tab-btn, .project-card-3d, .skill-category-card-3d, .social-link, .nav-link, .btn-scroll-top, [role="button"]'
      );
      if (haloRef.current) {
        if (target) {
          haloRef.current.classList.add('hovered');
        } else {
          haloRef.current.classList.remove('hovered');
        }
      }
    };

    document.addEventListener('mouseover', handleTargetOver, { passive: true });

    // Smooth GPU Lerp Render Loop
    const render = () => {
      haloX += (mouseX - haloX) * 0.18;
      haloY += (mouseY - haloY) * 0.18;

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloX.toFixed(1)}px, ${haloY.toFixed(1)}px, 0px) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointermove', onMouseMove);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleTargetOver);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={haloRef}
      className="custom-cursor-halo"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
        transition: 'width 0.25s ease-out, height 0.25s ease-out, border-color 0.25s ease-out, background 0.25s ease-out',
      }}
    />
  );
}
