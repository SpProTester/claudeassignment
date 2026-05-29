import api from './api.js';

export const notificationsService = {
  /** GET /api/notifications?page=1&limit=20 */
  list: (params = {}) => api.get('/notifications', { params }),

  /** PUT /api/notifications/:id/read */
  markRead: (id) => api.put(`/notifications/${id}/read`),

  /** PUT /api/notifications/read-all */
  markAllRead: () => api.put('/notifications/read-all'),

  /** DELETE /api/notifications/:id */
  remove: (id) => api.delete(`/notifications/${id}`),
};
