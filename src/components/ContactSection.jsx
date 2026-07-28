import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { use3DTiltCard } from '../hooks/use3DTiltCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Dedicated Magnetic Icon Component with Safe Travel Zone Architecture
 * Parent Container: 46px x 46px glass box with box-sizing: border-box.
 * Inner Translating Element: 28px x 28px centered via flex layout.
 * Safe Buffer Space: 18px total buffer (9px on all sides) >= 2 * maxShift (12px).
 * Ensures zero clipping or cutoff under max transform: translate3d(x, y) motion.
 */
function MagneticIcon({ children, strength = 0.25, maxShift = 6 }) {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    // Respect reduced motion & touch devices
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      // Invisible hover zone radius (75px)
      const hoverZone = 75;

      if (distance < hoverZone) {
        const pullFactor = 1 - distance / hoverZone;
        const moveX = Math.min(Math.max(dx * strength * pullFactor, -maxShift), maxShift);
        const moveY = Math.min(Math.max(dy * strength * pullFactor, -maxShift), maxShift);

        el.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0px)`;
        el.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
      } else {
        if (el.style.transform && el.style.transform !== 'translate3d(0px, 0px, 0px)') {
          el.style.transform = 'translate3d(0px, 0px, 0px)';
          el.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        }
      }
    };

    const handleMouseLeave = () => {
      if (el) {
        el.style.transform = 'translate3d(0px, 0px, 0px)';
        el.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, maxShift]);

  return (
    <div className="detail-icon-box">
      <div ref={innerRef} className="magnetic-icon-inner">
        {children}
      </div>
    </div>
  );
}

function ContactInfoCardWithTilt({ profile }) {
  const { isHovered, tiltProps } = use3DTiltCard(8, 12);
  const reveal = useScrollReveal({ direction: 'left', delay: 100, duration: 550 });
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = (e) => {
    tiltProps.onMouseMove(e);
    if (tiltProps.ref.current) {
      const rect = tiltProps.ref.current.getBoundingClientRect();
      setSpotlightPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      });
    }
  };

  const handleMouseLeave = () => {
    tiltProps.onMouseLeave();
    setSpotlightPos(prev => ({ ...prev, active: false }));
  };

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle}
      className={`contact-info-card ${isHovered ? 'hovered' : ''}`}
    >
      {/* Dynamic Cursor Spotlight Effect (z-index: 1) */}
      <div
        className="card-spotlight-overlay"
        style={{
          background: spotlightPos.active
            ? `radial-gradient(450px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(56, 189, 248, 0.18), rgba(59, 130, 246, 0.04) 40%, transparent 80%)`
            : 'none',
          opacity: spotlightPos.active ? 1 : 0
        }}
      />

      <h3 className="info-heading">Direct Connections</h3>
      <p className="info-text">
        Feel free to send a message using the form or reach out directly through email.
      </p>

      <div className="contact-details">
        <div className="detail-item">
          <MagneticIcon>
            <Mail size={18} />
          </MagneticIcon>
          <div className="detail-text-content">
            <span className="detail-label">Email</span>
            <a href={`mailto:${profile?.email || 'Abijithra2004@gmail.com'}`} className="detail-value">
              {profile?.email || 'Abijithra2004@gmail.com'}
            </a>
          </div>
        </div>

        <div className="detail-item">
          <MagneticIcon>
            <MapPin size={18} />
          </MagneticIcon>
          <div className="detail-text-content">
            <span className="detail-label">Location</span>
            <span className="detail-value">{profile?.location || 'KERALA, INDIA'}</span>
          </div>
        </div>

        {profile?.phone && (
          <div className="detail-item">
            <MagneticIcon>
              <Phone size={18} />
            </MagneticIcon>
            <div className="detail-text-content">
              <span className="detail-label">Phone</span>
              <a href={`tel:${profile.phone}`} className="detail-value">{profile.phone}</a>
            </div>
          </div>
        )}

        <div className="detail-item">
          <MagneticIcon>
            <MessageSquare size={18} />
          </MagneticIcon>
          <div className="detail-text-content">
            <span className="detail-label">Availability</span>
            <span className="detail-value status-available">Active for Opportunities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactSection({ profile, submitContactMessage }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);
  const { isHovered: formHovered, tiltProps: formTiltProps } = use3DTiltCard(6, 10);
  const formReveal = useScrollReveal({ direction: 'right', delay: 150, duration: 550 });

  const combinedFormRef = (node) => {
    formTiltProps.ref.current = node;
    formReveal.ref.current = node;
  };

  const combinedFormStyle = {
    ...formTiltProps.style,
    opacity: formReveal.style.opacity,
    transform: formReveal.isVisible ? formTiltProps.style.transform : formReveal.style.transform,
    transition: formReveal.isVisible ? formTiltProps.style.transition : formReveal.style.transition,
    willChange: formReveal.style.willChange
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await submitContactMessage(formData);
      setStatus({
        type: 'success',
        message: 'Message sent successfully! Thank you for reaching out.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or email directly.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="contact">
      <div className="section-header">
        <span className="section-subtitle">// INITIATE COLLABORATION</span>
        <h2 className="section-title" {...headingStyleProps}>
          Get In Touch
        </h2>
        <p className="section-description">
          Open to AI/ML engineering roles, advisory consultations, and research collaborations.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Info Sidebar */}
        <ContactInfoCardWithTilt profile={profile} />

        {/* Interactive Form */}
        <form
          ref={combinedFormRef}
          onMouseMove={formTiltProps.onMouseMove}
          onMouseLeave={formTiltProps.onMouseLeave}
          style={combinedFormStyle}
          className={`contact-form ${formHovered ? 'hovered' : ''}`}
          onSubmit={handleSubmit}
        >
          {status && (
            <div className={`status-banner ${status.type}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <span>Sending Message...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </SectionWrapper>
  );
}
