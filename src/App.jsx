import { Sparkles } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="fluid-container">
      {/* Header Bar */}
      <header className="navbar">
        <div className="brand-title">
          <Sparkles size={22} style={{ color: '#818cf8' }} />
          <span>My Portfolio</span>
        </div>
      </header>

      {/* Main Content Layout Container */}
      <main>
        {/* Main Hero Container */}
        <section className="hero-wrapper">
          <div className="hero-glow-effect"></div>
          <h1 className="gradient-heading">My Portfolio</h1>
        </section>

        {/* Responsive Auto-Aligning Grid Layout Placeholder */}
        <section className="auto-flow-grid">
          <div className="feature-card" style={{ minHeight: '12rem' }}></div>
          <div className="feature-card" style={{ minHeight: '12rem' }}></div>
          <div className="feature-card" style={{ minHeight: '12rem' }}></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-container">
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} My Portfolio
        </p>
      </footer>
    </div>
  );
}

export default App;
