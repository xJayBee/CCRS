import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

export default function ResolveConflict() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Approved');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateInProgress, setUpdateInProgress] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!['admin', 'mediator', 'staff'].includes(user.role)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && ['admin', 'mediator', 'staff'].includes(user.role)) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conflicts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const approvedReports = data.filter((r) => r.status === 'Approved' || r.status === 'Under review');
        setReports(approvedReports);
        setError('');
      } else {
        setError('Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error loading reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;

    try {
      setUpdateInProgress(true);
      setError('');
      const response = await fetch('/api/conflicts', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedReport.id,
          status: 'Resolved',
          resolvedBy: user?.email,
          resolvedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowDetailModal(false);
        setSelectedReport(null);
        await fetchReports();
      } else {
        setError(result.error || 'Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Error updating report: ' + error.message);
    } finally {
      setUpdateInProgress(false);
    }
  };

  const handleScheduleMeeting = () => {
    if (selectedReport) {
      router.push(`/schedule-meeting?reportId=${selectedReport.id}&report=${encodeURIComponent(selectedReport.parties)}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: '#ecfdf5', color: '#166534', border: '#d1fae5' };
      case 'Under review':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'Resolved':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
  };

  const approvedReports = reports.filter((r) => r.status === 'Approved');
  const underReviewReports = reports.filter((r) => r.status === 'Under review');

  if (loading) {
    return (
      <Layout pageTitle="Resolve Conflict">
        <div className={styles.cardShell}>
          <div className={styles.panelCard}>
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
              Loading approved conflict reports...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (reports.length === 0) {
    return (
      <Layout pageTitle="Resolve Conflict">
        <div className={styles.cardShell}>
          <div className={styles.panelCard}>
            <div className={styles.cardHeaderRow}>
              <h2>No Approved Reports</h2>
            </div>
            <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 20px' }}>
              There are currently no approved conflict reports to resolve. 
              <br />
              Check back later when reports are approved.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Resolve Conflict">
      <div className={styles.cardShell}>
        {/* Approved Reports List */}
        <div className={styles.panelCard} style={{ marginBottom: '24px' }}>
          <div className={styles.cardHeaderRow}>
            <h2 style={{ margin: 0 }}>Approved Conflict Reports ({approvedReports.length})</h2>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '10px',
                marginTop: '16px',
                marginBottom: '16px',
                border: '1px solid #fecaca',
                borderLeftColor: '#dc2626',
                borderLeftWidth: '4px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {approvedReports.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px 20px', marginTop: '16px' }}>
              No approved reports ready for resolution
            </p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {approvedReports.map((report) => {
                const statusColor = getStatusColor(report.status);
                return (
                  <div
                    key={report.id}
                    className={styles.venueRow}
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontWeight: '600', fontSize: '1.05rem' }}>
                        {report.parties}
                      </h4>
                      <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.95rem' }}>
                        {report.description.substring(0, 80)}...
                      </p>
                      <p style={{ margin: '0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        📍 {report.location} | Priority: <strong>{report.priority}</strong>
                      </p>
                    </div>
                    <span
                      style={{
                        background: statusColor.bg,
                        color: statusColor.color,
                        border: `1px solid ${statusColor.border}`,
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {report.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Under Review Reports */}
        {underReviewReports.length > 0 && (
          <div className={styles.panelCard} style={{ marginBottom: '24px' }}>
            <div className={styles.cardHeaderRow}>
              <h2 style={{ margin: 0 }}>Reports Under Review ({underReviewReports.length})</h2>
            </div>

            <div style={{ marginTop: '20px' }}>
              {underReviewReports.map((report) => {
                const statusColor = getStatusColor(report.status);
                return (
                  <div
                    key={report.id}
                    className={styles.venueRow}
                    onClick={() => {
                      setSelectedReport(report);
                      setShowDetailModal(true);
                    }}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontWeight: '600', fontSize: '1.05rem' }}>
                        {report.parties}
                      </h4>
                      <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.95rem' }}>
                        {report.description.substring(0, 80)}...
                      </p>
                      <p style={{ margin: '0', color: '#94a3b8', fontSize: '0.85rem' }}>
                        📍 {report.location} | Priority: <strong>{report.priority}</strong>
                      </p>
                    </div>
                    <span
                      style={{
                        background: statusColor.bg,
                        color: statusColor.color,
                        border: `1px solid ${statusColor.border}`,
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {report.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 className={styles.modalTitle}>{selectedReport.parties}</h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  Status: <strong>{selectedReport.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                <strong>Description:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                {selectedReport.description}
              </p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                <strong>Location:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>{selectedReport.location}</p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                <strong>Incident Date:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>
                {new Date(selectedReport.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                <strong>Priority:</strong>
              </p>
              <p style={{ margin: '0 0 16px' }}>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background:
                      selectedReport.priority === 'Urgent'
                        ? '#fee2e2'
                        : selectedReport.priority === 'High'
                        ? '#fef08a'
                        : '#f0fdf4',
                    color:
                      selectedReport.priority === 'Urgent'
                        ? '#991b1b'
                        : selectedReport.priority === 'High'
                        ? '#713f12'
                        : '#166534',
                  }}
                >
                  {selectedReport.priority}
                </span>
              </p>

              {selectedReport.evidence && (
                <>
                  <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                    <strong>Evidence/Notes:</strong>
                  </p>
                  <p style={{ margin: '0 0 16px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                    {selectedReport.evidence}
                  </p>
                </>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.primaryButton}
                onClick={handleScheduleMeeting}
                style={{ flex: 1 }}
              >
                📅 Schedule Meeting
              </button>
              {selectedReport.status === 'Under review' && (
                <button
                  className={styles.secondaryButton}
                  onClick={handleResolveReport}
                  disabled={updateInProgress}
                  style={{ flex: 1 }}
                >
                  {updateInProgress ? '⏳...' : '✓ Mark Resolved'}
                </button>
              )}
              <button
                className={styles.filterButton}
                onClick={() => setShowDetailModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
