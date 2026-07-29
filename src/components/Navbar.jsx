/**
 * ==============================================================================
 * Navigation Bar Component (src/components/Navbar.jsx)
 * ==============================================================================
 * Purpose: Top sticky header featuring brand logo, dynamic section navigation links,
 *          and action CTA button with multi-view routing support.
 * Appears: Fixed at the top of the portfolio website on all screen sizes.
 * ==============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { Cpu, Menu, X, Zap } from 'lucide-react';

export default function Navbar({ profile, projects, skills, experience, onNavigate, currentView = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute nav links (About, Projects, Skills, Experience, Contact)
  const navLinks = useMemo(() => {
    const links = [];
    links.push({ id: 'about', label: 'About', href: '#hero' });
    links.push({ id: 'projects', label: 'Projects', href: '#/projects' });
    links.push({ id: 'skills', label: 'Skills', href: '#/skills' });
    if (experience && experience.length > 0) links.push({ id: 'experience', label: 'Experience', href: '#experience' });
    links.push({ id: 'contact', label: 'Contact', href: '#contact' });
    return links;
  }, [experience]);

  const handleLinkClick = (e, link) => {
    if (link.id === 'skills') {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (onNavigate) {
        onNavigate('skills');
      } else {
        window.location.hash = '#/skills';
      }
    } else if (link.id === 'projects') {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (onNavigate) {
        onNavigate('projects');
      } else {
        window.location.hash = '#/projects';
      }
    } else {
      if (currentView !== 'home' && onNavigate) {
        onNavigate('home', link.href);
      }
      setMobileMenuOpen(false);
    }
  };

  const handleBrandClick = (e) => {
    if (currentView !== 'home' && onNavigate) {
      e.preventDefault();
      onNavigate('home', '#hero');
    }
  };

  return (
    <nav className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Identity */}
        <a href="#hero" className="nav-brand" onClick={handleBrandClick}>
          <div className="brand-icon">
            <img src="/favicon.png" alt="AbijithRA Logo" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
          </div>
          <span className="brand-text">
            {profile?.name ? profile.name.toUpperCase() : 'PORTFOLIO'}
          </span>
        </a>

        {/* Dynamic Desktop Navigation Links */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link ${currentView === 'skills' && link.id === 'skills' ? 'active-link' : ''}`}
              onClick={(e) => handleLinkClick(e, link)}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Button */}
        <div className="nav-actions">
          <a
            href="#contact"
            className="btn-nav-contact"
            onClick={(e) => handleLinkClick(e, { id: 'contact', href: '#contact' })}
          >
            <Zap size={14} />
            <span>Let's Connect</span>
          </a>

          {/* Mobile Drawer Toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, link)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
