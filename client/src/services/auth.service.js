import api from './api.js';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),

  // Social auth
  googleLogin: (accessToken) => api.post('/auth/social/google', { accessToken }),
  appleLogin: (identityToken, authorizationCode, user) =>
    api.post('/auth/social/apple', { identityToken, authorizationCode, user }),

  // Connected accounts
  getConnectedAccounts: () => api.get('/auth/me/connected-accounts'),
  unlinkSocialAccount: (provider) => api.delete(`/auth/me/connected-accounts/${provider}`),
};
