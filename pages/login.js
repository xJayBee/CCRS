'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import { useAuth } from '../components/AuthContext';

export default function Login() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
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

    if (!email.trim() || !password.trim()) {
      setStatus('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn({ email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setStatus(result.error || 'Unable to sign in.');
      return;
    }

    router.push('/');
  };

  return (
    <div className={styles.authShell}>
      <div className={styles.authCard}>
        <div className={styles.authPanelLeft}>
          <div>
            <div className={styles.heroBadge}>CCRS</div>
            <h1 className={styles.heroTitle}>Community Conflict Resolution System</h1>
            <p className={styles.heroSubtitle}>Mediate disputes and resolve community conflicts</p>
            <p className={styles.heroMeta}>Powered by local justice partners</p>
          </div>
          <p className={styles.heroNote}>
            Welcome to the secure community conflict resolution portal. Log in with your credentials to continue to the system.
          </p>
        </div>

        <div className={styles.authPanelRight}>
          <div className={styles.formHeader}>
            <p className={styles.formIntro}>Welcome</p>
            <h2 className={styles.formTitle}>Sign in to your account to continue</h2>
          </div>

          <form className={styles.authFormInner} onSubmit={handleSubmit}>
            <label className={styles.formField}>
              <span className={styles.inputLabel}>Email address</span>
              <div className={styles.inputWrap}>
                <span className={styles.fieldIcon}>👤</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mediator@example.com"
                  disabled={isSubmitting}
                  autoFocus
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
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <div className={styles.passwordRow}>
              <a href="#" className={styles.forgotLink}>
                Forgot your password?
              </a>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'SIGN IN'}
            </button>

            {status && <div className={styles.statusMessage}>{status}</div>}

            <p className={styles.authBottom}>
              Need an account?{' '}
              <Link href="/register">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
