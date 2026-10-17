import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, setUnauthorizedHandler } from '../api/client';
import type { LoginResponse, User, Wrapped } from '../api/types';
import { AuthContext, type AuthStatus } from './context';
import { tokenStore } from './tokenStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStore.get() ? 'loading' : 'anonymous',
  );

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  // A 401 from any request ends the session.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restore the session on first load when a token is present.
  useEffect(() => {
    let active = true;

    if (!tokenStore.get()) {
      return;
    }

    api<Wrapped<User>>('/api/v1/auth/me')
      .then((response) => {
        if (!active) return;
        setUser(response.data);
        setStatus('authenticated');
      })
      .catch(() => {
        if (active) clearSession();
      });

    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    tokenStore.set(result.token);
    setUser(result.data);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Even if the API call fails, drop the local session.
    }
    queryClient.clear();
    clearSession();
  }, [queryClient, clearSession]);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
