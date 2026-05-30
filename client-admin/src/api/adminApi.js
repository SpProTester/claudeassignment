import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = window.__adminAccessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const drainQueue = (token, error) => {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry && !orig.url?.includes('/admin/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }

      orig._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/admin/auth/refresh');
        const token = data.data.accessToken;
        window.__adminAccessToken = token;
        drainQueue(token, null);
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      } catch (refreshErr) {
        drainQueue(null, refreshErr);
        window.__adminAccessToken = null;
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (creds) => api.post('/admin/auth/login', creds),
  logout: () => api.post('/admin/auth/logout'),
  me: () => api.get('/admin/auth/me'),
  refresh: () => api.post('/admin/auth/refresh'),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsApi = {
  overview: () => api.get('/admin/stats'),
  searchTrends: (days = 7) => api.get(`/admin/stats/search-trends?days=${days}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params) => api.get('/admin/users', { params }),
  get: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
};

// ── Employers ─────────────────────────────────────────────────────────────────
export const employersApi = {
  list: (params) => api.get('/admin/employers', { params }),
  get: (id) => api.get(`/admin/employers/${id}`),
  verify: (id, isVerified) => api.patch(`/admin/employers/${id}/verify`, { isVerified }),
  assignPlan: (id, data) => api.patch(`/admin/employers/${id}/plan`, data),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsApi = {
  list: (params) => api.get('/admin/jobs', { params }),
  moderate: (id, action) => api.patch(`/admin/jobs/${id}/moderate`, { action }),
  remove: (id) => api.delete(`/admin/jobs/${id}`),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationsApi = {
  list: (params) => api.get('/admin/applications', { params }),
  updateStatus: (id, atsStage) => api.patch(`/admin/applications/${id}/status`, { atsStage }),
};

// ── Subscriptions & Payments ──────────────────────────────────────────────────
export const subscriptionsApi = {
  list: (params) => api.get('/admin/subscriptions', { params }),
  payments: (params) => api.get('/admin/payments', { params }),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  get: (params) => api.get('/admin/reports', { params }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get('/admin/categories'),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  remove: (id) => api.delete(`/admin/categories/${id}`),
};

// ── Admin Users ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list: () => api.get('/admin/settings/admins'),
  create: (data) => api.post('/admin/settings/admins', data),
  updateStatus: (id, isActive) => api.patch(`/admin/settings/admins/${id}/status`, { isActive }),
};

// ── Audit Log ─────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params) => api.get('/admin/audit-log', { params }),
};

// ── Broadcast ─────────────────────────────────────────────────────────────────
export const broadcastApi = {
  send: (data) => api.post('/admin/broadcast', data),
};
