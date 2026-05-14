'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../components/AuthContext';
import styles from '../styles/Home.module.css';

const roleOptions = ['admin', 'mediator', 'staff', 'client'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('Loading user list...');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [isSaving, setIsSaving] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setStatus('Please log in to load users.');
      return;
    }

    if (user.role !== 'admin') {
      setStatus('Only admins can view and create users.');
      return;
    }

    fetchUsers();
  }, [isLoading, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(
          `${data.error || 'Unable to load users.'}${data.details ? ` — ${data.details}` : ''}`
        );
        return;
      }
      setUsers(data);
      setStatus('');
    } catch {
      setStatus('Unable to connect to the server.');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setStatus('Name, email, and password are required.');
      return;
    }

    setIsSaving(true);
    setStatus('Creating user...');

    const response = await fetch('/api/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(
        `${data.error || 'Unable to create user.'}${data.details ? ` — ${data.details}` : ''}`
      );
      setIsSaving(false);
      return;
    }

    setUsers((current) => [data.user, ...current]);
    setName('');
    setEmail('');
    setPassword('');
    setRole('staff');
    setStatus('User created successfully.');
    setIsSaving(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Layout pageTitle="Users">
      <div className={styles.cardShell}>
        <div className={styles.panelCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Registered users</h2>
              <p>All users and admin accounts stored in the local database.</p>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className={styles.formCard}>
              <div className={styles.sectionHeader}>
                <h3>Create new user</h3>
                <p>Add a user account for mediators, staff, clients, or additional admins.</p>
              </div>
              <form className={styles.formGrid} onSubmit={handleCreateUser}>
                <label className={styles.formField}>
                  <span>Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
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
                    required
                  />
                </label>
                <label className={styles.formField}>
                  <span>Role</span>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.panelActions}>
                  <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                    {isSaving ? 'Creating…' : 'Create user'}
                  </button>
                </div>
                {status && <p className={styles.statusMessage}>{status}</p>}
              </form>
            </div>
          )}

          {status && user?.role !== 'admin' ? (
            <div className={styles.statusMessage}>{status}</div>
          ) : (
            <div className={styles.userTable}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>{userItem.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
