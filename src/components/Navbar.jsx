/**
 * ==============================================================================
 * Navigation Bar Component (src/components/Navbar.jsx)
 * ==============================================================================
 * Purpose: Top sticky header featuring brand logo, dynamic section navigation links,
 *          database connection status badge, and mobile responsive drawer toggle.
 * Appears: Fixed at the top of the portfolio website on all screen sizes.
 * ==============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { Cpu, Database, Menu, X, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Navbar({ isLiveDatabase, errorDetails, profile, projects, skills, experience }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute nav links
  const navLinks = useMemo(() => {
    const links = [];
    links.push({ label: 'About', href: '#about' });
    if (projects && projects.length > 0) links.push({ label: 'Projects', href: '#projects' });
    if (skills && skills.length > 0) links.push({ label: 'Skills', href: '#skills' });
    if (experience && experience.length > 0) links.push({ label: 'Experience', href: '#experience' });
    links.push({ label: 'Contact', href: '#contact' });
    return links;
  }, [projects, skills, experience]);

  return (
    <nav className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Brand Identity */}
        <a href="#hero" className="nav-brand">
          <div className="brand-icon">
            <Cpu size={22} />
          </div>
          <span className="brand-text">
            {profile?.name ? profile.name.toUpperCase() : 'PORTFOLIO'} <span className="brand-accent">// AI/ML</span>
          </span>
        </a>

        {/* Dynamic Desktop Navigation Links */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        {/* Database Status Pill & Action Button */}
        <div className="nav-actions" style={{ position: 'relative' }}>
          <div
            className={`db-status-pill ${isLiveDatabase ? 'connected' : 'mock'}`}
            onClick={() => setShowDbInfo(!showDbInfo)}
            style={{ cursor: 'pointer' }}
            title="Click for Supabase Database status & diagnostic guide"
          >
            <Database size={14} />
            <span>{isLiveDatabase ? 'Supabase Connected' : 'Database Offline'}</span>
          </div>

          {/* Database Connection Diagnostic Popover */}
          {showDbInfo && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: '0',
                width: '340px',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(56, 189, 248, 0.2)',
                zIndex: 1000,
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isLiveDatabase ? '#34d399' : '#fbbf24' }}>
                  {isLiveDatabase ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {isLiveDatabase ? 'Live Supabase Connected' : 'Supabase Setup / Offline'}
                </strong>
                <button
                  onClick={() => setShowDbInfo(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              {isLiveDatabase ? (
                <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
                  The application is directly synced with your live Supabase database. Any updates made in your table editor will reflect automatically upon refresh.
                </p>
              ) : (
                <div>
                  {errorDetails && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '0.5rem', marginBottom: '0.75rem', color: '#fca5a5', fontSize: '0.78rem', wordBreak: 'break-word' }}>
                      <strong>Notice:</strong> {errorDetails}
                    </div>
                  )}
                  <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontWeight: 600 }}>Quick Setup Checklist:</p>
                  <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    <li>Add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>.</li>
                    <li>Create <code>profile</code> table with columns: <code>name</code>, <code>title</code>, <code>bio</code>, <code>location</code>, <code>email</code>.</li>
                    <li>In Supabase &gt; Authentication/Policies, ensure RLS allows public SELECT read access for anon role.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <a href="#contact" className="btn-nav-contact">
            <Terminal size={14} />
            <span>Get in Touch</span>
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
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

