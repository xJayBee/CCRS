'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';
import { useAuth } from '../components/AuthContext';

export default function Register() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
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
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setStatus(result.error || 'Unable to register account.');
      } else {
        setStatus('Registration successful. You can now sign in.');
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch (error) {
      setStatus('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading && user) {
    return null;
  }

  return (
    <div className={styles.authShell}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Register as a client</h1>
        <p className={styles.authSubtitle}>
          Create your client account to request mediation support and track conflict resolution progress.
        </p>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <label className={styles.formField}>
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              disabled={isSubmitting}
              required
            />
          </label>
          <label className={styles.formField}>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isSubmitting}
              required
            />
          </label>
          <label className={styles.formField}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a secure password"
              disabled={isSubmitting}
              required
            />
          </label>
          <div className={styles.authActions}>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </div>
          {status && <div className={styles.statusMessage}>{status}</div>}
          <div className={styles.authFooter}>
            <p>
              Already have an account?{' '}
              <Link href="/login" className={styles.linkButton}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
