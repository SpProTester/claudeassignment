import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: refreshData } = await authApi.refresh();
        window.__adminAccessToken = refreshData.data.accessToken;
        const { data: meData } = await authApi.me();
        setAdmin(meData.data.user);
      } catch {
        // No active session — stay logged out
        window.__adminAccessToken = null;
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    window.__adminAccessToken = data.data.accessToken;
    setAdmin(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    window.__adminAccessToken = null;
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};
