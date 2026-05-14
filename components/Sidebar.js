'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import styles from '../styles/Home.module.css';

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: '🏠', allowedRoles: ['admin', 'mediator', 'staff', 'client'] },
  { href: '/report-conflict', label: 'Report Conflict', icon: '📋', allowedRoles: ['client'] },
  { href: '/my-reports', label: 'My Reports', icon: '📄', allowedRoles: ['client'] },
  { href: '/manage-reports', label: 'Manage Reports', icon: '📝', allowedRoles: ['admin', 'staff'] },
  { href: '/manage-venues', label: 'Manage Venues', icon: '🏢', allowedRoles: ['admin', 'mediator', 'staff'] },
  { href: '/find-venue', label: 'Find Venue', icon: '🔍', allowedRoles: ['admin', 'mediator', 'staff', 'client'] },
  { href: '/track-progress', label: 'Track Progress', icon: '📈', allowedRoles: ['admin', 'mediator', 'staff', 'client'] },
  { href: '/assign-mediator', label: 'Assign Mediator', icon: '👤', allowedRoles: ['admin', 'mediator', 'staff'] },
  { href: '/schedule-meeting', label: 'Schedule Meeting', icon: '📅', allowedRoles: ['admin', 'mediator', 'staff'] },
  { href: '/resolve-conflict', label: 'Resolve Conflict', icon: '✓', allowedRoles: ['admin', 'mediator', 'staff'] },
];

export default function Sidebar({ isMobileOpen, onCloseMobileSidebar }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  const handleToggleCollapse = (current) => {
    const newState = !current;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', newState);
    }
  };
  const { user } = useAuth();

  const currentUser = user || { name: 'Guest', role: 'visitor' };

  const visibleNavItems = mainNavItems.filter((item) => item.allowedRoles.includes(currentUser.role));

  const handleReportConflictClick = () => {
    if (currentUser.role !== 'client') {
      if (typeof window !== 'undefined') {
        window.alert('Only clients can report a conflict.');
      }
      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavItemClick = (item) => {
    if (onCloseMobileSidebar) onCloseMobileSidebar();

    if (item.href === '/report-conflict') {
      handleReportConflictClick();
    }
  };

  const footerItems = [
    { href: '/about', label: 'About' },
  ];

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isMobileOpen ? styles.sidebarMobileOpen : ''}`}
      aria-hidden={!isMobileOpen && typeof window !== 'undefined' && window.innerWidth <= 1024}
    >
      <div className={styles.sidebarTop}>
        <div className={styles.brandRow}>
          <div>
            <div className={styles.brand}>E-Lupon</div>
            <p className={styles.brandTag}>Community Conflict Resolution</p>
          </div>
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={() => {
              if (isMobileOpen && onCloseMobileSidebar) {
                onCloseMobileSidebar();
              } else {
                handleToggleCollapse(isCollapsed);
              }
            }}
            aria-label={isMobileOpen ? 'Close navigation menu' : isCollapsed ? 'Open navigation menu' : 'Collapse navigation menu'}
          >
            {isMobileOpen ? '×' : isCollapsed ? '☰' : '×'}
          </button>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{currentUser.name.charAt(0)}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{currentUser.name}</p>
            <p className={styles.userRole}>{currentUser.role}</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                onClick={() => handleNavItemClick(item)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <span className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        {footerItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.sidebarFooterLink}>
            {item.label}
          </Link>
        ))}
        <p className={styles.sidebarFooterNote}>
          💡 Tip: Use keyboard shortcuts to speed up navigation. Press <kbd className={styles.shortcutKey}>?</kbd> for help.
        </p>
      </div>
    </aside>
  );
}
