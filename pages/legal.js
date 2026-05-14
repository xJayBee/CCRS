import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Legal() {
  return (
    <Layout pageTitle="Legal">
      <div className={styles.cardShell}>
        <div className={styles.filterCard}>
          <h2>Legal & Privacy</h2>
          <p>
            Review the terms of use, privacy policy, and guidelines that govern how conflict reports
            are submitted and managed within this system.
          </p>
          <p>
            Your information is handled responsibly, and the platform is designed to support
            fair and transparent community conflict resolution.
          </p>
        </div>
      </div>
    </Layout>
  );
}
