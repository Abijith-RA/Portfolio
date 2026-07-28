import { useMemo } from 'react';
import SectionWrapper from './SectionWrapper';
import { ArrowRight, Code2, Cpu, Terminal, Layers } from 'lucide-react';
import { useInteractiveText } from '../hooks/useInteractiveText';
import SkillBubblesArena from './SkillBubblesArena';

export default function SkillsSection({ skills }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  return (
    <SectionWrapper id="skills">
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title" {...headingStyleProps}>
          Skills
        </h2>
        <p className="section-description">
          Core programming languages, data science frameworks, and development toolkits.
        </p>
      </div>

      {/* 2D Interactive Physics Floating Skill Bubbles Arena */}
      <SkillBubblesArena skills={skills} />
    </SectionWrapper>
  );
}
