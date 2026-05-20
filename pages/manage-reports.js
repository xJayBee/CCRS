'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

export default function ManageReports() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending review');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalInProgress, setApprovalInProgress] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && !['admin', 'staff'].includes(user.role)) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && ['admin', 'staff'].includes(user.role)) {
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
        setReports(data);
        applyFilters(data);
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

  const applyFilters = (reportsToFilter = reports) => {
    let filtered = reportsToFilter;

    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.parties.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleApproveReport = async (reportToApprove = selectedReport) => {
    const report = reportToApprove || selectedReport;
    if (!report) return;

    try {
      setApprovalInProgress(true);
      setError('');
      const response = await fetch('/api/conflicts', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: report.id,
          status: 'Approved',
          approvalNotes: report.id === selectedReport?.id ? approvalReason : '',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`✓ Report "${report.parties}" has been approved successfully!`);
        setApprovalReason('');
        if (selectedReport && report.id === selectedReport.id) {
          setShowDetailModal(false);
        }
        setSelectedReport(null);
        await fetchReports();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to approve report');
      }
    } catch (error) {
      console.error('Error approving report:', error);
      setError('Error approving report: ' + error.message);
    } finally {
      setApprovalInProgress(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReport) return;

    try {
      setApprovalInProgress(true);
      setError('');
      const response = await fetch('/api/conflicts', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedReport.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`✓ Report status updated to "${newStatus}"`);
        setShowDetailModal(false);
        setSelectedReport(null);
        setStatusFilter('');
        await fetchReports();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      setError('Error updating report: ' + error.message);
    } finally {
      setApprovalInProgress(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending review':
        return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'Under review':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'Approved':
        return { bg: '#ecfdf5', color: '#166534', border: '#d1fae5' };
      case 'Assigned':
        return { bg: '#f0f9ff', color: '#0c4a6e', border: '#bae6fd' };
      case 'Resolved':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'High':
        return { bg: '#fef08a', color: '#713f12' };
      case 'Normal':
        return { bg: '#f0fdf4', color: '#166534' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const reportStats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending review').length,
    underReview: reports.filter((r) => r.status === 'Under review').length,
    approved: reports.filter((r) => r.status === 'Approved').length,
  };

  if (loading) {
    return (
      <Layout pageTitle="Manage Reports">
        <div className={styles.cardShell}>
          <div className={styles.panelCard}>
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Manage Reports">
      <div className={styles.cardShell}>
        {/* Stats Overview */}
        <div className={styles.panelCard} style={{ marginBottom: '24px' }}>
          <div className={styles.cardHeaderRow}>
            <h2 style={{ margin: 0 }}>Reports Overview</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '20px' }}>
            <div style={{ padding: '16px', background: '#eef2ff', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Total Reports</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#4338ca' }}>{reportStats.total}</p>
            </div>
            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fcd34d' }}>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Pending Review</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#92400e' }}>{reportStats.pending}</p>
            </div>
            <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Under Review</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#1e40af' }}>{reportStats.underReview}</p>
            </div>
            <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
              <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Approved</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#166534' }}>{reportStats.approved}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={styles.panelCard} style={{ marginBottom: '24px' }}>
          <div className={styles.cardHeaderRow}>
            <h3 style={{ margin: 0 }}>Filters</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div className={styles.formField}>
              <label style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '0.9rem' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  applyFilters(reports);
                }}
                className={styles.formField}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d6d9ff' }}
              >
                <option value="">All Statuses</option>
                <option value="Pending review">Pending Review</option>
                <option value="Under review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="Approved">Approved</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '0.9rem' }}>Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  applyFilters(reports);
                }}
                placeholder="Search parties, location..."
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #d6d9ff', width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div
            style={{
              padding: '14px 16px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #fecaca',
              borderLeftColor: '#dc2626',
              borderLeftWidth: '4px',
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: '14px 16px',
              background: '#ecfdf5',
              color: '#166534',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '1px solid #d1fae5',
              borderLeftColor: '#16a34a',
              borderLeftWidth: '4px',
            }}
          >
            {success}
          </div>
        )}

        {/* Reports List */}
        <div className={styles.panelCard}>
          <div className={styles.cardHeaderRow}>
            <h3 style={{ margin: 0 }}>
              Reports ({filteredReports.length})
            </h3>
          </div>
          {filteredReports.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
              No reports found matching your criteria
            </p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {filteredReports.map((report) => {
                const statusColor = getStatusColor(report.status);
                const priorityColor = getPriorityColor(report.priority);
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
                        {report.description.substring(0, 100)}...
                      </p>
                      <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        📍 {report.location} | 📅 {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span
                        style={{
                          background: statusColor.bg,
                          color: statusColor.color,
                          border: `1px solid ${statusColor.border}`,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}
                      >
                        {report.status}
                      </span>
                      <span
                        style={{
                          background: priorityColor.bg,
                          color: priorityColor.color,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}
                      >
                        {report.priority} Priority
                      </span>
                      {report.assignedMediator && (
                        <span
                          style={{
                            background: '#f5f3ff',
                            color: '#4338ca',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                          }}
                        >
                          Assigned to {report.assignedMediator}
                        </span>
                      )}
                      {['Pending review', 'Under review'].includes(report.status) && (
                        <button
                          className={styles.primaryButton}
                          disabled={approvalInProgress}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveReport(report);
                          }}
                          style={{ width: '100%', minWidth: '120px' }}
                        >
                          {approvalInProgress ? '⏳ Approving...' : 'Approve'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 className={styles.modalTitle}>{selectedReport.parties}</h2>
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
                <strong>Parties Involved:</strong>
              </p>
              <p style={{ margin: '0 0 16px', color: '#475569' }}>{selectedReport.parties}</p>

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
                    background: getPriorityColor(selectedReport.priority).bg,
                    color: getPriorityColor(selectedReport.priority).color,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}
                >
                  {selectedReport.priority}
                </span>
              </p>
              {selectedReport.assignedMediator && (
                <p style={{ margin: '0 0 16px', color: '#475569' }}>
                  <strong>Assigned Mediator:</strong> {selectedReport.assignedMediator}
                </p>
              )}
              {selectedReport.createdBy && (
                <p style={{ margin: '0 0 16px', color: '#475569' }}>
                  <strong>Submitted By:</strong> {selectedReport.createdBy}
                </p>
              )}

              <p style={{ margin: '0 0 12px', color: '#0f172a', fontWeight: '600' }}>
                <strong>Status:</strong>
              </p>
              <p style={{ margin: '0 0 16px' }}>
                <span
                  style={{
                    background: getStatusColor(selectedReport.status).bg,
                    color: getStatusColor(selectedReport.status).color,
                    border: `1px solid ${getStatusColor(selectedReport.status).border}`,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'inline-block',
                  }}
                >
                  {selectedReport.status}
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

            {selectedReport.status === 'Pending review' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.95rem' }}>
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d6d9ff',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    minHeight: '80px',
                  }}
                />
              </div>
            )}

            <div className={styles.modalActions} style={{ gap: '10px', flexDirection: 'column' }}>
              {selectedReport.status === 'Pending review' && (
                <>
                  <button
                    className={styles.primaryButton}
                    onClick={handleApproveReport}
                    disabled={approvalInProgress}
                    style={{ width: '100%' }}
                  >
                    {approvalInProgress ? '⏳ Approving...' : '✓ Approve Report'}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => handleUpdateStatus('Under review')}
                    disabled={approvalInProgress}
                    style={{ width: '100%' }}
                  >
                    📋 Move to Under Review
                  </button>
                </>
              )}
              {selectedReport.status === 'Under review' && (
                <>
                  <button
                    className={styles.primaryButton}
                    onClick={handleApproveReport}
                    disabled={approvalInProgress}
                    style={{ width: '100%' }}
                  >
                    {approvalInProgress ? '⏳ Approving...' : '✓ Approve Report'}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => handleUpdateStatus('Resolved')}
                    disabled={approvalInProgress}
                    style={{ width: '100%' }}
                  >
                    ✅ Mark as Resolved
                  </button>
                </>
              )}
              {selectedReport.status === 'Approved' && (
                <button
                  className={styles.secondaryButton}
                  onClick={() => handleUpdateStatus('Resolved')}
                  disabled={approvalInProgress}
                  style={{ width: '100%' }}
                >
                  ✅ Mark as Resolved
                </button>
              )}
              <button
                className={styles.filterButton}
                onClick={() => setShowDetailModal(false)}
                style={{ width: '100%' }}
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
