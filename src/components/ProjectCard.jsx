/**
 * ==============================================================================
 * Project Card Component with 3D Tilt Effect (src/components/ProjectCard.jsx)
 * ==============================================================================
 * Purpose: Displays an individual project with an interactive 3D tilt-on-hover
 *          effect, tech stack badges, category label, status indicator, and project links.
 * Appears: Used inside ProjectsGrid.jsx to populate the portfolio project showcase.
 * ==============================================================================
 */

import { useState, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function ProjectCard({ project }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });

  // 3D Tilt-on-hover math calculation relative to card center
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate cursor position relative to center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Maximum tilt angles (degrees)
    const maxTilt = 12;
    const rotateY = mouseX * maxTilt;
    const rotateX = -mouseY * maxTilt;

    setTilt({ rotateX, rotateY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  const transformStyle = tilt.isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

  return (
    <article
      ref={cardRef}
      className={`project-card-3d ${tilt.isHovered ? 'hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {/* Card Header Image / Visual */}
      <div className="card-image-wrapper">
        <img
          src={project.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'}
          alt={project.title}
          className="card-image"
          loading="lazy"
        />
        <div className="card-image-overlay" />

        {/* Status Badge */}
        {project.status && (
          <span className="card-status-badge">
            <Sparkles size={12} />
            <span>{project.status}</span>
          </span>
        )}
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{project.category || 'AI / ML Project'}</span>
        </div>

        <h3 className="card-title">{project.title}</h3>
        <p className="card-description">{project.description}</p>

        {/* Tech Stack Pills */}
        {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <div className="tech-stack-container">
            {project.tech_stack.map((tech, idx) => (
              <span key={idx} className="tech-pill">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Links */}
        <div className="card-actions">
          {(project.github || project.github_url || project.repo_url) && (
            <a
              href={project.github || project.github_url || project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn-outline"
              aria-label="View Source Code"
            >
              <GithubIcon size={16} />
              <span>Source</span>
            </a>
          )}
          {(project.link || project.demo_url || project.live_url || project.url) && (
            <a
              href={project.link || project.demo_url || project.live_url || project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn-primary"
              aria-label="View Live Demo"
            >
              <ExternalLink size={16} />
              <span>Demo</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
