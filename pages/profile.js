import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Profile() {
  return (
    <Layout pageTitle="Profile">
      <div className={styles.profileShell}>
        <section className={styles.profileHero}>
          <div className={styles.profileBadge}>SSAAAM · JRMSU</div>
          <div className={styles.profileHeroContent}>
            <div className={styles.profileAvatar}>JT</div>
            <div className={styles.profileIntro}>
              <p className={styles.profileLabel}>WELCOME TO</p>
              <h2>Joel Tomodos</h2>
              <p className={styles.profileSubtext}>
                Student School Activities Attendance Monitoring — manage your profile, credentials, and attendance preferences in one secure hub.
              </p>
            </div>
          </div>
          <div className={styles.profileHeroStats}>
            <div className={styles.profileStat}>
              <span>Student ID</span>
              <strong>19-A-00477</strong>
            </div>
            <div className={styles.profileStat}>
              <span>Program</span>
              <strong>BSIS • 3rd Year</strong>
            </div>
            <div className={styles.profileStat}>
              <span>Status</span>
              <strong>Verified</strong>
            </div>
          </div>
        </section>

        <div className={styles.profileGrid}>
          <section className={styles.profileCard}>
            <div className={styles.profileSectionHeader}>
              <h3>Personal Information</h3>
            </div>
            <div className={styles.profileFields}>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>First name</span>
                <div className={styles.profileFieldValue}>Joel</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Middle name</span>
                <div className={styles.profileFieldValue}>Paglalunan</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Last name</span>
                <div className={styles.profileFieldValue}>Tomodos</div>
              </div>
              <div className={styles.profileField}>
                <span className={styles.profileFieldLabel}>Suffix</span>
                <div className={styles.profileFieldValue}>Jr.</div>
              </div>
            </div>

            <div className={styles.profileSection}>
              <div className={styles.profileSubsectionTitle}>Contact & Identification</div>
              <div className={styles.profileFields}>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Email address</span>
                  <div className={styles.profileFieldValue}>tomodos.joel@gmail.com</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>RFID status</span>
                  <div className={styles.profileFieldValue}>2789026414</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Verified on</span>
                  <div className={styles.profileFieldValue}>Dec 12, 2025 12:47 PM</div>
                </div>
              </div>
            </div>

            <div className={styles.profileSection}>
              <div className={styles.profileSubsectionTitle}>Academic Information</div>
              <div className={styles.profileFields}>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Program</span>
                  <div className={styles.profileFieldValue}>BSIS</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Year</span>
                  <div className={styles.profileFieldValue}>3rd Year</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>Semester</span>
                  <div className={styles.profileFieldValue}>2nd Sem</div>
                </div>
                <div className={styles.profileField}>
                  <span className={styles.profileFieldLabel}>School year</span>
                  <div className={styles.profileFieldValue}>2025-2026</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.profileSideCard}>
            <div className={styles.faceCard}>
              <div className={styles.faceCardHeader}>
                <div>
                  <p className={styles.faceCardTitle}>Face Recognition</p>
                  <p className={styles.faceCardDesc}>Enroll your face to enable self check-in on events. Only takes a few seconds with your camera.</p>
                </div>
                <span className={styles.faceStatus}>Not set up</span>
              </div>
              <div className={styles.faceFeatures}>
                <span className={styles.featurePill}>Phone & laptop</span>
                <span className={styles.featurePill}>Unique to you</span>
                <span className={styles.featurePill}>Every 7d update</span>
              </div>
              <button className={styles.primaryButton} type="button" style={{ width: '100%', marginTop: '24px' }}>
                Set Up Face ID
              </button>
            </div>

            <div className={styles.securityCard}>
              <div className={styles.profileSectionHeader}>
                <h3>Account Security</h3>
              </div>
              <p className={styles.profileCardText}>Keep your account secure with a strong password and two-factor verification.</p>
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
