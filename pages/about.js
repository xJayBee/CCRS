import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function About() {
  return (
    <Layout pageTitle="About">
      <div className={styles.cardShell}>
        <div className={styles.filterCard}>
          <h2>About This System</h2>
          <p>
            This portal helps community members report conflicts, find venues, assign mediators,
            and track progress toward resolution.
          </p>
          <p>
            Use the sidebar items to navigate between key workflows and keep the conflict
            resolution process transparent and accessible.
          </p>
        </div>
      </div>
    </Layout>
  );
}
