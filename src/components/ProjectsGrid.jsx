import { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

export default function ProjectsGrid({ projects }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  // Extract unique categories dynamically from projects list
  const categories = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return ['All'];
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects by active tab selection
  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  if (!projects || projects.length === 0) {
    return null;
  }

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
        {filteredProjects.map((project, idx) => (
          <ProjectCard key={project.id || project.title} project={project} index={idx} />
        ))}
      </div>
    </SectionWrapper>
  );
}
