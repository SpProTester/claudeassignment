import api from './api.js';

export const employerService = {
  // ── Jobs ──────────────────────────────────────────────────────────────────
  listJobs:       (params) => api.get('/employer/jobs', { params }),
  getJob:         (id)     => api.get(`/employer/jobs/${id}`),
  createJob:      (data)   => api.post('/employer/jobs', data),
  updateJob:      (id, data) => api.put(`/employer/jobs/${id}`, data),
  closeJob:       (id)     => api.delete(`/employer/jobs/${id}`),
  changeStatus:   (id, status) => api.put(`/employer/jobs/${id}/status`, { status }),

  // ── ATS / Applicants ──────────────────────────────────────────────────────
  listApplicants: (jobId, params) => api.get(`/employer/jobs/${jobId}/applicants`, { params }),
  updateStage:    (id, stage)     => api.put(`/employer/applicants/${id}/stage`, { stage }),
  addNote:        (id, note)      => api.post(`/employer/applicants/${id}/note`, { note }),
  setRating:      (id, rating)    => api.put(`/employer/applicants/${id}/rating`, { rating }),
  sendEmail:      (id, data)      => api.post(`/employer/applicants/${id}/email`, data),
  resumeUrl:      (id)            => `/api/employer/applicants/${id}/resume`,

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics: (jobId) => api.get(`/employer/analytics/${jobId}`),

  // ── Company profile ───────────────────────────────────────────────────────
  getMyCompany:   ()       => api.get('/companies/my/profile'),
  createCompany:  (data)   => api.post('/companies', data),
  updateCompany:  (id, data) => api.patch(`/companies/${id}`, data),
};
