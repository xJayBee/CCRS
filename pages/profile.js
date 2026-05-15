import { useAuth } from '../components/AuthContext';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const roleLabels = {
  admin: 'Administrator',
  mediator: 'Mediator',
  staff: 'Support Staff',
  client: 'Community Member',
};

export default function Profile() {
  const { user } = useAuth();
  const userName = user?.name || 'E-Lupon User';
  const initials = userName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const userRole = roleLabels[user?.role] || 'Community Member';

  return (
    <Layout pageTitle="Profile">
      <div className={styles.profileShell}>
        <section className={styles.profileHero}>
          <div className={styles.profileBadge}>E-LUPON PROFILE</div>
          <div className={styles.profileHeroContent}>
            <div className={styles.profileAvatar}>{initials}</div>
            <div className={styles.profileIntro}>
              <p className={styles.profileLabel}>ACCOUNT OVERVIEW</p>
              <h2>{userName}</h2>
              <p className={styles.profileSubtext}>
                Manage your E-Lupon account settings, stay updated on case activity, and keep your conflict resolution profile secure.
              </p>
            </div>
          </div>
          <div className={styles.profileHeroStats}>
            <div className={styles.profileStat}>
              <span>Role</span>
              <strong>{userRole}</strong>
            </div>
            <div className={styles.profileStat}>
              <span>Email</span>
              <strong>{user?.email || 'Not available'}</strong>
            </div>
            <div className={styles.profileStat}>
              <span>Status</span>
              <strong>Active</strong>
            </div>
          </div>
        </section>

        <div className={styles.profileGrid}>
          <section className={styles.profileCard}>
            <div className={styles.profileSectionHeader}>
              <h3>Account Details</h3>
            </div>

            <div className={styles.profileFields}>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Full name</span>
                <div className={styles.profileFieldValue}>{userName}</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Email address</span>
                <div className={styles.profileFieldValue}>{user?.email || 'Not available'}</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Account type</span>
                <div className={styles.profileFieldValue}>{userRole}</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Member since</span>
                <div className={styles.profileFieldValue}>Registered on first login</div>
              </div>
            </div>

            <div className={styles.profileSection}>
              <div className={styles.profileSubsectionTitle}>Profile Summary</div>
              <div className={styles.profileFields}>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Assigned cases</span>
                  <div className={styles.profileFieldValue}>Auto-sync with your workflow</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Active tasks</span>
                  <div className={styles.profileFieldValue}>Track meetings and follow-ups</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Notifications</span>
                  <div className={styles.profileFieldValue}>Enabled</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Support access</span>
                  <div className={styles.profileFieldValue}>Available</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.profileSideCard}>
            <div className={styles.faceCard}>
              <div className={styles.faceCardHeader}>
                <div>
                  <p className={styles.faceCardTitle}>Security Snapshot</p>
                  <p className={styles.faceCardDesc}>
                    Keep your E-Lupon account protected by reviewing login activity and security settings.
                  </p>
                </div>
                <span className={styles.faceStatus}>Secure</span>
              </div>
              <div className={styles.faceFeatures}>
                <span className={styles.featurePill}>Safe login</span>
                <span className={styles.featurePill}>Role-based access</span>
                <span className={styles.featurePill}>Session control</span>
              </div>
              <button className={styles.primaryButton} type="button" style={{ width: '100%', marginTop: '24px' }}>
                Update Security
              </button>
            </div>

            <div className={styles.securityCard}>
              <div className={styles.profileSectionHeader}>
                <h3>Account Actions</h3>
              </div>
              <p className={styles.profileCardText}>
                Use these quick actions to manage your account access and stay connected with the E-Lupon system.
              </p>
              <button className={styles.primaryButton} type="button" style={{ width: '100%', marginTop: '18px' }}>
                Change Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
