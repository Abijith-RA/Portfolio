/**
 * ==============================================================================
 * Main Application Root (src/App.jsx)
 * ==============================================================================
 * Purpose: Central assembly component for the AI/ML Developer Portfolio.
 *          Retrieves profile, projects, skills, and experience data from the custom
 *          `useSupabaseData` hook and passes data to dedicated modular components.
 *          Integrates global magnetic cursor attraction physics hook (`useMagneticGlobal`)
 *          and custom AI Computer Vision targeting reticle cursor (`CustomCursor`).
 * ==============================================================================
 */

import { useSupabaseData } from './hooks/useSupabaseData';
import { useMagneticGlobal } from './hooks/useMagnetic';

// Component Imports (One component per file)
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ProjectsGrid from './components/ProjectsGrid';
import SkillsSection from './components/SkillsSection';
import ExperienceTimeline from './components/ExperienceTimeline';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

import './App.css';

export default function App() {
  // Activate site-wide GPU-accelerated magnetic cursor pull effect
  useMagneticGlobal();

  // Fetch database data using the isolated useSupabaseData hook
  const {
    profile,
    projects,
    skills,
    experience,
    loading,
    errorDetails,
    isLiveDatabase,
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

      {/* Top Navigation Header (Dynamic Nav Links & Database Status) */}
      <Navbar
        isLiveDatabase={isLiveDatabase}
        errorDetails={errorDetails}
        profile={profile}
        projects={projects}
        skills={skills}
        experience={experience}
      />

      {/* Main Page Body */}
      <div className="main-content">
        {/* 1. Hero Section */}
        <Hero profile={profile} />

        {/* 2. About Section */}
        <AboutSection profile={profile} />

        {/* 3. Featured AI/ML Projects Grid */}
        <ProjectsGrid projects={projects} />

        {/* 4. Skills & Proficiencies */}
        <SkillsSection skills={skills} />

        {/* 5. Career Experience Timeline */}
        <ExperienceTimeline experience={experience} />

        {/* 6. Interactive Contact Form */}
        <ContactSection profile={profile} submitContactMessage={submitContactMessage} />
      </div>

      {/* Page Footer */}
      <Footer profile={profile} />
    </div>
  );
}
