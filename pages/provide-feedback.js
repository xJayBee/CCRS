import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const feedbackCards = [
  {
    title: 'Platform UI Clarity',
    tag: 'Platform Feature',
    body: 'The new dashboard is very intuitive, but some labels could be clearer.',
    stars: 4,
    date: '2024-07-28',
  },
  {
    title: 'Mediation Process Speed',
    tag: 'Resolution Process',
    body: 'The mediation process felt a bit slow for a minor conflict. More frequent updates would be appreciated.',
    stars: 3,
    date: '2024-07-27',
  },
  {
    title: 'Mediator Communication',
    tag: 'Mediator Performance',
    body: 'Our assigned mediator was excellent! Very clear communication and guided us effectively.',
    stars: 5,
    date: '2024-07-26',
  },
  {
    title: 'Venue Booking Flow',
    tag: 'Platform Feature',
    body: 'Booking a venue was smooth, but I wish there was a calendar view for availability.',
    stars: 4,
    date: '2024-07-25',
  },
  {
    title: 'Reporting Initial Conflict',
    tag: 'General Suggestion',
    body: 'The initial conflict reporting form is comprehensive. Maybe a short tutorial for new users would help.',
    stars: 4,
    date: '2024-07-24',
  },
];

const satisfactionLabels = ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];

export default function ProvideFeedback() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);
  const [comments, setComments] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  if (isLoading || !user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');
    setSubmitError('');

    if (!subject.trim() || !feedbackType || !comments.trim()) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        subject: subject.trim(),
        feedbackType,
        satisfaction,
        comments: comments.trim(),
        allowContact,
        submittedBy: user.email,
        userRole: user.role,
        userName: user.name,
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for your feedback! Your input helps us improve our services.');
        // Reset form
        setSubject('');
        setFeedbackType('');
        setSatisfaction(5);
        setComments('');
        setAllowContact(false);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Provide Feedback">
      <div className={styles.cardShell}>
        <div className={styles.feedbackShell}>
          <section className={styles.panelCard}>
            <div className={styles.pageHeaderRow}>
              <div>
                <p className={styles.subtitle}>Share your thoughts on the conflict resolution process or our platform. Your input helps us improve.</p>
                <h2>Submit Your Feedback</h2>
              </div>
            </div>

            <form className={styles.feedbackForm} onSubmit={handleSubmit}>
              <label className={styles.formField}>
                <span>Feedback Subject *</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Briefly describe your feedback topic"
                  required
                />
              </label>
              <label className={styles.formField}>
                <span>Feedback Type *</span>
                <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} required>
                  <option value="">Select a feedback category</option>
                  <option value="Platform Feature">Platform Feature</option>
                  <option value="Reporting Process">Reporting Process</option>
                  <option value="Mediator Performance">Mediator Performance</option>
                  <option value="Venue Management">Venue Management</option>
                </select>
              </label>
              <label className={styles.formField}>
                <div className={styles.sliderHeader}>
                  <span>Overall Satisfaction: {satisfaction} / 5</span>
                  <span className={styles.sliderHint}>{satisfactionLabels[satisfaction - 1]}</span>
                </div>
                <input
                  className={styles.rangeSlider}
                  type="range"
                  min="1"
                  max="5"
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(Number(e.target.value))}
                />
                <div className={styles.sliderLabels}>
                  <span>Very Unsatisfied</span>
                  <span>Very Satisfied</span>
                </div>
              </label>
              <label className={styles.formField}>
                <span>Your Comments *</span>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share details, suggestions, or concerns that will help us improve."
                  rows="5"
                  required
                />
              </label>
              <label className={styles.checkboxField}>
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                />
                Allow us to contact you for clarification.
              </label>

              {submitError && (
                <div style={{ color: '#dc2626', marginBottom: '16px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {submitMessage && (
                <div style={{ color: '#16a34a', marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  ✓ {submitMessage}
                </div>
              )}

              <button type="submit" className={styles.primaryButton} style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </section>

          <section className={styles.panelCard}>
            <div className={styles.pageHeaderRow}>
              <div>
                <p className={styles.subtitle}>An overview of recent user sentiments across different categories.</p>
                <h2>Recent Feedback Trends</h2>
              </div>
            </div>

            <div className={styles.feedbackGrid}>
              {feedbackCards.map((item) => (
                <article key={item.title} className={styles.trendCard}>
                  <div className={styles.trendHead}>
                    <h3>{item.title}</h3>
                    <span className={styles.trendTag}>{item.tag}</span>
                  </div>
                  <p>{item.body}</p>
                  <div className={styles.trendFooter}>
                    <span className={styles.trendDate}>Submitted: {item.date}</span>
                    <span className={styles.starRating}>{'★'.repeat(item.stars)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
