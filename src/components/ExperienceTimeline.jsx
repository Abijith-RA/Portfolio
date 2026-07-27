/**
 * ==============================================================================
 * Experience Timeline Component (src/components/ExperienceTimeline.jsx)
 * ==============================================================================
 * Purpose: Renders a vertical career timeline showcasing past engineering roles,
 *          research history, and key milestones fetched from the Supabase experience table.
 * Appears: Displayed in the #experience section of the portfolio page.
 * ==============================================================================
 */

import { Briefcase, Calendar, MapPin } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

export default function ExperienceTimeline({ experience }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  if (!experience || experience.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="experience">
      <div className="section-header">
        <span className="section-subtitle">// CAREER MILESTONES</span>
        <h2 className="section-title" {...headingStyleProps}>
          Professional Experience
        </h2>
        <p className="section-description">
          Track record of delivering production machine learning systems and research solutions.
        </p>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-line" />

        {experience.map((item, idx) => (
          <div key={item.id || idx} className="timeline-item">
            {/* Node Icon */}
            <div className="timeline-node">
              <Briefcase size={16} />
            </div>

            {/* Content Card */}
            <div className="timeline-card">
              <div className="timeline-card-header">
                <div>
                  <h3 className="timeline-role">{item.role}</h3>
                  <h4 className="timeline-company">{item.company}</h4>
                </div>

                <div className="timeline-meta">
                  <span className="meta-pill">
                    <Calendar size={13} />
                    <span>{item.duration}</span>
                  </span>
                  {item.location && (
                    <span className="meta-pill">
                      <MapPin size={13} />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="timeline-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
