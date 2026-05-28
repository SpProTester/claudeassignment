import api from './api.js';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};
