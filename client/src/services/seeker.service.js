import api from './api.js';
import { applicationsService } from './jobs.service.js';

const BASE = '/seekers';

export const seekerService = {
  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard: () => api.get(`${BASE}/dashboard`).then((r) => r.data),

  // ── Profile ──────────────────────────────────────────────────────────────
  getProfile: () => api.get(`${BASE}/profile`).then((r) => r.data),
  updateProfile: (data) => api.put(`${BASE}/profile`, data).then((r) => r.data),

  // ── Experience ───────────────────────────────────────────────────────────
  addExperience: (data) =>
    api.post(`${BASE}/profile/experience`, data).then((r) => r.data),
  updateExperience: (id, data) =>
    api.put(`${BASE}/profile/experience/${id}`, data).then((r) => r.data),
  deleteExperience: (id) => api.delete(`${BASE}/profile/experience/${id}`),

  // ── Education ────────────────────────────────────────────────────────────
  addEducation: (data) =>
    api.post(`${BASE}/profile/education`, data).then((r) => r.data),
  updateEducation: (id, data) =>
    api.put(`${BASE}/profile/education/${id}`, data).then((r) => r.data),
  deleteEducation: (id) => api.delete(`${BASE}/profile/education/${id}`),

  // ── Certifications ───────────────────────────────────────────────────────
  addCertification: (data) =>
    api.post(`${BASE}/profile/certifications`, data).then((r) => r.data),
  updateCertification: (id, data) =>
    api.put(`${BASE}/profile/certifications/${id}`, data).then((r) => r.data),
  deleteCertification: (id) => api.delete(`${BASE}/profile/certifications/${id}`),

  // ── Resumes ──────────────────────────────────────────────────────────────
  getResumes: () => api.get(`${BASE}/resume`).then((r) => r.data),
  uploadResume: (formData, onProgress) =>
    api
      .post(`${BASE}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          onProgress?.(Math.round((e.loaded * 100) / e.total)),
      })
      .then((r) => r.data),
  deleteResume: (id) => api.delete(`${BASE}/resume/${id}`),
  setDefaultResume: (id) =>
    api.put(`${BASE}/resume/${id}/default`).then((r) => r.data),

  // ── Resume Builder ────────────────────────────────────────────────────────
  getTemplates:     ()         => api.get(`${BASE}/resume/templates`).then((r) => r.data),
  createBuiltResume:(data)     => api.post(`${BASE}/resume/builder`, data).then((r) => r.data),
  getResumeContent: (id)       => api.get(`${BASE}/resume/${id}`).then((r) => r.data),
  updateBuiltResume:(id, data) => api.put(`${BASE}/resume/${id}`, data).then((r) => r.data),
  resumeExportUrl:  (id)       => `${BASE}/resume/${id}/export`,

  // ── Saved Jobs ───────────────────────────────────────────────────────────
  getSavedJobs: () => api.get(`${BASE}/saved-jobs`).then((r) => r.data),
  unsaveJob: (jobId) => api.delete(`${BASE}/saved-jobs/${jobId}`),

  // ── Applications (seeker-owned) ──────────────────────────────────────────
  // Re-uses the shared service; maps inner data for cleaner access
  getMyApplications: () => applicationsService.getMy().then((r) => r.data),
  withdrawApplication: (id) => api.delete(`/applications/${id}`),

  // ── Skills catalogue ─────────────────────────────────────────────────────
  searchSkills: (q) =>
    api.get('/skills', { params: { search: q } }).then((r) => r.data),

  // ── Job Alerts ───────────────────────────────────────────────────────────
  listAlerts:  ()     => api.get(`${BASE}/alerts`),
  createAlert: (data) => api.post(`${BASE}/alerts`, data),
  deleteAlert: (id)   => api.delete(`${BASE}/alerts/${id}`),
  toggleAlert: (id)   => api.put(`${BASE}/alerts/${id}/toggle`),
};
