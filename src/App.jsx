import { useState, useEffect, useCallback } from 'react';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useMagneticGlobal } from './hooks/useMagnetic';

import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsGrid from './components/ProjectsGrid';
import SkillsSection from './components/SkillsSection';
import SkillsPage from './components/SkillsPage';
import ExperienceTimeline from './components/ExperienceTimeline';
import EducationSection from './components/EducationSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

import './App.css';

export default function App() {
  // Activate site-wide GPU-accelerated magnetic cursor pull effect
  useMagneticGlobal();

  // Route view state ('home' | 'skills') synced with hash location
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#/skills') {
      return 'skills';
    }
    return 'home';
  });

  // Handle hash changes (e.g. browser back/forward buttons or direct links)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/skills') {
        setCurrentView('skills');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (currentView === 'skills') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  // Programmatic navigation handler
  const handleNavigate = useCallback((view, targetHash) => {
    if (view === 'skills') {
      setCurrentView('skills');
      window.location.hash = '#/skills';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (targetHash) {
        window.location.hash = targetHash;
        setTimeout(() => {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  // Fetch database data using the isolated useSupabaseData hook
  const {
    profile,
    projects,
    skills,
    experience,
    education,
    loading,
    submitContactMessage
  } = useSupabaseData();

  if (loading) {
    return (
      <div className="portfolio-app" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="pulse-dot" style={{ width: '12px', height: '12px' }}></span>
          Initializing AI Portfolio Systems...
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-app">
      {/* Custom AI Computer Vision Crosshair / Reticle Cursor */}
      <CustomCursor />

      {/* Top Navigation Header with View Routing */}
      <Navbar
        profile={profile}
        projects={projects}
        skills={skills}
        experience={experience}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Dynamic View Rendering: Standalone Skills Page vs Full Home Portfolio */}
      {currentView === 'skills' ? (
        <SkillsPage
          skills={skills}
          onNavigateHome={() => handleNavigate('home', '#hero')}
        />
      ) : (
        <div className="main-content">
          {/* 1. Hero Section */}
          <Hero profile={profile} />

          {/* 2. Featured AI/ML Projects Grid */}
          <ProjectsGrid projects={projects} />

          {/* 3. Skills & Proficiencies Overview */}
          <SkillsSection
            skills={skills}
            onNavigateSkills={() => handleNavigate('skills')}
          />

          {/* 4. Career Experience Timeline */}
          <ExperienceTimeline experience={experience} />

          {/* 5. Education & Academic Background */}
          <EducationSection education={education} />

          {/* 6. Interactive Contact Form */}
          <ContactSection profile={profile} submitContactMessage={submitContactMessage} />
        </div>
      )}

      {/* Page Footer */}
      <Footer profile={profile} />
    </div>
  );
}
