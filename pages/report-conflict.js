'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const initialReport = {
  parties: '',
  description: '',
  location: '',
  date: '',
  priority: 'Normal',
  evidence: '',
};

export default function ReportConflict() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState(initialReport);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  const canReport = user.role === 'client';

  if (!canReport) {
    return (
      <Layout pageTitle="Report Conflict">
        <div className={styles.cardShell}>
          <div className={styles.panelCard}>
            <div className={styles.cardHeaderRow}>
              <div>
                <p className={styles.subtitle}>Access Restricted</p>
                <h2>Cannot Submit Conflict Report</h2>
              </div>
            </div>
            <div
              style={{
                padding: '20px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '14px',
                color: '#991b1b',
              }}
            >
              <p style={{ margin: '0 0 12px', fontWeight: '600' }}>
                ⚠️ Only clients can submit conflict reports
              </p>
              <p style={{ margin: '0 0 12px', lineHeight: '1.6' }}>
                You are currently logged in as a <strong>{user.role}</strong>. Only clients have permission to submit new conflict reports through this page.
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f1d1d' }}>
                Please use the dashboard or contact an administrator for assistance.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReport((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!canReport) {
      setErrorMessage('Only clients may submit a new conflict report.');
      return;
    }

    // Enhanced validation
    if (!report.parties.trim()) {
      setErrorMessage('Please provide the names or details of the parties involved.');
      return;
    }

    if (!report.description.trim()) {
      setErrorMessage('Please describe the conflict in detail.');
      return;
    }

    if (!report.date) {
      setErrorMessage('Please select the incident date.');
      return;
    }

    // Validate date is not in the future
    if (new Date(report.date) > new Date()) {
      setErrorMessage('The incident date cannot be in the future.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/conflicts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Unable to submit conflict report. Please try again.');
      } else {
        setStatusMessage('Your conflict report has been submitted successfully! Our mediation team will review it shortly.');
        setReport(initialReport);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage('A network error occurred while submitting your report. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout pageTitle="Report Conflict">
      <div className={styles.cardShell}>
        <div className={styles.panelCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <p className={styles.subtitle}>Start a New Report</p>
              <h2>Report a Community Conflict</h2>
              <p style={{ marginTop: '12px', maxWidth: '600px', lineHeight: '1.7' }}>
                Help us resolve conflicts in your community. Submit detailed information about the conflict so our experienced mediation team can assist all parties in finding a fair and lasting solution.
              </p>
            </div>
          </div>

          <div className={styles.formCard}>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <div className={styles.formField}>
                <label htmlFor="parties">
                  <span style={{ color: '#dc2626' }}>*</span> Parties Involved
                </label>
                <input
                  id="parties"
                  name="parties"
                  type="text"
                  value={report.parties}
                  onChange={handleChange}
                  placeholder="e.g., Neighborhood Association A and Neighborhood Association B"
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Provide names or descriptions of all parties involved in the conflict
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' }}>
                <div className={styles.formField}>
                  <label htmlFor="date">
                    <span style={{ color: '#dc2626' }}>*</span> Incident Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={report.date}
                    onChange={handleChange}
                    required
                  />
                  <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                    When did this incident occur?
                  </small>
                </div>

                <div className={styles.formField}>
                  <label htmlFor="priority">Priority Level</label>
                  <select id="priority" name="priority" value={report.priority} onChange={handleChange}>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                    How urgent is this matter?
                  </small>
                </div>
              </div>

              <div className={styles.formField}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={report.location}
                  onChange={handleChange}
                  placeholder="e.g., Dapitan City Main Street, Barangay Rizal, Community Center"
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Where did this conflict occur? (optional)
                </small>
              </div>

              <div className={styles.formField}>
                <label htmlFor="description">
                  <span style={{ color: '#dc2626' }}>*</span> Conflict Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={report.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the conflict. Include what happened, why it occurred, and how it's affecting the community."
                  required
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Be as detailed as possible to help our mediation team understand the situation
                </small>
              </div>

              <div className={styles.formField}>
                <label htmlFor="evidence">Supporting Evidence or Notes</label>
                <textarea
                  id="evidence"
                  name="evidence"
                  value={report.evidence}
                  onChange={handleChange}
                  placeholder="Add any supporting evidence, witness testimonies, previous attempts at resolution, or other relevant context that would help with mediation."
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Any additional information that could help resolve this conflict (optional)
                </small>
              </div>

              {errorMessage && (
                <div
                  className={styles.statusMessage}
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderColor: '#fecaca',
                    borderLeftColor: '#dc2626',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
                  }}
                >
                  ⚠️ {errorMessage}
                </div>
              )}
              {statusMessage && (
                <div
                  className={styles.statusMessage}
                  style={{
                    background: '#ecfdf5',
                    color: '#166534',
                    borderColor: '#d1fae5',
                    borderLeftColor: '#16a34a',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
                  }}
                >
                  ✓ {statusMessage}
                </div>
              )}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? '📤 Submitting report…' : '✓ Submit Conflict Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
