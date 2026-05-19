'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  register: async () => {},
});

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          setUser(null);
          setError(null);
        } else {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (fetchError) {
        setUser(null);
        setError('Unable to verify authentication.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuth();
  }, []);

  const signIn = async ({ email, password }) => {
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError, 'Status:', response.status);
        const text = await response.text();
        console.error('Response body:', text);
        setError('Server returned an invalid response.');
        return { success: false, error: 'Server returned an invalid response.' };
      }

      if (!response.ok) {
        setError(data.error || 'Unable to sign in.');
        return { success: false, error: data.error || 'Unable to sign in.' };
      }

      setUser(data.user);
      return { success: true };
    } catch (fetchError) {
      console.error('Sign-in fetch error:', fetchError?.message || fetchError);
      setError('Unable to connect to the server.');
      return { success: false, error: 'Unable to connect to the server.' };
    }
  };

  const register = async ({ name, email, password }) => {
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to register.');
        return { success: false, error: data.error || 'Unable to register.' };
      }

      return { success: true, user: data.user };
    } catch (fetchError) {
      console.error('Register fetch error:', fetchError?.message || fetchError);
      setError('Unable to connect to the server.');
      return { success: false, error: 'Unable to connect to the server.' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      // ignore errors while logging out
    }

    setUser(null);
    router.push('/login');
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      signIn,
      signOut,
      register,
    }),
    [user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
