import { Cpu, ArrowUp, Mail, BookOpen, Award } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export default function Footer({ profile }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { key: 'github', url: profile?.github || profile?.github_url, label: 'GitHub', icon: <GithubIcon size={18} /> },
    { key: 'linkedin', url: profile?.linkedin || profile?.linkedin_url, label: 'LinkedIn', icon: <LinkedinIcon size={18} /> },
    { key: 'kaggle', url: profile?.kaggle || profile?.kaggle_url, label: 'Kaggle', icon: <Award size={18} /> },
    { key: 'scholar', url: profile?.scholar || profile?.scholar_url, label: 'Google Scholar', icon: <BookOpen size={18} /> },
    { key: 'email', url: profile?.email ? (profile.email.startsWith('mailto:') ? profile.email : `mailto:${profile.email}`) : null, label: 'Email', icon: <Mail size={18} /> },
  ].filter((item) => item.url && String(item.url).trim() !== '');

  const nameToDisplay = profile?.name || 'AI Developer Portfolio';

  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-icon">
            <Cpu size={20} />
          </div>
          <span className="brand-text">{nameToDisplay.toUpperCase()}</span>
        </div>



        <div className="footer-actions">
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target={link.key === 'email' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="footer-link"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}

          <button onClick={scrollToTop} className="btn-scroll-top" aria-label="Back to top">
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
