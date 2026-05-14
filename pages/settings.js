import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Settings() {
  return (
    <Layout pageTitle="Settings">
      <div className={styles.cardShell}>
        <div className={styles.filterCard}>
          <h2>Settings</h2>
          <p>Manage account preferences, notification settings, and display options for your mediation dashboard.</p>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Notification Preferences:</strong> Email and in-app alerts enabled.</p>
            <p><strong>Language:</strong> English</p>
            <p><strong>Timezone:</strong> UTC+8</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
