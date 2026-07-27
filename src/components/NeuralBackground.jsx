import { useEffect, useRef } from 'react';

export default function NeuralBackground({ density = 'high', opacity = 0.8 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isIntersecting = true;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Safe motion preference check resilient to Brave Shields spoofing
    const isReducedMotion = (() => {
      try {
        if (typeof window === 'undefined') return false;
        const mediaQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery ? (mediaQuery.matches && !window.chrome) : false;
      } catch {
        return false;
      }
    })();

    const mouse = { x: -1000, y: -1000, active: false };

    // Calculate node count based on section density preset (Balanced & Clean)
    const getTargetNodeCount = (w, h) => {
      const area = (w > 0 && h > 0) ? w * h : 1000 * 600;
      if (density === 'high') {
        return Math.min(240, Math.max(120, Math.floor(area / 4200)));
      } else {
        // Subtle ambient texture for secondary sections
        return Math.min(80, Math.max(35, Math.floor(area / 10000)));
      }
    };

    let nodes = [];

    const initNodes = () => {
      const count = getTargetNodeCount(width, height);
      nodes = [];
      const speedMult = density === 'high' ? 0.4 : 0.25;

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * (width || 1000),
          y: Math.random() * (height || 600),
          vx: (Math.random() - 0.5) * (isReducedMotion ? 0.05 : speedMult),
          vy: (Math.random() - 0.5) * (isReducedMotion ? 0.05 : speedMult),
          radius: Math.random() * 1.6 + 1.0,
          phase: Math.random() * Math.PI * 2,
          baseRadius: Math.random() * 1.6 + 1.0,
          color: Math.random() > 0.35 ? '#3b82f6' : (Math.random() > 0.5 ? '#60a5fa' : '#38bdf8'),
        });
      }
    };

    initNodes();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      initNodes();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // IntersectionObserver to pause loop when section is scrolled out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !animationFrameId) {
          draw();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const maxConnectionDist = density === 'high' ? 160 : 130;
    const cellSize = maxConnectionDist;

    // Main Canvas Render Loop
    const draw = () => {
      if (!isIntersecting) {
        animationFrameId = null;
        return;
      }

      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const grid = new Map();

      // 1. Spatial Grid Bucketing O(N)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        const cellKey = `${cellX},${cellY}`;

        if (!grid.has(cellKey)) {
          grid.set(cellKey, []);
        }
        grid.get(cellKey).push(i);
      }

      // 2. Render Synaptic Connections
      const processedPairs = new Set();
      const maxDistSq = maxConnectionDist * maxConnectionDist;
      const baseAlphaMult = density === 'high' ? 0.42 : 0.28;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        const cellX = Math.floor(n1.x / cellSize);
        const cellY = Math.floor(n1.y / cellSize);

        for (let gx = -1; gx <= 1; gx++) {
          for (let gy = -1; gy <= 1; gy++) {
            const neighborKey = `${cellX + gx},${cellY + gy}`;
            const neighborIndices = grid.get(neighborKey);

            if (!neighborIndices) continue;

            for (let k = 0; k < neighborIndices.length; k++) {
              const j = neighborIndices[k];
              if (i >= j) continue;

              const pairKey = i < j ? `${i}_${j}` : `${j}_${i}`;
              if (processedPairs.has(pairKey)) continue;
              processedPairs.add(pairKey);

              const n2 = nodes[j];
              const dx = n1.x - n2.x;
              const dy = n1.y - n2.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < maxDistSq) {
                const dist = Math.sqrt(distSq);
                const normDist = 1 - dist / maxConnectionDist;
                let alpha = Math.pow(normDist, 1.3) * baseAlphaMult;
                let strokeColor = 'rgba(59, 130, 246, ';

                // Cursor proximity activation boost
                if (mouse.active) {
                  const midX = (n1.x + n2.x) / 2;
                  const midY = (n1.y + n2.y) / 2;
                  const mDistSq = (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2;
                  const mRadius = 125;

                  if (mDistSq < mRadius * mRadius) {
                    const mDist = Math.sqrt(mDistSq);
                    const boost = (1 - mDist / mRadius);
                    alpha = Math.min(alpha + boost * 0.4, 0.88);
                    strokeColor = 'rgba(56, 189, 248, ';
                  }
                }

                if (alpha > 0.015) {
                  ctx.beginPath();
                  ctx.moveTo(n1.x, n1.y);
                  ctx.lineTo(n2.x, n2.y);
                  ctx.strokeStyle = `${strokeColor}${alpha.toFixed(3)})`;
                  ctx.lineWidth = alpha > 0.35 ? 1.2 : 0.75;
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // 3. Update Node Physics & Render Synaptic Nodes
      const mouseRepelRadius = density === 'high' ? 115 : 90;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!isReducedMotion) {
          node.x += node.vx + Math.cos(time + node.phase) * 0.12;
          node.y += node.vy + Math.sin(time + node.phase) * 0.12;
        }

        if (node.x < 0) { node.x = 0; node.vx *= -1; }
        if (node.x > width) { node.x = width; node.vx *= -1; }
        if (node.y < 0) { node.y = 0; node.vy *= -1; }
        if (node.y > height) { node.y = height; node.vy *= -1; }

        if (mouse.active && !isReducedMotion) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          const mdistSq = mdx * mdx + mdy * mdy;

          if (mdistSq < mouseRepelRadius * mouseRepelRadius && mdistSq > 0) {
            const mdist = Math.sqrt(mdistSq);
            const force = (1 - mdist / mouseRepelRadius) * 3.8;
            node.x += (mdx / mdist) * force;
            node.y += (mdy / mdist) * force;
          }
        }

        let currentRadius = node.baseRadius;
        if (mouse.active) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          if (mdx * mdx + mdy * mdy < 85 * 85) {
            currentRadius = node.baseRadius * 1.45;
          }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = density === 'high' ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: opacity
      }}
    />
  );
}
