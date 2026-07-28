/**
 * ==============================================================================
 * Education Section Component (src/components/EducationSection.jsx)
 * ==============================================================================
 * Purpose: Renders academic degrees, universities, and research specializations
 *          fetched directly from the Supabase `education` table.
 *          Strictly Data-Driven: Returns null if no education records exist in database.
 * Appears: Displayed in the #education section between Experience and Contact.
 * ==============================================================================
 */

import { GraduationCap, Calendar, Award } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

function EducationCardWithTilt({ item, index = 0 }) {
  const { isHovered, tiltProps } = use3DTiltCard(8, 12);
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

  const yearsFormatted = () => {
    if (item.start_year && item.end_year) {
      return `${item.start_year} - ${item.end_year}`;
    }
    return item.start_year || item.end_year || item.duration || '';
  };

  return (
    <div
      ref={combinedRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={combinedStyle}
      className={`timeline-card education-card ${isHovered ? 'hovered' : ''}`}
    >
      <div className="timeline-card-header">
        <div>
          <h3 className="timeline-role" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>{item.degree}</span>
          </h3>
          {item.field_of_study && (
            <h4 className="timeline-company" style={{ marginTop: '0.2rem' }}>
              {item.field_of_study}
            </h4>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem', fontWeight: 500 }}>
            {item.institution}
          </div>
        </div>

        {yearsFormatted() && (
          <div className="timeline-meta">
            <span className="meta-pill">
              <Calendar size={13} />
              <span>{yearsFormatted()}</span>
            </span>
          </div>
        )}
      </div>

      {item.description && (
        <p className="timeline-description" style={{ marginTop: '1rem' }}>
          {item.description}
        </p>
      )}
    </div>
  );
}

export default function EducationSection({ education }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  // Strict conditional rendering: if empty or undefined, render nothing
  if (!education || !Array.isArray(education) || education.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="education">
      <div className="section-header">
        <span className="section-subtitle">// ACADEMIC BACKGROUND</span>
        <h2 className="section-title" {...headingStyleProps}>
          Education & Qualifications
        </h2>
        <p className="section-description">
          Academic degrees and computer science foundations.
        </p>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-line" />

        {education.map((item, idx) => (
          <div key={item.id || idx} className="timeline-item">
            {/* Node Icon */}
            <div className="timeline-node">
              <Award size={16} />
            </div>

            {/* Content Card */}
            <EducationCardWithTilt item={item} index={idx} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
