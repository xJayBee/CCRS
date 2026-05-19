'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import { useAuth } from '../components/AuthContext';

export default function Register() {
  const router = useRouter();
  const { user, isLoading, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatus('Please enter your name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({ name: name.trim(), email: email.trim(), password });
    setIsSubmitting(false);

    if (!result.success) {
      setStatus(result.error || 'Unable to register account.');
      return;
    }

    setStatus('Registration successful. Redirecting to sign in...');
    setName('');
    setEmail('');
    setPassword('');
    setTimeout(() => router.push('/login'), 1200);
  };

  if (!isLoading && user) {
    return null;
  }

  return (
    <div className={styles.authShell}>
      <div className={styles.authCard}>
        <div className={styles.authPanelLeft}>
          <div>
            <div className={styles.heroBadge}>CCRS</div>
            <h1 className={styles.heroTitle}>Community Conflict Resolution System</h1>
            <p className={styles.heroSubtitle}>
              Register quickly to request mediation support and manage conflict progress.
            </p>
          </div>
          <p className={styles.heroNote}>
            Create a client account with a strong password and use the portal to resolve community disputes safely.
          </p>
        </div>

        <div className={styles.authPanelRight}>
          <div className={styles.formHeader}>
            <p className={styles.formIntro}>Create account</p>
            <h2 className={styles.formTitle}>Register your client account</h2>
          </div>

          <form className={styles.authFormInner} onSubmit={handleSubmit}>
            <label className={styles.formField}>
              <span className={styles.inputLabel}>Full name</span>
              <div className={styles.inputWrap}>
                <span className={styles.fieldIcon}>👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <label className={styles.formField}>
              <span className={styles.inputLabel}>Email address</span>
              <div className={styles.inputWrap}>
                <span className={styles.fieldIcon}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <label className={styles.formField}>
              <span className={styles.inputLabel}>Password</span>
              <div className={styles.inputWrap}>
                <span className={styles.fieldIcon}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a secure password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Create account'}
            </button>

            {status && (
              <div className={styles.statusMessage} role="status" aria-live="polite">
                {status}
              </div>
            )}

            <p className={styles.authBottom}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
