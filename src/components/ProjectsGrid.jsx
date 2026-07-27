/**
 * ==============================================================================
 * Projects Grid Component (src/components/ProjectsGrid.jsx)
 * ==============================================================================
 * Purpose: Container section that receives the projects array from useSupabaseData,
 *          provides category filtering, and renders an auto-aligning grid of ProjectCard items.
 * Appears: Displayed in the #projects section of the portfolio page.
 * ==============================================================================
 */

import { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

export default function ProjectsGrid({ projects }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  if (!projects || projects.length === 0) {
    return null;
  }

  // Extract unique categories dynamically from projects list
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects by active tab selection
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <SectionWrapper id="projects">
      <div className="section-header">
        <span className="section-subtitle">// FEATURED REPOSITORIES & SYSTEMS</span>
        <h2 className="section-title" {...headingStyleProps}>
          AI / ML Projects & Deployments
        </h2>
        <p className="section-description">
          Hover over any card to trigger the 3D perspective effect. Select categories below to filter by specialization.
        </p>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 2 && (
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* Responsive Auto-Fit Projects Grid */}
      <div className="projects-auto-grid">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id || project.title} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
