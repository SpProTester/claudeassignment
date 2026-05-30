import axios from 'axios';

// ── In-memory access token (never in localStorage — XSS protection) ─────────
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
  withCredentials: true, // send httpOnly refresh token cookie on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach Bearer token ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response: unwrap data + auto-refresh on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// Auth endpoints must never trigger the auto-refresh loop
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];
const isAuthEndpoint = (url = '') => NO_REFRESH_URLS.some((u) => url.includes(u));

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const original = err.config;

    // Only attempt refresh for authenticated requests whose token has expired.
    // Auth endpoints (login, register, refresh) must fall through to the error
    // handler so their backend messages reach the UI unchanged.
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      // Queue concurrent 401s while one refresh is already in flight
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Plain axios — bypasses our interceptor so it can't loop
        const { data } = await axios.post(
          `${BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data?.data?.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        // AuthContext listens for this to clear user state
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const data = err.response?.data;
    const message = data?.message || err.message || 'An unexpected error occurred.';
    const apiError = new Error(message);
    // Preserve field-level validation errors so forms can map them to fields
    if (data?.errors?.length) apiError.fieldErrors = data.errors;
    return Promise.reject(apiError);
  }
);

export default api;
