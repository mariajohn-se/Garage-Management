import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, SessionUser } from '../api/authApi';
import { clearTokens, getRefreshToken, setTokens } from '../api/client';

interface AuthContextValue {
  session: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const s = await authApi.session();
      setSession(s);
    } catch {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    setTokens(result.token, result.refreshToken);
    setSession(result.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearTokens();
      setSession(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, refreshSession }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
