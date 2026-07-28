import { Briefcase, Calendar, MapPin } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

function TimelineCardWithTilt({ item, index = 0 }) {
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

  return (
    <div
      ref={combinedRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={combinedStyle}
      className={`timeline-card ${isHovered ? 'hovered' : ''}`}
    >
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
  );
}

export default function ExperienceTimeline({ experience }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  if (!experience || !Array.isArray(experience) || experience.length === 0) {
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
            <TimelineCardWithTilt item={item} index={idx} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
