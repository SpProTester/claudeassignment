import api from './api.js';

export const jobsService = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  remove: (id) => api.delete(`/jobs/${id}`),
  getMyListings: () => api.get('/jobs/my/listings'),
};

export const applicationsService = {
  apply: (jobId, data) => api.post(`/applications/job/${jobId}`, data),
  getMy: () => api.get('/applications/my'),
  getForJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, status, notes) =>
    api.patch(`/applications/${id}/status`, { status, employerNotes: notes }),
};
