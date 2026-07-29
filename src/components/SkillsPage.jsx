import { useState, useMemo } from 'react';
import {
  Cpu,
  Cloud,
  Code,
  Brain,
  Server,
  Layers,
  Sparkles,
  Search,
  ArrowLeft,
  CheckCircle2,
  Wrench,
  Globe,
  Database,
  ShieldCheck,
  GitBranch,
  Box
} from 'lucide-react';
import { use3DTiltCard } from '../hooks/use3DTiltCard';

// Helper to determine the best matching tech icon based on skill name & category
function getSkillIcon(skillName = '', categoryName = '') {
  const name = skillName.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (name.includes('pytorch') || name.includes('tensorflow') || name.includes('model') || cat.includes('ai') || cat.includes('ml')) {
    return <Brain size={22} className="skill-icon-accent" />;
  }
  if (name.includes('llm') || name.includes('rag') || name.includes('gpt') || name.includes('ai')) {
    return <Sparkles size={22} className="skill-icon-accent" />;
  }
  if (name.includes('cuda') || name.includes('gpu') || name.includes('tensorrt') || name.includes('hardware')) {
    return <Cpu size={22} className="skill-icon-accent" />;
  }
  if (name.includes('react') || name.includes('vue') || name.includes('next') || name.includes('frontend') || cat.includes('front')) {
    return <Globe size={22} className="skill-icon-accent" />;
  }
  if (name.includes('python') || name.includes('c++') || name.includes('node') || name.includes('fastapi') || cat.includes('back')) {
    return <Server size={22} className="skill-icon-accent" />;
  }
  if (name.includes('docker') || name.includes('kubernetes') || name.includes('aws') || cat.includes('cloud') || cat.includes('infra')) {
    return <Cloud size={22} className="skill-icon-accent" />;
  }
  if (name.includes('database') || name.includes('sql') || name.includes('postgres') || name.includes('supabase')) {
    return <Database size={22} className="skill-icon-accent" />;
  }
  if (name.includes('git') || name.includes('ci/cd') || name.includes('pipeline')) {
    return <GitBranch size={22} className="skill-icon-accent" />;
  }
  if (cat.includes('tool') || cat.includes('lang')) {
    return <Wrench size={22} className="skill-icon-accent" />;
  }
  return <Code size={22} className="skill-icon-accent" />;
}

// Helper to assign category icon
function getCategoryIcon(catName = '') {
  const c = catName.toLowerCase();
  if (c.includes('ai') || c.includes('ml') || c.includes('core')) return <Brain size={20} />;
  if (c.includes('front')) return <Globe size={20} />;
  if (c.includes('back') || c.includes('server')) return <Server size={20} />;
  if (c.includes('cloud') || c.includes('infra') || c.includes('ops')) return <Cloud size={20} />;
  if (c.includes('tool') || c.includes('lang')) return <Wrench size={20} />;
  return <Layers size={20} />;
}

function SkillCard({ skill }) {
  const { isHovered, tiltProps } = use3DTiltCard(6, 8);
  const icon = getSkillIcon(skill.name, skill.category);

  return (
    <div
      ref={tiltProps.ref}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={tiltProps.style}
      className={`skills-page-card ${isHovered ? 'hovered' : ''}`}
    >
      <div className="skill-card-icon-box">
        {icon}
      </div>

      <div className="skill-card-body">
        <h4 className="skill-card-title">{skill.name}</h4>
        {skill.category && (
          <span className="skill-card-category-badge">{skill.category}</span>
        )}
      </div>
    </div>
  );
}

export default function SkillsPage({ skills = [], onNavigateHome }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const activeSkills = useMemo(() => {
    return Array.isArray(skills) ? skills : [];
  }, [skills]);

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set(activeSkills.map(s => s.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [activeSkills]);

  // Filter skills by category & search term
  const filteredSkills = useMemo(() => {
    return activeSkills.filter(skill => {
      const matchCat = selectedCategory === 'All' || (skill.category || 'General') === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeSkills, selectedCategory, searchQuery]);

  // Group filtered skills by category for organized rendering
  const groupedSkills = useMemo(() => {
    return filteredSkills.reduce((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [filteredSkills]);

  return (
    <div className="skills-page-wrapper">
      {/* Top Page Header */}
      <header className="skills-page-header">
        <div className="skills-header-container">
          <button
            type="button"
            className="skills-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={18} />
            <span>Back to Portfolio</span>
          </button>

          <div className="skills-header-title-block">
            <h1 className="skills-page-title">Technical Mastery & Stack</h1>
          </div>

          {/* Minimal Category Filter Pills */}
          <div className="skills-controls-bar">
            <div className="skills-category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`skills-tab-btn ${selectedCategory === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? <Box size={14} /> : getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Body */}
      <main className="skills-page-content">
        <div className="skills-grid-container">
          {Object.keys(groupedSkills).length === 0 ? (
            <div className="skills-empty-state">
              <ShieldCheck size={48} className="empty-icon" />
              <h3>No matching technologies found</h3>
              <p>Try searching for a different keyword or select another category filter.</p>
              <button className="btn-primary-glow" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            Object.entries(groupedSkills).map(([catName, items]) => (
              <section key={catName} className="skills-category-section">
                <div className="skills-category-header">
                  <div className="category-title-wrapper">
                    <div className="cat-icon-badge">{getCategoryIcon(catName)}</div>
                    <h2 className="skills-category-title">{catName}</h2>
                  </div>
                  <span className="skills-count-badge">{items.length} {items.length === 1 ? 'Skill' : 'Skills'}</span>
                </div>

                <div className="skills-cards-grid">
                  {items.map((skill) => (
                    <SkillCard key={skill.id || skill.name} skill={skill} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
