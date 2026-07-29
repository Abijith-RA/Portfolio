/**
 * ==============================================================================
 * Dedicated Projects Page Component (src/components/ProjectsPage.jsx)
 * ==============================================================================
 * Purpose: Interactive, 3D-enhanced standalone page displaying all projects 
 *          fetched dynamically from Supabase. Supports filtering by Project Type 
 *          (e.g., College Project, Personal Project), Category, and Search query.
 * ==============================================================================
 */

import { useState, useMemo } from 'react';
import {
  FolderGit2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  UserCheck,
  Building2,
  Code,
  Box,
  Layers,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { use3DTiltCard } from '../hooks/use3DTiltCard';

// Helper to pick appropriate project type badge icon
function getProjectTypeBadge(typeStr = '') {
  if (!typeStr) return null;
  const t = typeStr.toLowerCase();
  if (t.includes('college') || t.includes('academic') || t.includes('university') || t.includes('degree') || t.includes('school')) {
    return (
      <span className="project-type-pill college">
        <GraduationCap size={13} />
        <span>{typeStr}</span>
      </span>
    );
  }
  if (t.includes('company') || t.includes('work') || t.includes('corporate') || t.includes('industry') || t.includes('job') || t.includes('client') || t.includes('professional') || t.includes('organization')) {
    return (
      <span className="project-type-pill company">
        <Building2 size={13} />
        <span>{typeStr}</span>
      </span>
    );
  }
  if (t.includes('research') || t.includes('ai') || t.includes('ml') || t.includes('lab') || t.includes('paper')) {
    return (
      <span className="project-type-pill research">
        <Sparkles size={13} />
        <span>{typeStr}</span>
      </span>
    );
  }
  return (
    <span className="project-type-pill personal">
      <UserCheck size={13} />
      <span>{typeStr}</span>
    </span>
  );
}

function Project3DCard({ project }) {
  const { isHovered, tiltProps } = use3DTiltCard(8, 12);

  const fallbackImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      ref={tiltProps.ref}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={tiltProps.style}
      className={`project-page-card-3d ${isHovered ? 'hovered' : ''}`}
    >
      {/* Top Banner Image with Glass Overlay */}
      <div className="card-image-wrapper">
        <img
          src={project.image_url || fallbackImage}
          alt={project.title}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
        <div className="card-image-overlay" />
        
        {/* Project Type Badge (e.g. College, Personal, Company, Research) */}
        <div className="card-type-badge-top">
          {getProjectTypeBadge(project.project_type || project.status || project.context || project.type)}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        <div className="card-header-row">
          <span className="card-category-tag">{project.category || 'System'}</span>
          {project.start_year && (
            <span className="card-year-badge">{project.start_year}</span>
          )}
        </div>

        <h3 className="card-title">{project.title}</h3>
        <p className="card-description">{project.description}</p>

        {/* Tech Stack Pills */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="tech-stack-container">
            {project.tech_stack.map((tech, idx) => (
              <span key={idx} className="tech-pill">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Card Action Buttons */}
        <div className="card-actions">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn-outline"
            >
              <GithubIcon size={15} />
              <span>Source Code</span>
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn-primary"
            >
              <span>Live Demo</span>
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTypeLabel(val) {
  if (!val || typeof val !== 'string') return 'Personal Project';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('college') || lower.includes('academic') || lower.includes('university') || lower.includes('degree') || lower.includes('school')) {
    return 'College Project';
  }
  if (lower.includes('company') || lower.includes('work') || lower.includes('corporate') || lower.includes('industry') || lower.includes('client') || lower.includes('job') || lower.includes('professional')) {
    return 'Company Project';
  }
  if (lower.includes('research') || lower.includes('lab') || lower.includes('paper')) {
    return 'Research Project';
  }
  if (lower.includes('personal') || lower.includes('self')) {
    return 'Personal Project';
  }

  return trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export default function ProjectsPage({ projects = [], onNavigateHome }) {
  const [selectedType, setSelectedType] = useState('All');

  const allProjects = useMemo(() => {
    return Array.isArray(projects) ? projects : [];
  }, [projects]);

  // Extract unique project types (e.g. All, College Project, Personal Project)
  const projectTypes = useMemo(() => {
    const typesSet = new Set(
      allProjects.map((p) => formatTypeLabel(p.project_type || p.status || p.context || p.type)).filter(Boolean)
    );
    return ['All', ...Array.from(typesSet)];
  }, [allProjects]);

  // Filter projects based on selected type tab
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const pType = formatTypeLabel(project.project_type || project.status || project.context || project.type);
      return selectedType === 'All' || pType === selectedType;
    });
  }, [allProjects, selectedType]);

  return (
    <div className="projects-page-wrapper">
      {/* Top Header Navigation */}
      <header className="projects-page-header">
        <div className="projects-header-container">
          <button
            type="button"
            className="skills-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={18} />
            <span>Back to Portfolio</span>
          </button>

          <div className="projects-header-title-block">
            <h1 className="projects-page-title">Projects & Deployments</h1>
          </div>

          {/* Minimal Type Filter Tabs Bar */}
          {projectTypes.length > 1 && (
            <div className="projects-controls-bar">
              <div className="skills-category-tabs">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`skills-tab-btn ${selectedType === type ? 'is-active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'All' ? <Box size={14} /> : <Layers size={14} />}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="projects-page-content">
        <div className="projects-page-grid-container">
          {filteredProjects.length === 0 ? (
            <div className="skills-empty-state">
              <FolderGit2 size={48} className="empty-icon" />
              <h3>No projects found in this category</h3>
              <p>Select another project filter tab above to view projects.</p>
              <button
                className="btn-primary-glow"
                onClick={() => setSelectedType('All')}
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="projects-auto-grid">
              {filteredProjects.map((project) => (
                <Project3DCard key={project.id || project.title} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
