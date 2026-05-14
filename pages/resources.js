import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Resources() {
  return (
    <Layout pageTitle="Resources">
      <div className={styles.cardShell}>
        <div className={styles.filterCard}>
          <h2>Resources</h2>
          <p>
            Access useful guides, tutorials, and support articles to help you manage community
            conflict and mediation effectively.
          </p>
          <ul>
            <li>Community mediation best practices</li>
            <li>Venue selection guidelines</li>
            <li>Conflict de-escalation techniques</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
