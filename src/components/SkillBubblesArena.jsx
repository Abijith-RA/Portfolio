import { useEffect, useRef, useState } from 'react';

export default function SkillBubblesArena({ skills = [] }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeScore, setActiveScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;

    const mouse = { x: -1000, y: -1000, active: false, isDown: false };
    const shockwaves = [];
    const particles = [];

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
      const orbitRadius = Math.min(width, height) * 0.32;

      nodes = displaySkills.map((s, idx) => {
        const text = s.name;
        const radius = Math.max(48, Math.min(68, text.length * 6 + 24));
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
          isHovered: false,
          energy: 0
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
      mouse.isDown = false;
    };

    const spawnParticles = (x, y, count = 18, color = '#38bdf8') => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 4 + 2,
          color
        });
      }
    };

    const triggerExplosiveShockwave = (clickX, clickY) => {
      mouse.isDown = true;

      // 1. Primary Massive Outer Wave (Broad & Fast)
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 6,
        maxRadius: 340,
        speed: 6.5,
        alpha: 1.0,
        color: '#38bdf8',
        width: 3.5
      });

      // 2. Secondary High-Frequency Echo Wave
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 2,
        maxRadius: 260,
        speed: 4.8,
        alpha: 0.85,
        color: '#60a5fa',
        width: 2.0
      });

      // 3. Spawn Explosive Particle Burst
      spawnParticles(clickX, clickY, 24, '#38bdf8');
      spawnParticles(clickX, clickY, 12, '#93c5fd');

      // 4. Kinetic Impulse on Nearby Nodes
      let hitNode = false;
      nodes.forEach(n => {
        const dx = n.x - clickX;
        const dy = n.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < n.radius + 40) {
          hitNode = true;
          n.energy = 1.0;
          const launchAngle = Math.atan2(dy, dx) || Math.random() * Math.PI * 2;
          const impulse = (1 - dist / (n.radius + 150)) * 12 + 4;
          n.vx += Math.cos(launchAngle) * impulse;
          n.vy += Math.sin(launchAngle) * impulse;
          spawnParticles(n.x, n.y, 16, '#38bdf8');
        }
      });

      if (hitNode) {
        setActiveScore(prev => prev + 1);
      }
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerExplosiveShockwave(clickX, clickY);
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        mouse.x = touchX;
        mouse.y = touchY;
        mouse.active = true;
        triggerExplosiveShockwave(touchX, touchY);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.active = true;
      }
    };

    const handleMouseUp = () => {
      mouse.isDown = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

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
      const orbitRadius = Math.min(width, height) * 0.32;

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

      // 2. Expanded Kinetic Shockwave Rings Logic
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha -= 0.018;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color.replace(')', `, ${Math.max(0, sw.alpha)})`).replace('rgb', 'rgba').replace('#38bdf8', `rgba(56, 189, 248, ${sw.alpha})`).replace('#60a5fa', `rgba(96, 165, 250, ${sw.alpha})`);
        ctx.lineWidth = sw.width;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        // Push nodes hit by expanding wave front
        nodes.forEach(n => {
          const dx = n.x - sw.x;
          const dy = n.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (Math.abs(dist - sw.radius) < 35 && dist > 0) {
            const pushForce = (1 - sw.radius / sw.maxRadius) * 5.5;
            n.vx += (dx / dist) * pushForce;
            n.vy += (dy / dist) * pushForce;
            n.energy = Math.min(1.0, n.energy + 0.4);
          }
        });
      }

      // 3. Particle Sparks Logic
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // 4. Orbital Physics & Movement
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Decay node energy
        if (n.energy > 0) n.energy -= 0.015;

        n.angle += 0.006;
        const targetX = centerX + Math.cos(n.angle + Math.sin(time * 0.8 + i) * 0.2) * orbitRadius;
        const targetY = centerY + Math.sin(n.angle + Math.cos(time * 0.8 + i) * 0.2) * (orbitRadius * 0.85);

        n.vx += (targetX - n.x) * 0.004;
        n.vy += (targetY - n.y) * 0.004;

        n.vx *= 0.95;
        n.vy *= 0.95;

        n.x += n.vx;
        n.y += n.vy;

        // Boundary Clamp
        const pad = n.radius + 15;
        if (n.x < pad) { n.x = pad; n.vx *= -0.6; }
        if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.6; }
        if (n.y < pad) { n.y = pad; n.vy *= -0.6; }
        if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.6; }

        // Mouse Hover & Repel/Attract Physics
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < n.radius + 40 && dist > 0) {
            n.isHovered = true;
            const force = mouse.isDown ? -5.5 : (1 - dist / (n.radius + 40)) * 4;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;

            // Draw Magnetic Cursor Slingshot Line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = mouse.isDown ? '#38bdf8' : 'rgba(56, 189, 248, 0.5)';
            ctx.lineWidth = mouse.isDown ? 2.5 : 1.4;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
          } else {
            n.isHovered = false;
          }
        } else {
          n.isHovered = false;
        }
      }

      // 5. Elastic Collision Resolution
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

            n1.vx -= nx * 0.45;
            n1.vy -= ny * 0.45;
            n2.vx += nx * 0.45;
            n2.vy += ny * 0.45;

            // Collision Spark Effect
            if (Math.abs(n1.vx) > 1 || Math.abs(n2.vx) > 1) {
              spawnParticles((n1.x + n2.x) / 2, (n1.y + n2.y) / 2, 6, '#38bdf8');
            }
          }
        }
      }

      // 6. Draw Synaptic Laser Web Connecting Nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const isHover = n1.isHovered || n2.isHovered || n1.energy > 0.2 || n2.energy > 0.2;
            const alpha = (1 - dist / 280) * (isHover ? 0.7 : 0.2);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = isHover ? `rgba(56, 189, 248, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = isHover ? 2.0 : 1.0;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // 7. Render Skill Nodes
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

        if (n.isHovered || n.energy > 0.2) {
          bgGrad.addColorStop(0, 'rgba(30, 58, 95, 0.98)');
          bgGrad.addColorStop(1, 'rgba(12, 22, 42, 0.98)');
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.4;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.75)';
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

        // Active Energy Pulse Ring
        if (n.energy > 0.05) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius + (1 - n.energy) * 22, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${n.energy * 0.85})`;
          ctx.lineWidth = 2.0;
          ctx.stroke();
          ctx.restore();
        }

        // Skill Label Text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${currentRadius < 55 ? 15.5 : 17.5}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = (n.isHovered || n.energy > 0.2) ? '#ffffff' : '#e2e8f0';
        ctx.fillText(n.name, n.x, n.y);
        ctx.restore();
      }

      // 8. Subtle HUD Instruction Badge Overlay
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.fillText("// DON'T TOUCH MY SKILLS ⚡", width - 20, 20);
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      resizeObserver.disconnect();
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [skills]);

  return (
    <div ref={containerRef} className="skills-arena-container" style={{ cursor: 'crosshair' }}>
      <canvas ref={canvasRef} className="skills-arena-canvas" />
    </div>
  );
}
