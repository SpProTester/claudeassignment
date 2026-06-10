import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth.service.js';
import { setAccessToken } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const bootstrapped = useRef(false);

  // ── Restore session from httpOnly cookie on mount ──────────────────────────
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    authService
      .refresh()
      .then((body) => {
        const accessToken = body.data.accessToken;
        setAccessToken(accessToken);
        setToken(accessToken);
        return authService.getMe();
      })
      .then((body) => setUser(body.data.user))
      .catch(() => {
        // No valid session — user stays null, that's fine
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Clear state when the interceptor signals a session expiry ─────────────
  useEffect(() => {
    const handleExpiry = () => {
      setAccessToken(null);
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleExpiry);
    return () => window.removeEventListener('auth:session-expired', handleExpiry);
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const body = await authService.login(email, password);
    const { accessToken, user: u } = body.data;
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const body = await authService.register(payload);
    const { accessToken, user: u } = body.data;
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* cookie cleared server-side */ }
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    const body = await authService.refresh();
    const accessToken = body.data.accessToken;
    setAccessToken(accessToken);
    setToken(accessToken);
    return accessToken;
  }, []);

  // provider: 'google' | 'apple'
  // payload: { accessToken } for Google, { identityToken, authorizationCode, user } for Apple
  const socialLogin = useCallback(async (provider, payload) => {
    let body;
    if (provider === 'google') {
      body = await authService.googleLogin(payload.accessToken);
    } else if (provider === 'apple') {
      body = await authService.appleLogin(payload.identityToken, payload.authorizationCode, payload.user);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const { accessToken, user: u } = body.data;
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const role = user?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, token, role, loading, login, register, logout, refreshToken, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
