import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

function StatCardWithTilt({ stat, index = 0 }) {
  const { isHovered, tiltProps } = use3DTiltCard(6, 8);
  const direction = index % 2 === 0 ? 'left' : 'right';
  const delay = (index % 4) * 90;
  const reveal = useScrollReveal({ direction, delay, duration: 500 });

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
      className={`stat-card ${isHovered ? 'hovered' : ''}`}
    >
      <span className="stat-value">{stat.value}</span>
      <span className="stat-label">{stat.label}</span>
    </div>
  );
}

function AboutBioCardWithTilt({ profile }) {
  const { isHovered, tiltProps } = use3DTiltCard(8, 12);
  const reveal = useScrollReveal({ direction: 'up', delay: 100, duration: 600 });

  const combinedRef = (node) => {
    tiltProps.ref.current = node;
    reveal.ref.current = node;
  };

  const combinedStyle = {
    ...tiltProps.style,
    opacity: reveal.style.opacity,
    transform: reveal.isVisible ? tiltProps.style.transform : reveal.style.transform,
    transition: reveal.isVisible ? tiltProps.style.transition : reveal.style.transition,
    willChange: reveal.style.willChange,
    maxWidth: '900px',
    margin: '0 auto'
  };

  const bioText = profile?.bio || "Machine Learning Engineer & AI Specialist passionate about developing intelligent, data-driven solutions.";
  const statsArray = (profile?.stats && Array.isArray(profile.stats)) ? profile.stats : [];

  return (
    <div
      ref={combinedRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseLeave={tiltProps.onMouseLeave}
      style={combinedStyle}
      className={`about-bio-card ${isHovered ? 'hovered' : ''}`}
    >
      <p className="bio-paragraph">{bioText}</p>

      {/* Metric Stats Banner */}
      {statsArray.length > 0 && (
        <div className="stats-grid" style={{ marginTop: '2rem' }}>
          {statsArray.map((stat, idx) => (
            <StatCardWithTilt key={idx} stat={stat} index={idx} />
          ))}
        </div>
      )}

      {/* Integrated Contact Access Point */}
      <div className="about-contact-bar" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className="about-contact-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s ease' }}>
              <Mail size={16} style={{ color: 'var(--accent)' }} />
              <span>{profile.email}</span>
            </a>
          )}
          {profile?.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <MapPin size={16} style={{ color: 'var(--accent)' }} />
              <span>{profile.location}</span>
            </span>
          )}
        </div>

        <a href="#contact" className="btn-primary-glow" style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem', textDecoration: 'none' }}>
          <MessageSquare size={14} />
          <span>Get in Touch</span>
        </a>
      </div>
    </div>
  );
}

export default function AboutSection({ profile }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  return (
    <SectionWrapper id="about">
      <div className="section-header">
        <span className="section-subtitle">// ABOUT ME</span>
        <h2 className="section-title" {...headingStyleProps}>
          About Me
        </h2>
      </div>

      {/* Profile Bio Card & Metric Stats */}
      <AboutBioCardWithTilt profile={profile} />
    </SectionWrapper>
  );
}
