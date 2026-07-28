import { useEffect, useRef } from 'react';

export default function SkillBubblesArena({ skills = [] }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    const mouse = { x: -1000, y: -1000, active: false };

    // Default 5 skills specified by user
    const defaultUserSkills = [
      { name: 'Python' },
      { name: 'Numpy' },
      { name: 'Pandas' },
      { name: 'matplotlib' },
      { name: 'Git' }
    ];

    // Normalize incoming Supabase skills or fallback
    const rawList = (Array.isArray(skills) && skills.length > 0) ? skills : defaultUserSkills;

    const activeList = rawList
      .map(item => {
        if (!item) return null;
        if (typeof item === 'string') return { name: item.trim() };
        if (typeof item === 'object') {
          const label = item.name || item.title || item.skill_name || item.skill || '';
          return { name: String(label).trim() };
        }
        return null;
      })
      .filter(item => item && item.name.length > 0);

    const displaySkills = activeList.length > 0 ? activeList : defaultUserSkills;

    let nodes = [];

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;

      const centerX = width / 2;
      const centerY = height / 2;
      const total = displaySkills.length;
      const orbitRadius = Math.min(width, height) * 0.28;

      nodes = displaySkills.map((s, idx) => {
        const text = s.name;
        const radius = Math.max(38, Math.min(58, text.length * 5.5 + 20));
        const angle = (idx / total) * Math.PI * 2;

        return {
          id: idx,
          name: text,
          radius,
          angle,
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          isHovered: false
        };
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const orbitRadius = Math.min(width, height) * 0.28;

      // 1. Draw Subtle Holographic Radar Background Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1.2;
      const radarRadii = [orbitRadius * 0.5, orbitRadius, orbitRadius * 1.4];
      radarRadii.forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      // 2. Orbital Physics & Movement
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        n.angle += 0.006;
        const targetX = centerX + Math.cos(n.angle + Math.sin(time * 0.8 + i) * 0.2) * orbitRadius;
        const targetY = centerY + Math.sin(n.angle + Math.cos(time * 0.8 + i) * 0.2) * (orbitRadius * 0.85);

        n.vx += (targetX - n.x) * 0.004;
        n.vy += (targetY - n.y) * 0.004;

        n.vx *= 0.95;
        n.vy *= 0.95;

        n.x += n.vx;
        n.y += n.vy;

        // Boundary Clamp - Zero Overflow
        const pad = n.radius + 15;
        if (n.x < pad) { n.x = pad; n.vx *= -0.5; }
        if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.5; }
        if (n.y < pad) { n.y = pad; n.vy *= -0.5; }
        if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.5; }

        // Mouse Hover Check
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < n.radius + 20 && dist > 0) {
            n.isHovered = true;
            const force = (1 - dist / (n.radius + 20)) * 3;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          } else {
            n.isHovered = false;
          }
        } else {
          n.isHovered = false;
        }
      }

      // 3. Elastic Collision Resolution
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = n1.radius + n2.radius + 14;

          if (dist < minDist && dist > 0) {
            const overlap = 0.5 * (minDist - dist);
            const nx = dx / dist;
            const ny = dy / dist;

            n1.x -= nx * overlap;
            n1.y -= ny * overlap;
            n2.x += nx * overlap;
            n2.y += ny * overlap;

            n1.vx -= nx * 0.35;
            n1.vy -= ny * 0.35;
            n2.vx += nx * 0.35;
            n2.vy += ny * 0.35;
          }
        }
      }

      // 4. Draw Synaptic Laser Web Connecting Nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260) {
            const isHover = n1.isHovered || n2.isHovered;
            const alpha = (1 - dist / 260) * (isHover ? 0.6 : 0.18);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = isHover ? `rgba(56, 189, 248, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = isHover ? 1.8 : 0.9;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 5. Render Skill Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const currentRadius = n.isHovered ? n.radius * 1.2 : n.radius;

        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);

        const bgGrad = ctx.createRadialGradient(
          n.x - currentRadius * 0.3,
          n.y - currentRadius * 0.3,
          currentRadius * 0.1,
          n.x,
          n.y,
          currentRadius
        );

        if (n.isHovered) {
          bgGrad.addColorStop(0, 'rgba(30, 58, 95, 0.98)');
          bgGrad.addColorStop(1, 'rgba(12, 22, 42, 0.98)');
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.4;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.65)';
          ctx.shadowBlur = 24;
        } else {
          bgGrad.addColorStop(0, 'rgba(24, 32, 50, 0.92)');
          bgGrad.addColorStop(1, 'rgba(12, 18, 30, 0.95)');
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = bgGrad;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Skill Label Text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${currentRadius < 42 ? 13.5 : 15}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = n.isHovered ? '#ffffff' : '#e2e8f0';
        ctx.fillText(n.name, n.x, n.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [skills]);

  return (
    <div ref={containerRef} className="skills-arena-container">
      <canvas ref={canvasRef} className="skills-arena-canvas" />
    </div>
  );
}
