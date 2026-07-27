import { useEffect, useRef, useState } from 'react';
import NeuralBackground from './NeuralBackground';

export default function SectionWrapper({ id, className = '', children }) {
  const sectionRef = useRef(null);
  const farLayerRef = useRef(null);
  const nearLayerRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    // Resilient motion preference check that isn't tricked by Brave Shields fingerprint spoofing
    const checkReducedMotion = () => {
      try {
        if (typeof window === 'undefined') return false;
        const mediaQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery ? (mediaQuery.matches && !window.chrome) : false;
      } catch {
        return false;
      }
    };

    const isReducedMotion = checkReducedMotion();

    // 1. One-time 3D Entrance Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setHasEntered(true);
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(sectionEl);

    if (isReducedMotion) return () => observer.disconnect();

    // 2. Zero-Lag LERP Inertia Scroll Loop (Direct DOM Mutation)
    let rafId;
    let targetPos = 0;
    let currentPos = 0;

    const updateParallax = () => {
      if (!sectionEl) return;
      const rect = sectionEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only update if section is within or near the viewport
      if (rect.top < windowHeight * 1.3 && rect.bottom > -windowHeight * 0.3) {
        targetPos = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
        // Smooth linear interpolation (LERP) for silky 3D inertia feel
        currentPos += (targetPos - currentPos) * 0.12;

        const farShift = (currentPos * 25).toFixed(2);
        const nearShift = (currentPos * -18).toFixed(2);

        if (farLayerRef.current) {
          farLayerRef.current.style.transform = `translate3d(0, ${farShift}px, -40px)`;
        }
        if (nearLayerRef.current) {
          nearLayerRef.current.style.transform = `translate3d(0, ${nearShift}px, 20px)`;
        }
      }

      rafId = requestAnimationFrame(updateParallax);
    };

    rafId = requestAnimationFrame(updateParallax);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [hasEntered]);

  const entranceStyle = {
    transform: hasEntered
      ? 'perspective(1000px) rotateX(0deg) translateY(0px)'
      : 'perspective(1000px) rotateX(7deg) translateY(36px)',
    opacity: hasEntered ? 1 : 0,
    transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease-out',
    willChange: 'transform, opacity',
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`section-container 3d-section-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...entranceStyle,
      }}
    >
      {/* ── FAR LAYER: Drifting Ambient Radial Glow Orbs ──────────────── */}
      <div
        ref={farLayerRef}
        className="parallax-layer far-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'transform',
        }}
      >
        <div className="ambient-glow-orb orb-primary" />
        <div className="ambient-glow-orb orb-secondary" />
      </div>

      {/* ── MID LAYER: Subtle Neural Canvas Background ────────────────── */}
      <div
        className="parallax-layer mid-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          zIndex: 1,
        }}
      >
        <NeuralBackground density="subtle" opacity={0.42} />
      </div>

      {/* ── NEAR LAYER: Floating Accents ─────────────────────────────── */}
      <div
        ref={nearLayerRef}
        className="parallax-layer near-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          willChange: 'transform',
        }}
      >
        <div className="depth-particle particle-top-right" />
        <div className="depth-particle particle-bottom-left" />
      </div>

      {/* ── FOREGROUND CONTENT ───────────────────────────────────────── */}
      <div className="section-content-foreground" style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </section>
  );
}
