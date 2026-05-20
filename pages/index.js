'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const adminActions = [
  {
    title: 'Review conflict reports',
    description: 'Approve or escalate reports and track active resolution cases.',
    href: '/manage-reports',
  },
  {
    title: 'Manage venues',
    description: 'Update venue availability, add new locations, and keep bookings organized.',
    href: '/manage-venues',
  },
  {
    title: 'Create a user',
    description: 'Add a new mediator, staff member, or admin account quickly.',
    href: '/users',
  },
  {
    title: 'Manage users',
    description: 'View and update existing users, including roles and access.',
    href: '/users',
  },
  {
    title: 'Assign mediators',
    description: 'Match mediators to cases and keep assignments moving.',
    href: '/assign-mediator',
  },
];

const userActions = [
  {
    title: 'Report a conflict',
    description: 'Create a new conflict report for your community case.',
    href: '/report-conflict',
  },
  {
    title: 'Find a venue',
    description: 'Search available venues in Dapitan City for mediation sessions.',
    href: '/find-venue',
  },
  {
    title: 'Track progress',
    description: 'Monitor your active cases and next steps.',
    href: '/track-progress',
  },
  {
    title: 'Provide feedback',
    description: 'Share information to improve community resolution.',
    href: '/provide-feedback',
  },
];

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  const [dashboardStats, setDashboardStats] = useState(null);
  const [urgentReports, setUrgentReports] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      const fetchDashboard = async () => {
        setStatsLoading(true);
        setStatsError('');

        try {
          const response = await fetch('/api/conflicts', {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Unable to fetch reports.');
          }

          const reports = await response.json();
          const statusCounts = {
            total: reports.length,
            'Pending review': reports.filter((report) => report.status === 'Pending review').length,
            'Under review': reports.filter((report) => report.status === 'Under review').length,
            Approved: reports.filter((report) => report.status === 'Approved').length,
            Resolved: reports.filter((report) => report.status === 'Resolved').length,
            Assigned: reports.filter((report) => report.assignedMediator).length,
            urgent: reports.filter((report) => report.priority === 'Urgent').length,
          };

          setDashboardStats(statusCounts);
          setUrgentReports(
            reports
              .filter((report) => report.priority === 'Urgent' && report.status !== 'Resolved')
              .sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date))
              .slice(0, 3)
          );
        } catch (error) {
          console.error('Dashboard fetch error:', error);
          setStatsError('Unable to load dashboard summaries.');
        } finally {
          setStatsLoading(false);
        }
      };

      fetchDashboard();
    }
  }, [isLoading, isAdmin]);

  if (isLoading || !user) {
    return null;
  }

  const actions = isAdmin ? adminActions : userActions;
  const greeting = isAdmin ? 'Administrator dashboard' : 'Welcome back';
  const summary = isAdmin
    ? 'Manage conflict workflows, user accounts, and assignments from one admin workspace.'
    : 'Report issues, find resources, and track progress through the community conflict portal.';

  return (
    <Layout pageTitle={isAdmin ? 'Admin Dashboard' : 'Dashboard'}>
      <div className={styles.cardShell}>
        <div className={styles.panelCard}>
          <div className={styles.cardHeaderRow}>
            <div>
              <p className={styles.subtitle}>{greeting}</p>
              <h2>{`Hello, ${user.name || 'community member'}`}</h2>
              <p>{summary}</p>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Total reports</span>
                  <p className={styles.metricValue}>{dashboardStats?.total ?? '—'}</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Pending review</span>
                  <p className={styles.metricValue}>{dashboardStats?.['Pending review'] ?? 0}</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Under review</span>
                  <p className={styles.metricValue}>{dashboardStats?.['Under review'] ?? 0}</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Assigned cases</span>
                  <p className={styles.metricValue}>{dashboardStats?.Assigned ?? 0}</p>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Urgent reviews</span>
                  <p className={styles.metricValue}>{dashboardStats?.urgent ?? 0}</p>
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: '24px' }}>
                <h3>Priority queue</h3>
                <p>Issues that need admin attention first.</p>
              </div>

              {statsLoading ? (
                <p style={{ color: '#64748b' }}>Loading summaries...</p>
              ) : statsError ? (
                <p style={{ color: '#b91c1c' }}>{statsError}</p>
              ) : urgentReports.length === 0 ? (
                <p style={{ color: '#64748b' }}>There are no urgent open reports at the moment.</p>
              ) : (
                <div className={styles.venueGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: '14px' }}>
                  {urgentReports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      className={`${styles.venueCard} ${styles.linkButton}`}
                      onClick={() => router.push('/manage-reports')}
                      style={{ textAlign: 'left', padding: '20px' }}
                    >
                      <p style={{ margin: '0 0 10px', color: '#1f2937', fontWeight: 700 }}>{report.parties || report.title || 'Conflict report'}</p>
                      <p style={{ margin: '0 0 10px', color: '#475569', fontSize: '0.95rem' }}>{(report.description || '').slice(0, 90)}...</p>
                      <p style={{ margin: 0, color: '#1d4ed8', fontSize: '0.9rem' }}>Priority: {report.priority}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className={styles.sectionHeader} style={{ marginTop: '30px' }}>
            <h3>{isAdmin ? 'Admin quick actions' : 'Quick actions'}</h3>
          </div>

          <div className={styles.venueGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {actions.map((action) => (
              <button
                key={action.href}
                type="button"
                className={`${styles.venueCard} ${styles.linkButton}`}
                onClick={() => router.push(action.href)}
                style={{ textAlign: 'left', padding: '24px' }}
              >
                <h3 style={{ margin: '0 0 10px' }}>{action.title}</h3>
                <p style={{ margin: 0, color: '#475569' }}>{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
