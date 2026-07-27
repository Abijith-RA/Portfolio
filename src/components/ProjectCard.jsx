import { ExternalLink, Sparkles } from 'lucide-react';
import { GithubIcon } from './Icons';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ProjectCard({ project, index = 0 }) {
  const { isHovered, tiltProps } = use3DTiltCard(12, 14);

  // Directional staggered entrance reveal: odd items left, even items right
  const direction = index % 2 === 0 ? 'left' : 'right';
  const delay = (index % 4) * 100;
  const reveal = useScrollReveal({ direction, delay, duration: 550 });

  const combinedRef = (node) => {
    tiltProps.ref.current = node;
    reveal.ref.current = node;
  };

  const combinedStyle = {
    ...tiltProps.style,
    opacity: reveal.style.opacity,
    transform: reveal.isVisible ? tiltProps.style.transform : reveal.style.transform,
    transition: reveal.isVisible
      ? tiltProps.style.transition
      : reveal.style.transition,
    willChange: reveal.style.willChange
  };

  return (
    <article
      ref={combinedRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={combinedStyle}
      className={`project-card-3d ${isHovered ? 'hovered' : ''}`}
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
