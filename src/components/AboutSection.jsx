/**
 * ==============================================================================
 * About Section Component (src/components/AboutSection.jsx)
 * ==============================================================================
 * Purpose: Presents developer profile details and metric statistics fetched directly
 *          from the Supabase `profile` table.
 *          Strictly Data-Driven: Returns null if no profile bio/stats exist in database.
 * Appears: Displayed in the #about section directly below the Hero header.
 * ==============================================================================
 */

import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

export default function AboutSection({ profile }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

  // Return null if table/profile is empty so no container renders
  if (!profile || (!profile.bio && (!profile.stats || profile.stats.length === 0))) {
    return null;
  }

  return (
    <SectionWrapper id="about">
      <div className="section-header">
        <span className="section-subtitle">// ABOUT ME</span>
        <h2 className="section-title" {...headingStyleProps}>
          About & Specialization
        </h2>
      </div>

      {/* Profile Bio Card & Metric Stats fetched from Supabase */}
      <div className="about-bio-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {profile.bio && <p className="bio-paragraph">{profile.bio}</p>}

        {/* Metric Stats Banner */}
        {profile.stats && Array.isArray(profile.stats) && profile.stats.length > 0 && (
          <div className="stats-grid" style={{ marginTop: '2rem' }}>
            {profile.stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
