'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, isLoading } = useAuth();

  const canManage = user?.role === 'admin';

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setStatus('Please log in to load users.');
      return;
    }

    if (!canManage) {
      setStatus('Only admins can view and create users.');
      return;
    }

    fetchUsers();
  }, [isLoading, user, canManage]);

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

  const handleRoleUpdate = async (userItem, newRole) => {
    if (userItem.role === newRole) return;
    setIsUpdating(true);
    setStatus(`Updating role for ${userItem.name}...`);

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userItem.id, role: newRole }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Unable to update role.');
        return;
      }
      setUsers((current) =>
        current.map((item) => (item.id === userItem.id ? { ...item, role: data.user.role } : item))
      );
      setStatus(`Role updated for ${data.user.name}.`);
    } catch (error) {
      console.error('Role update failed:', error);
      setStatus('Unable to update role.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userItem) => {
    if (!window.confirm(`Delete user ${userItem.name}? This cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    setStatus(`Deleting ${userItem.name}...`);

    try {
      const response = await fetch(`/api/users?id=${encodeURIComponent(userItem.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Unable to delete user.');
        return;
      }
      setUsers((current) => current.filter((item) => item.id !== userItem.id));
      setStatus(`Deleted ${userItem.name}.`);
    } catch (error) {
      console.error('Delete user failed:', error);
      setStatus('Unable to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((userItem) => {
      const matchesSearch = searchTerm
        ? [userItem.name, userItem.email, userItem.role]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      const matchesRole = roleFilter ? userItem.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

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
              <p>View and manage user accounts with role controls and search.</p>
            </div>
          </div>

          {canManage && (
            <div className={styles.formCard}>
              <div className={styles.sectionHeader}>
                <h3>Create new user</h3>
                <p>Add a user account for mediators, staff members, clients, or additional admins.</p>
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

          <div className={styles.formGroup} style={{ marginTop: '24px' }}>
            <div className={styles.filterRow} style={{ gap: '14px', marginBottom: '20px' }}>
              <div className={styles.formField} style={{ flex: '1 1 240px' }}>
                <label htmlFor="searchTerm">Search users</label>
                <input
                  id="searchTerm"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or role"
                />
              </div>
              <div className={styles.formField} style={{ flex: '0 0 180px' }}>
                <label htmlFor="roleFilter">Filter by role</label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All roles</option>
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {status && !canManage ? (
            <div className={styles.statusMessage}>{status}</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id}>
                      <td>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td>
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleUpdate(userItem, e.target.value)}
                          disabled={isUpdating || userItem.id === user?.id}
                        >
                          {roleOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={() => handleDeleteUser(userItem)}
                          disabled={isDeleting || userItem.id === user?.id}
                        >
                          Delete
                        </button>
                      </td>
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
