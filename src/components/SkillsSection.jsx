import { useMemo } from 'react';
import { Cpu, Cloud, Code, Terminal, ArrowRight, Brain, Server, Sparkles, Globe, Database, Wrench } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

function getSkillIcon(skillName = '', categoryName = '') {
  const name = skillName.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (name.includes('pytorch') || name.includes('tensorflow') || name.includes('model') || cat.includes('ai') || cat.includes('ml')) {
    return <Brain size={18} className="skill-mini-icon" />;
  }
  if (name.includes('llm') || name.includes('rag') || name.includes('gpt') || name.includes('ai')) {
    return <Sparkles size={18} className="skill-mini-icon" />;
  }
  if (name.includes('cuda') || name.includes('gpu') || name.includes('tensorrt')) {
    return <Cpu size={18} className="skill-mini-icon" />;
  }
  if (name.includes('react') || name.includes('vue') || name.includes('next') || name.includes('front') || cat.includes('front')) {
    return <Globe size={18} className="skill-mini-icon" />;
  }
  if (name.includes('python') || name.includes('c++') || name.includes('node') || name.includes('fastapi') || cat.includes('back')) {
    return <Server size={18} className="skill-mini-icon" />;
  }
  if (name.includes('docker') || name.includes('kubernetes') || name.includes('cloud') || cat.includes('cloud')) {
    return <Cloud size={18} className="skill-mini-icon" />;
  }
  if (name.includes('database') || name.includes('sql') || name.includes('postgres') || name.includes('supabase')) {
    return <Database size={18} className="skill-mini-icon" />;
  }
  return <Wrench size={18} className="skill-mini-icon" />;
}

function SkillCategoryCardWithTilt({ category, items, icon, index = 0, onNavigateSkills }) {
  const { isHovered, tiltProps } = use3DTiltCard(8, 12);
  const direction = index % 2 === 0 ? 'left' : 'right';
  const delay = (index % 4) * 90;
  const reveal = useScrollReveal({ direction, delay, duration: 550 });

  const combinedRef = (node) => {
    tiltProps.ref.current = node;
    reveal.ref.current = node;
  };

  const combinedStyle = {
    ...tiltProps.style,
    opacity: reveal.style.opacity,
    transform: reveal.isVisible ? tiltProps.style.transform : reveal.style.transform,
    transition: reveal.isVisible ? tiltProps.style.transition : reveal.style.transition,
    willChange: reveal.style.willChange
  };

  return (
    <div
      ref={combinedRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={combinedStyle}
      className={`skill-category-card-3d ${isHovered ? 'hovered' : ''}`}
      onClick={onNavigateSkills}
    >
      <div className="category-header">
        <div className="category-icon">{icon}</div>
        <h3 className="category-name">{category}</h3>
        <span className="category-count-pill">{items.length} Tech</span>
      </div>

      <div className="skill-badges-wrapper">
        {items.map((skill) => (
          <div key={skill.id || skill.name} className="skill-badge-card">
            {getSkillIcon(skill.name, category)}
            <span className="skill-badge-name">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillsSection({ skills, onNavigateSkills }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    if (!skills || !Array.isArray(skills)) return {};
    return skills.reduce((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

  if (!skills || skills.length === 0) {
    return null;
  }

  const getCategoryIcon = (categoryName) => {
    if (categoryName.toLowerCase().includes('core') || categoryName.toLowerCase().includes('ai')) {
      return <Cpu size={20} />;
    }
    if (categoryName.toLowerCase().includes('cloud') || categoryName.toLowerCase().includes('ops')) {
      return <Cloud size={20} />;
    }
    if (categoryName.toLowerCase().includes('lang') || categoryName.toLowerCase().includes('tool')) {
      return <Code size={20} />;
    }
    return <Terminal size={20} />;
  };

  return (
    <SectionWrapper id="skills">
      <div className="section-header">
        <span className="section-subtitle">// TECHNICAL STACK</span>
        <h2 className="section-title" {...headingStyleProps}>
          Skills & Proficiencies
        </h2>
        <p className="section-description">
          Frameworks, deep learning toolkits, and infrastructure tools utilized in production.
        </p>
      </div>

      <div className="skills-grid">
        {Object.entries(groupedSkills).map(([category, items], idx) => (
          <SkillCategoryCardWithTilt
            key={category}
            category={category}
            items={items}
            icon={getCategoryIcon(category)}
            index={idx}
            onNavigateSkills={onNavigateSkills}
          />
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button
          type="button"
          className="btn-primary-glow"
          onClick={onNavigateSkills}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <span>Explore Full Skills Directory</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </SectionWrapper>
  );
}
