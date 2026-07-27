/**
 * ==============================================================================
 * Contact Section Component (src/components/ContactSection.jsx)
 * ==============================================================================
 * Purpose: Provides a form for recruiters, clients, or collaborators to submit messages.
 *          Integrates with submitContactMessage to store messages in Supabase contact_messages.
 * Appears: Displayed in the #contact section near the bottom of the page.
 * ==============================================================================
 */

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, MapPin, MessageSquare } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { useInteractiveText } from '../hooks/useInteractiveText';

export default function ContactSection({ profile, submitContactMessage }) {
  const { styleProps: headingStyleProps } = useInteractiveText(12, 6);

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
        <div className="contact-info-card">
          <h3 className="info-heading">Direct Connections</h3>
          <p className="info-text">
            Feel free to send a message using the form or reach out directly through email.
          </p>

          <div className="contact-details">
            {profile?.email && (
              <div className="detail-item">
                <div className="detail-icon"><Mail size={18} /></div>
                <div>
                  <span className="detail-label">Email</span>
                  <a href={`mailto:${profile.email}`} className="detail-value">{profile.email}</a>
                </div>
              </div>
            )}

            {profile?.location && (
              <div className="detail-item">
                <div className="detail-icon"><MapPin size={18} /></div>
                <div>
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{profile.location}</span>
                </div>
              </div>
            )}

            <div className="detail-item">
              <div className="detail-icon"><MessageSquare size={18} /></div>
              <div>
                <span className="detail-label">Availability</span>
                <span className="detail-value" style={{ color: '#10b981' }}>Active for Opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          {status && (
            <div className={`status-banner ${status.type}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Dr. Sarah Chen"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="sarah@example.com"
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
              placeholder="AI Engineering Opportunity / Research Collaboration"
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
              placeholder="Hi, I'd like to discuss an opportunity..."
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
