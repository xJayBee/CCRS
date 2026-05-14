'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const actions = isAdmin ? adminActions : userActions;
  const greeting = isAdmin ? 'Administrator dashboard' : 'Welcome back';
  const summary = isAdmin
    ? 'Manage conflict resolution workflows, venue resources, and user assignments from the admin workspace.'
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
