import { useEffect, useRef } from 'react';

export default function SkillMatrixArena({ skills = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = { x: -1000, y: -1000, active: false };

    // Default fallback skills matching user domain if Supabase list is loading/empty
    const displaySkills = (skills && skills.length > 0)
      ? skills
      : [
          { name: 'PyTorch', category: 'AI & ML', proficiency: 95 },
          { name: 'TensorFlow', category: 'AI & ML', proficiency: 90 },
          { name: 'JAX', category: 'AI & ML', proficiency: 88 },
          { name: 'LLMs & RAG', category: 'AI & ML', proficiency: 94 },
          { name: 'Computer Vision', category: 'AI & ML', proficiency: 91 },
          { name: 'CUDA / GPU', category: 'Systems', proficiency: 89 },
          { name: 'Python', category: 'Languages', proficiency: 96 },
          { name: 'C++', category: 'Languages', proficiency: 86 },
          { name: 'Triton', category: 'Systems', proficiency: 84 },
          { name: 'Docker', category: 'Infrastructure', proficiency: 92 },
          { name: 'FastAPI', category: 'Frameworks', proficiency: 93 },
          { name: 'AWS / GCP', category: 'Infrastructure', proficiency: 87 },
          { name: 'React', category: 'Frontend', proficiency: 90 },
          { name: 'SQL', category: 'Data', proficiency: 89 },
          { name: 'Quantization', category: 'AI & ML', proficiency: 85 }
        ];

    let nodes = [];

    const initNodes = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      if (width === 0 || height === 0) return;

      const centerX = width / 2;
      const centerY = height / 2;

      nodes = displaySkills.map((s, idx) => {
        const text = s.name || s.title || 'Skill';
        const proficiency = s.proficiency || 88;
        const angle = (idx / displaySkills.length) * Math.PI * 2;
        const orbitRadius = Math.min(width, height) * (0.2 + (idx % 3) * 0.11);

        return {
          id: idx,
          name: text,
          category: s.category || 'Tech',
          proficiency,
          angle,
          orbitRadius,
          speed: (0.003 + (idx % 3) * 0.0015) * (idx % 2 === 0 ? 1 : -1),
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle) * orbitRadius,
          baseRadius: Math.max(26, Math.min(42, text.length * 3.8 + 14)),
          isHovered: false
        };
      });
    };

    initNodes();

    const handleResize = () => {
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

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const draw = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Subtle Orbital Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const radii = [width * 0.22, width * 0.33, width * 0.44];
      radii.forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      // 2. Update Node Orbital Mechanics & Hover Calculations
      nodes.forEach(node => {
        node.angle += node.speed;
        const targetX = centerX + Math.cos(node.angle) * node.orbitRadius;
        const targetY = centerY + Math.sin(node.angle) * node.orbitRadius;

        node.x += (targetX - node.x) * 0.08;
        node.y += (targetY - node.y) * 0.08;

        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < node.baseRadius + 25) {
            node.isHovered = true;
            // Magnetic gentle attraction to cursor
            node.x += (mouse.x - node.x) * 0.1;
            node.y += (mouse.y - node.y) * 0.1;
          } else {
            node.isHovered = false;
          }
        } else {
          node.isHovered = false;
        }
      });

      // 3. Draw Quantum Synaptic Connection Lines between related skills
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (n1.isHovered || n2.isHovered ? 0.65 : 0.15);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.isHovered || n2.isHovered ? `rgba(56, 189, 248, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = n1.isHovered || n2.isHovered ? 1.5 : 0.75;
            ctx.stroke();
          }
        }
      }

      // 4. Render Skill Nodes with Proficiency Rings
      nodes.forEach(node => {
        const radius = node.isHovered ? node.baseRadius * 1.2 : node.baseRadius;

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

        // Futuristic Glass Circle Fill
        const grad = ctx.createRadialGradient(
          node.x - radius * 0.2,
          node.y - radius * 0.2,
          radius * 0.1,
          node.x,
          node.y,
          radius
        );

        if (node.isHovered) {
          grad.addColorStop(0, 'rgba(30, 58, 95, 0.98)');
          grad.addColorStop(1, 'rgba(12, 22, 42, 0.98)');
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
          ctx.shadowBlur = 16;
        } else {
          grad.addColorStop(0, 'rgba(22, 33, 54, 0.9)');
          grad.addColorStop(1, 'rgba(11, 18, 32, 0.92)');
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1.2;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 6;
        }

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Skill Label Text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${radius < 32 ? 11.5 : 13}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = node.isHovered ? '#ffffff' : '#e2e8f0';
        ctx.fillText(node.name, node.x, node.y);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [skills]);

  return (
    <div className="skills-matrix-container">
      <canvas ref={canvasRef} className="skills-matrix-canvas" />
    </div>
  );
}
