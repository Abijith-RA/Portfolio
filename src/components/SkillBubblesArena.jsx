import { useEffect, useRef, useState } from 'react';

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

    const mouse = { x: -1000, y: -1000, active: false, isDown: false };
    const shockwaves = [];
    const particles = [];
    const wallRipples = [];

    let clickReactionTimer = 0;
    let isHoveringAny = false;

    // Default fallback skills
    const defaultUserSkills = [
      { name: 'Python' },
      { name: 'Numpy' },
      { name: 'Pandas' },
      { name: 'matplotlib' },
      { name: 'Git' }
    ];

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

    const spawnParticles = (x, y, count = 10, color = '#38bdf8') => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1.0,
          size: Math.random() * 3 + 1.5,
          color
        });
      }
    };

    const addWallRipple = (x, y, isVertical = false) => {
      if (wallRipples.length > 15) wallRipples.shift();
      wallRipples.push({
        x,
        y,
        radius: 4,
        maxRadius: 36,
        alpha: 1.0,
        isVertical
      });
    };

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;

      if (width === 0 || height === 0) return;

      const isMobile = width <= 768;
      const pad = isMobile ? 45 : 75;
      const usableW = Math.max(100, width - pad * 2);
      const usableH = Math.max(100, height - pad * 2);
      const total = displaySkills.length;

      const cols = Math.ceil(Math.sqrt(total * (usableW / usableH)));
      const rows = Math.ceil(total / cols);
      const cellW = usableW / cols;
      const cellH = usableH / rows;

      nodes = displaySkills.map((s, idx) => {
        const text = s.name;
        const radius = isMobile
          ? Math.max(38, Math.min(54, text.length * 5 + 18))
          : Math.max(44, Math.min(64, text.length * 6 + 22));

        const col = idx % cols;
        const row = Math.floor(idx / cols);

        const initialX = pad + col * cellW + cellW / 2 + (Math.random() - 0.5) * (cellW * 0.4);
        const initialY = pad + row * cellH + cellH / 2 + (Math.random() - 0.5) * (cellH * 0.4);

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.6;

        return {
          id: idx,
          name: text,
          radius,
          x: Math.max(radius + 15, Math.min(width - radius - 15, initialX)),
          y: Math.max(radius + 15, Math.min(height - radius - 15, initialY)),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
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

    const triggerExplosiveShockwave = (clickX, clickY) => {
      if (shockwaves.length >= 3) return;

      mouse.isDown = true;
      clickReactionTimer = 90; // Active reaction for ~1.5 sec
      const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || ('ontouchstart' in window));

      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 8,
        maxRadius: isMobile ? 240 : 320,
        speed: isMobile ? 8.5 : 7.0,
        alpha: 1.0,
        color: '#38bdf8',
        width: 3.0
      });

      if (shockwaves.length < 3 && !isMobile) {
        shockwaves.push({
          x: clickX,
          y: clickY,
          radius: 2,
          maxRadius: 220,
          speed: 5.2,
          alpha: 0.8,
          color: '#60a5fa',
          width: 2.0
        });
      }

      spawnParticles(clickX, clickY, isMobile ? 8 : 16, '#38bdf8');

      let hitNode = false;
      nodes.forEach(n => {
        const dx = n.x - clickX;
        const dy = n.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < n.radius + 60) {
          hitNode = true;
          n.energy = 1.0;
          const launchAngle = Math.atan2(dy, dx) || Math.random() * Math.PI * 2;
          const impulse = (1 - dist / (n.radius + 180)) * (isMobile ? 7 : 11) + 2.5;
          n.vx += Math.cos(launchAngle) * impulse;
          n.vy += Math.sin(launchAngle) * impulse;
          spawnParticles(n.x, n.y, isMobile ? 5 : 10, '#38bdf8');
        }
      });
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      triggerExplosiveShockwave(e.clientX - rect.left, e.clientY - rect.top);
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
      if (clickReactionTimer > 0) clickReactionTimer--;

      ctx.clearRect(0, 0, width, height);

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      // 1. Subtle Cybernetic Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;

      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Corner Accents
      const cornerLen = 14;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(12, 12 + cornerLen); ctx.lineTo(12, 12); ctx.lineTo(12 + cornerLen, 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - 12 - cornerLen, 12); ctx.lineTo(width - 12, 12); ctx.lineTo(width - 12, 12 + cornerLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, height - 12 - cornerLen); ctx.lineTo(12, height - 12); ctx.lineTo(12 + cornerLen, height - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - 12 - cornerLen, height - 12); ctx.lineTo(width - 12, height - 12); ctx.lineTo(width - 12, height - 12 - cornerLen); ctx.stroke();
      ctx.restore();

      // 2. Render Wall Impact Kinetic Ripples
      for (let i = wallRipples.length - 1; i >= 0; i--) {
        const wr = wallRipples[i];
        wr.radius += 1.8;
        wr.alpha -= 0.035;

        if (wr.alpha <= 0 || wr.radius >= wr.maxRadius) {
          wallRipples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(wr.x, wr.y, wr.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, wr.alpha)})`;
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Shockwaves
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
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, sw.alpha)})`;
        ctx.lineWidth = sw.width;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();

        nodes.forEach(n => {
          const dx = n.x - sw.x;
          const dy = n.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (Math.abs(dist - sw.radius) < 35 && dist > 0) {
            const pushForce = (1 - sw.radius / sw.maxRadius) * 4.5;
            n.vx += (dx / dist) * pushForce;
            n.vy += (dy / dist) * pushForce;
            n.energy = Math.min(1.0, n.energy + 0.35);
          }
        });
      }

      // 4. Render Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha -= 0.024;

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
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 5. Physics & Wall Bouncing
      isHoveringAny = false;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (n.energy > 0) n.energy -= 0.015;

        // Calm, readable ambient float turbulence
        n.vx += Math.sin(time * 0.9 + i * 1.5) * 0.02;
        n.vy += Math.cos(time * 0.9 + i * 1.5) * 0.02;

        const currentSpeed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);

        // Dynamic speed damping: High speed from touch/click decelerates smoothly back to readable float (~0.8)
        if (currentSpeed > 1.2) {
          n.vx *= 0.95;
          n.vy *= 0.95;
        } else if (currentSpeed < 0.4) {
          const boostAngle = Math.atan2(n.vy, n.vx) || (Math.random() * Math.PI * 2);
          n.vx += Math.cos(boostAngle) * 0.15;
          n.vy += Math.sin(boostAngle) * 0.15;
        }

        // Cap absolute max speed
        if (currentSpeed > 7.0) {
          n.vx = (n.vx / currentSpeed) * 7.0;
          n.vy = (n.vy / currentSpeed) * 7.0;
        }

        // Soft border repulsion cushion to prevent sticking in corners
        const pad = n.radius + 12;
        const cushionMargin = 50;
        if (n.x < pad + cushionMargin) {
          n.vx += (1 - (n.x - pad) / cushionMargin) * 0.12;
        } else if (n.x > width - pad - cushionMargin) {
          n.vx -= (1 - (width - pad - n.x) / cushionMargin) * 0.12;
        }
        if (n.y < pad + cushionMargin) {
          n.vy += (1 - (n.y - pad) / cushionMargin) * 0.12;
        } else if (n.y > height - pad - cushionMargin) {
          n.vy -= (1 - (height - pad - n.y) / cushionMargin) * 0.12;
        }

        n.x += n.vx;
        n.y += n.vy;

        // Clean Wall Bouncing with Ripple Waves
        if (n.x < pad) {
          n.x = pad;
          n.vx = Math.abs(n.vx) * 0.92;
          addWallRipple(0, n.y, true);
          spawnParticles(n.x, n.y, 6, '#38bdf8');
        } else if (n.x > width - pad) {
          n.x = width - pad;
          n.vx = -Math.abs(n.vx) * 0.92;
          addWallRipple(width, n.y, true);
          spawnParticles(n.x, n.y, 6, '#38bdf8');
        }

        if (n.y < pad) {
          n.y = pad;
          n.vy = Math.abs(n.vy) * 0.92;
          addWallRipple(n.x, 0, false);
          spawnParticles(n.x, n.y, 6, '#38bdf8');
        } else if (n.y > height - pad) {
          n.y = height - pad;
          n.vy = -Math.abs(n.vy) * 0.92;
          addWallRipple(n.x, height, false);
          spawnParticles(n.x, n.y, 6, '#38bdf8');
        }

        // Fast Touch / Mouse Impulse (Touch/hover launches skills fast!)
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < n.radius + 80 && dist > 0) {
            n.isHovered = true;
            isHoveringAny = true;
            n.energy = 1.0;
            // Strong impulse on touch/hover so skills shoot away fast
            const force = mouse.isDown ? -6.5 : (1 - dist / (n.radius + 80)) * 5.2;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = mouse.isDown ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = mouse.isDown ? 2.2 : 1.2;
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

      // 6. Anti-Crowding & Collisions
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.radius + n2.radius + 14;

          const repelRange = Math.max(minDist * 2.8, 160);
          if (dist < repelRange) {
            const repelForce = (1 - dist / repelRange) * 0.16;
            const nx = dx / dist;
            const ny = dy / dist;
            n1.vx -= nx * repelForce;
            n1.vy -= ny * repelForce;
            n2.vx += nx * repelForce;
            n2.vy += ny * repelForce;
          }

          if (dist < minDist) {
            const overlap = 0.5 * (minDist - dist);
            const nx = dx / dist;
            const ny = dy / dist;

            n1.x -= nx * overlap;
            n1.y -= ny * overlap;
            n2.x += nx * overlap;
            n2.y += ny * overlap;

            n1.vx -= nx * 0.42;
            n1.vy -= ny * 0.42;
            n2.vx += nx * 0.42;
            n2.vy += ny * 0.42;

            if (Math.abs(n1.vx) > 0.8 || Math.abs(n2.vx) > 0.8) {
              spawnParticles((n1.x + n2.x) / 2, (n1.y + n2.y) / 2, 5, '#38bdf8');
            }
          }
        }
      }

      // 7. Laser Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 230) {
            const isHover = n1.isHovered || n2.isHovered || n1.energy > 0.2 || n2.energy > 0.2;
            const alpha = (1 - dist / 230) * (isHover ? 0.65 : 0.18);

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

      // 8. Render Skill Bubbles
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const currentRadius = n.isHovered ? n.radius * 1.18 : n.radius;

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
          ctx.shadowBlur = 22;
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

        if (n.energy > 0.05) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius + (1 - n.energy) * 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${n.energy * 0.8})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${currentRadius < 48 ? 14 : 16}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = (n.isHovered || n.energy > 0.2) ? '#ffffff' : '#e2e8f0';
        ctx.fillText(n.name, n.x, n.y);
        ctx.restore();
      }

      // 9. Interactive Reaction HUD Header
      let hudText = "// DON'T TOUCH MY SKILLS ⚡";
      let hudColor = 'rgba(56, 189, 248, 0.7)';

      if (clickReactionTimer > 0) {
        hudText = "// OUCH! DON'T TOUCH! 💥";
        hudColor = '#ef4444';
      } else if (mouse.active && isHoveringAny) {
        hudText = "// HEY! DON'T DO THAT 🚨";
        hudColor = '#f59e0b';
      }

      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = hudColor;
      ctx.shadowColor = hudColor;
      ctx.shadowBlur = 10;
      ctx.fillText(hudText, width - 20, 20);
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
