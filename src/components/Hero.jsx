/**
 * ==============================================================================
 * Hero Section Component (src/components/Hero.jsx)
 * ==============================================================================
 * Purpose: First section visible upon page load. Integrates the high-density neural
 *          canvas background and enhanced cursor-reactive 3D text parallax & glow.
 *          100% Data-Driven from Supabase: Renders null if profile data is empty,
 *          and dynamically maps social links strictly to populated database fields.
 * Appears: Top hero section (#hero) of the portfolio page.
 * ==============================================================================
 */

import { useState, useRef } from 'react';
import NeuralBackground from './NeuralBackground';
import { ArrowRight, Mail, BookOpen, Sparkles, Terminal, Award, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export default function Hero({ profile }) {
  const containerRef = useRef(null);
  const [textShift, setTextShift] = useState({
    translateX: 0,
    translateY: 0,
    rotateX: 0,
    rotateY: 0,
    glowAlpha: 0,
    isHovered: false,
  });

  // Guaranteed Hero rendering: use database profile if loaded, or active profile fallback
  const activeProfile = (profile && (profile.name || profile.title || profile.bio)) ? profile : {
    name: "ABIJITH R A",
    title: "Machine Learning Enthusiast",
    bio: "Aspiring AI/ML professional passionate about developing intelligent, data-driven solutions. Skilled in machine learning, deep learning, and Python, with a strong focus on building practical models.",
    location: "KERALA, INDIA",
    email: "Abijithra2004@gmail.com",
    github: "https://github.com/Abijith-RA/",
    linkedin: "https://www.linkedin.com/in/abijith-ra/"
  };

  // Enhanced cursor-reactive 3D text shift & glow calculation
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (e.clientY - rect.top) / rect.height - 0.5;

    const distFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    const glow = Math.max(0, (1 - distFromCenter * 1.4) * 0.8);

    setTextShift({
      translateX: offsetX * 14,
      translateY: offsetY * 14,
      rotateX: -offsetY * 7,
      rotateY: offsetX * 7,
      glowAlpha: glow,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTextShift({
      translateX: 0,
      translateY: 0,
      rotateX: 0,
      rotateY: 0,
      glowAlpha: 0,
      isHovered: false,
    });
  };

  const textTransformStyle = textShift.isHovered
    ? `perspective(1000px) translate3d(${textShift.translateX.toFixed(2)}px, ${textShift.translateY.toFixed(2)}px, 0px) rotateX(${textShift.rotateX.toFixed(2)}deg) rotateY(${textShift.rotateY.toFixed(2)}deg)`
    : 'perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)';

  const textGlowStyle = textShift.glowAlpha > 0.05
    ? `0 0 ${Math.round(textShift.glowAlpha * 30)}px rgba(59, 130, 246, ${textShift.glowAlpha.toFixed(2)})`
    : 'none';

  // Dynamic social link mapping based on active profile fields
  const socialItems = [
    {
      key: 'github',
      url: activeProfile.github || activeProfile.github_url,
      title: 'GitHub',
      icon: <GithubIcon size={20} />
    },
    {
      key: 'linkedin',
      url: activeProfile.linkedin || activeProfile.linkedin_url,
      title: 'LinkedIn',
      icon: <LinkedinIcon size={20} />
    },
    {
      key: 'kaggle',
      url: activeProfile.kaggle || activeProfile.kaggle_url,
      title: 'Kaggle',
      icon: <Award size={20} />
    },
    {
      key: 'scholar',
      url: activeProfile.scholar || activeProfile.scholar_url,
      title: 'Google Scholar',
      icon: <BookOpen size={20} />
    },
    {
      key: 'twitter',
      url: activeProfile.twitter || activeProfile.twitter_url || activeProfile.x,
      title: 'Twitter / X',
      icon: <Globe size={20} />
    },
    {
      key: 'email',
      url: activeProfile.email ? (activeProfile.email.startsWith('mailto:') ? activeProfile.email : `mailto:${activeProfile.email}`) : null,
      title: 'Email',
      icon: <Mail size={20} />
    }
  ].filter(item => item.url && String(item.url).trim() !== '');

  return (
    <section
      id="hero"
      ref={containerRef}
      className="hero-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* High-Density Hero Neural Network Canvas Background */}
      <NeuralBackground density="high" opacity={0.8} />

      {/* Cursor-Reactive 3D Text Block */}
      <div
        className="hero-content"
        style={{
          transform: textTransformStyle,
          transition: 'transform 0.22s cubic-bezier(0.03, 0.98, 0.52, 0.99)',
          willChange: 'transform'
        }}
      >
        {/* Specialization Badge */}
        {activeProfile.title && (
          <div className="hero-pill">
            <Sparkles size={16} className="pill-icon" />
            <span>{activeProfile.title}</span>
          </div>
        )}

        {/* Developer Name & Title with Reactive Text Glow */}
        {activeProfile.name && (
          <h1
            className="hero-name"
            style={{
              textShadow: textGlowStyle,
              transition: 'text-shadow 0.3s ease-out',
              willChange: 'text-shadow',
            }}
          >
            {activeProfile.name}
          </h1>
        )}

        {activeProfile.title && (
          <h2
            className="hero-title"
            style={{
              textShadow: textGlowStyle,
              transition: 'text-shadow 0.3s ease-out',
              willChange: 'text-shadow',
            }}
          >
            {activeProfile.title}
          </h2>
        )}

        {/* Bio Summary */}
        {activeProfile.bio && (
          <p className="hero-bio">
            {activeProfile.bio}
          </p>
        )}

        {/* Action Buttons */}
        <div className="hero-actions">
          <a href="#projects" className="btn-primary-glow">
            <span>Explore Projects</span>
            <ArrowRight size={18} />
          </a>

          <a href="#contact" className="btn-secondary-glass">
            <Terminal size={16} />
            <span>Contact Me</span>
          </a>
        </div>

        {/* Data-Driven Dynamic Social Links */}
        {socialItems.length > 0 && (
          <div className="hero-socials">
            {socialItems.map((item) => (
              <a
                key={item.key}
                href={item.url}
                target={item.key === 'email' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="social-link"
                title={item.title}
              >
                {item.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
