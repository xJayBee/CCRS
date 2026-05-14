import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Help() {
  return (
    <Layout pageTitle="Help Center">
      <div className={styles.cardShell}>
        <div className={styles.filterCard}>
          <h2>Help Center</h2>
          <p>Find fast answers about reporting conflicts, scheduling meetings, and assigning mediators.</p>
          <ul style={{ marginTop: '18px', paddingLeft: '20px', color: '#475569' }}>
            <li>How do I submit a new conflict report?</li>
            <li>How do I update venue availability?</li>
            <li>What happens after a mediator is assigned?</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
