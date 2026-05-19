'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

export default function MyReports() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportLoading, setReportLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const prevReportsRef = useRef([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchReports();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchReports = async () => {
    try {
      setReportLoading(true);
      const response = await fetch('/api/conflicts', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const userReports = data.filter((report) => report.createdBy === user?.email);

        if (prevReportsRef.current.length > 0) {
          const updatedReports = userReports.filter((report) => {
            const previous = prevReportsRef.current.find((item) => item.id === report.id);
            return previous && previous.status !== report.status;
          });

          if (updatedReports.length > 0) {
            const latestUpdate = updatedReports[0];
            setNotification(`Your report "${latestUpdate.parties}" was updated to ${latestUpdate.status}.`);
            setTimeout(() => setNotification(''), 8000);
          }
        }

        setReports(userReports);
        setFilteredReports(userReports);
        prevReportsRef.current = userReports;
        setError('');
      } else {
        setError('Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Error loading reports: ' + error.message);
    } finally {
      setReportLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = reports;

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

    if (dateFrom) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate <= new Date(dateTo);
      });
    }

    setFilteredReports(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setFilteredReports(reports);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchTerm, dateFrom, dateTo, reports]);

  const handleSelectReport = (report) => {
    setSelectedReport(selectedReport?.id === report.id ? null : report);
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch(`/api/conflicts?id=${selectedReport.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Report deleted successfully');
        setDeleteConfirm(false);
        setSelectedReport(null);
        await fetchReports();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Error deleting report: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending review':
        return styles.statusPendingReview;
      case 'Under review':
        return styles.statusUnderReview;
      case 'Resolved':
        return styles.statusResolved;
      case 'Approved':
        return styles.statusApproved;
      default:
        return '';
    }
  };

  const getReportStats = () => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'Pending review').length,
      inReview: reports.filter((r) => r.status === 'Under review').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
    };
  };

  if (isLoading || !user) {
    return null;
  }

  const stats = getReportStats();

  return (
    <Layout pageTitle="My Reports">
      <div className={styles.reportsContainer}>
        {/* Statistics Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{stats.total}</p>
            <p className={styles.statLabel}>Total Reports</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{stats.pending}</p>
            <p className={styles.statLabel}>Pending Review</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{stats.inReview}</p>
            <p className={styles.statLabel}>Under Review</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNumber}>{stats.resolved}</p>
            <p className={styles.statLabel}>Resolved</p>
          </div>
        </div>

        {/* Messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
        {notification && <div className={styles.successMessage}>{notification}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        {/* Header */}
        <div className={styles.reportsHeader}>
          <h2>My Conflict Reports</h2>
          <button className={styles.primaryButton} onClick={() => router.push('/report-conflict')}>
            ➕ New Report
          </button>
        </div>

        {/* Filters */}
        <div className={styles.reportsFilters}>
          <div className={styles.reportFilterField}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Parties, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.reportFilterField}>
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending review">Pending Review</option>
              <option value="Under review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
          <div className={styles.reportFilterField}>
            <label>From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className={styles.filterButtonsGroup}>
            <button className={styles.filterApplyButton} onClick={applyFilters}>
              Apply
            </button>
            <button className={styles.filterClearButton} onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className={styles.reportsList}>
          {reportLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.reportItemSkeleton} />
              <div className={styles.reportItemSkeleton} />
              <div className={styles.reportItemSkeleton} />
            </div>
          ) : filteredReports.length > 0 ? (
            <>
              {filteredReports.map((report) => (
                <div key={report.id}>
                  <div
                    className={`${styles.reportItem} ${selectedReport?.id === report.id ? styles.selected : ''}`}
                    onClick={() => handleSelectReport(report)}
                  >
                    <div className={styles.reportItemHeader}>
                      <h3 className={styles.reportItemTitle}>{report.parties}</h3>
                      <span className={`${styles.reportStatusBadge} ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className={styles.reportItemMeta}>
                      <div className={styles.reportMetaItem}>
                        <strong>📍</strong> {report.location}
                      </div>
                      <div className={styles.reportMetaItem}>
                        <strong>📅</strong> {new Date(report.date).toLocaleDateString()}
                      </div>
                      <div className={styles.reportMetaItem}>
                        <strong>⚠️</strong> {report.priority} Priority
                      </div>
                    </div>

                    <p className={styles.reportItemDescription}>{report.description}</p>
                  </div>

                  {selectedReport?.id === report.id && (
                    <div className={styles.reportDetailsPanel}>
                      <h4>Report Details</h4>

                      <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Parties Involved</span>
                          <p className={styles.detailValue}>{report.parties}</p>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Incident Date</span>
                          <p className={styles.detailValue}>{new Date(report.date).toLocaleDateString()}</p>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Location</span>
                          <p className={styles.detailValue}>{report.location}</p>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Priority Level</span>
                          <p className={styles.detailValue}>{report.priority}</p>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Status</span>
                          <p className={styles.detailValue}>{report.status}</p>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Submitted</span>
                          <p className={styles.detailValue}>
                            {new Date(report.createdAt || report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className={styles.reportFullDescription}>
                        <h5 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>Description</h5>
                        <p>{report.description}</p>

                        {report.evidence && report.evidence !== 'None' && (
                          <>
                            <h5 style={{ margin: '16px 0 10px', fontSize: '0.95rem', fontWeight: 700 }}>
                              Supporting Notes
                            </h5>
                            <p>{report.evidence}</p>
                          </>
                        )}
                      </div>

                      {report.status === 'Pending review' && (
                        <div className={styles.reportActions}>
                          <button
                            className={styles.reportEditButton}
                            onClick={() => router.push(`/edit-report/${report.id}`)}
                          >
                            ✏️ Edit Report
                          </button>
                          {!deleteConfirm ? (
                            <button
                              className={styles.reportDeleteButton}
                              onClick={() => setDeleteConfirm(true)}
                            >
                              🗑️ Delete Report
                            </button>
                          ) : (
                            <>
                              <span style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                                Are you sure? This action cannot be undone.
                              </span>
                              <button
                                className={styles.reportDeleteButton}
                                onClick={handleDeleteReport}
                                style={{ background: '#dc2626', color: '#ffffff' }}
                              >
                                ✓ Confirm Delete
                              </button>
                              <button
                                className={styles.filterClearButton}
                                onClick={() => setDeleteConfirm(false)}
                              >
                                ✗ Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📄</div>
              <h3 className={styles.emptyStateTitle}>No Reports Found</h3>
              <p className={styles.emptyStateText}>
                {searchTerm || statusFilter || dateFrom || dateTo
                  ? 'Try adjusting your filters to find your reports.'
                  : "You haven't submitted any conflict reports yet. Start by creating your first report."}
              </p>
              {!(searchTerm || statusFilter || dateFrom || dateTo) && (
                <button className={styles.emptyStateButton} onClick={() => router.push('/report-conflict')}>
                  Submit Your First Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
