/**
 * ==============================================================================
 * Skills Section Component (src/components/SkillsSection.jsx)
 * ==============================================================================
 * Purpose: Categorizes and displays AI/ML technical skills, frameworks, and proficiency
 *          percentages fetched from the Supabase skills table with 3D tilt-on-hover interaction.
 * Appears: Displayed in the #skills section of the portfolio page.
 * ==============================================================================
 */

import { useState, useRef, useMemo } from 'react';
import { Cpu, Cloud, Code, Terminal } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

function SkillCategoryCardWithTilt({ category, items, icon }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 8;
    setTilt({
      rotateX: -mouseY * maxTilt,
      rotateY: mouseX * maxTilt,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  const transformStyle = tilt.isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

  return (
    <div
      ref={cardRef}
      className={`skill-category-card-3d ${tilt.isHovered ? 'hovered' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      <div className="category-header">
        <div className="category-icon">{icon}</div>
        <h3 className="category-name">{category}</h3>
      </div>

      <div className="skill-items-list">
        {items.map((skill) => (
          <div key={skill.id || skill.name} className="skill-item">
            <div className="skill-info">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-percentage">{skill.proficiency}%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillsSection({ skills }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  if (!skills || skills.length === 0) {
    return null;
  }

  // Group skills by category
  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill) => {
      const cat = skill.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});
  }, [skills]);

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
        {Object.entries(groupedSkills).map(([category, items]) => (
          <SkillCategoryCardWithTilt
            key={category}
            category={category}
            items={items}
            icon={getCategoryIcon(category)}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
