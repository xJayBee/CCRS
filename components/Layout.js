'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import LogoutConfirmation from './LogoutConfirmation';
import { useAuth } from './AuthContext';
import styles from '../styles/Home.module.css';

const pageSummaries = {
  'Report New Conflict': 'Capture the details clearly so your mediation team can act fast.',
  'Manage Venues': 'Browse matched venues, track availability, and keep bookings organized.',
  'Track Progress': 'Monitor case movement and spot important escalation points.',
  'Schedule Meeting': 'Plan meeting invitations and confirm date, time, and location.',
  'Assign Mediator': 'Quickly match mediators with active conflicts and follow up.',
  'Find Venue in Dapitan City': 'Choose the right space for each mediation session.',
  'Resolve Conflict': 'Focus on next steps and keep progress moving toward resolution.',
  'Provide Feedback': 'Share insights that help improve the community resolution process.',
};

export default function Layout({ children, pageTitle }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user: authUser, isLoading: authLoading, signOut } = useAuth();

  const pageSummary = pageSummaries[pageTitle] || 'Use the sidebar to jump between workflows and keep things moving.';

  useEffect(() => {
    if (authLoading) return;
    if (!authUser && pathname !== '/login' && pathname !== '/' && pathname !== '/register') {
      router.push('/login');
    }
    if (authUser && (pathname === '/login' || pathname === '/register')) {
      router.push('/');
    }
  }, [authLoading, authUser, pathname, router]);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirmation(false);
    setShowProfileMenu(false);
    await signOut();
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleLogin = () => {
    setShowProfileMenu(false);
    router.push('/login');
  };

  const handleProfile = () => {
    setShowProfileMenu(false);
    router.push('/profile');
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    router.push('/settings');
  };

  const handleHelp = () => {
    setShowProfileMenu(false);
    router.push('/help');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((current) => !current);
  };

  if (authLoading) {
    return (
      <div className={styles.pageShell}>
        <div className={styles.sidebar}>
          <div className={styles.loadingSkeleton} />
        </div>
        <main className={styles.mainContent}>
          <div className={styles.loadingSkeleton} style={{ height: '100px', marginBottom: '24px' }} />
          <div className={styles.loadingSkeleton} style={{ height: '60%' }} />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageShell}>
      <Sidebar
        isMobileOpen={showMobileSidebar}
        onCloseMobileSidebar={() => setShowMobileSidebar(false)}
      />
      <div
        className={`${styles.mobileSidebarOverlay} ${showMobileSidebar ? styles.visibleOverlay : ''}`}
        onClick={() => setShowMobileSidebar(false)}
      />
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.mobileSidebarButton}
            onClick={() => setShowMobileSidebar((current) => !current)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className={styles.topbarTitle}>
            <p>Welcome back{authUser ? `, ${authUser.name}` : ''}</p>
          </div>
          <div className={styles.profileArea}>
            {!authUser ? (
              <button type="button" className={styles.primaryButton} onClick={handleLogin}>
                Sign in
              </button>
            ) : (
              <>
                <button type="button" className={styles.profileButton} onClick={toggleProfileMenu}>
                  Account
                </button>
                <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                  Sign out
                </button>
                <button
                  type="button"
                  className={styles.avatarButton}
                  onClick={toggleProfileMenu}
                  aria-expanded={showProfileMenu}
                  aria-label="Open account menu"
                >
                  <span className={styles.avatar}>{authUser.name?.charAt(0)}</span>
                </button>
              </>
            )}
            {showProfileMenu && authUser && (
              <div className={styles.profileMenu}>
                <button type="button" className={styles.profileMenuItem} onClick={handleProfile}>
                  View profile
                </button>
                <button type="button" className={styles.profileMenuItem} onClick={handleSettings}>
                  Settings
                </button>
                <button type="button" className={styles.profileMenuItem} onClick={handleHelp}>
                  Help center
                </button>
                <button type="button" className={styles.profileMenuItem} onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <section className={styles.pageHeader}>
          <div>
            <h1>{pageTitle}</h1>
            <p className={styles.pageSummary}>{pageSummary}</p>
          </div>
        </section>
        {children}
      </main>
      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
}
