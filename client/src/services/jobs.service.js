import api from './api.js';

/* ─── Response normaliser ─────────────────────────────────────── */
// Handles both camelCase (Sequelize) and snake_case (raw SQL) shapes.

const norm = (j) => {
  if (!j) return null;
  const emp = j.employer ?? {};
  return {
    id:              j.id,
    title:           j.title,
    slug:            j.slug,
    description:     j.description,
    jobType:         j.jobType         ?? j.job_type,
    workMode:        j.workMode        ?? j.work_mode,
    experienceLevel: j.experienceLevel ?? j.experience_level,
    location:        j.location,
    salaryMin:       j.salaryMin       ?? j.salary_min,
    salaryMax:       j.salaryMax       ?? j.salary_max,
    viewsCount:      j.viewsCount      ?? j.views_count,
    expiresAt:       j.expiresAt       ?? j.expires_at,
    createdAt:       j.createdAt       ?? j.created_at,
    updatedAt:       j.updatedAt       ?? j.updated_at,
    categoryId:      j.categoryId      ?? j.category_id,
    rank:            j.rank,
    employer: {
      id:          emp.id          ?? j.employer_id,
      companyName: emp.companyName ?? j.company_name,
      companySlug: emp.companySlug ?? j.company_slug,
      logoUrl:     emp.logoUrl     ?? j.logo_url,
      websiteUrl:  emp.websiteUrl  ?? j.website_url,
      industry:    emp.industry    ?? j.industry,
      companySize: emp.companySize ?? j.company_size,
      isVerified:  emp.isVerified  ?? j.employer_verified,
    },
  };
};

/* ─── Jobs service ────────────────────────────────────────────── */

export const jobsService = {
  /** Full-text search with filters. Accepts same query params as GET /api/jobs. */
  search: async (params) => {
    const raw = await api.get('/jobs', { params });
    return {
      jobs:       (raw.data?.jobs ?? []).map(norm),
      pagination: raw.data?.pagination,
    };
  },

  /** Fetch single job by slug and increment views_count. */
  getBySlug: async (slug) => {
    const raw = await api.get(`/jobs/${slug}`);
    return norm(raw.data?.job);
  },

  /** Legacy by UUID — used by employer edit/detail routes. */
  getById: (id) => api.get(`/jobs/${id}`),

  /** All categories with active job counts. */
  getCategories: () => api.get('/jobs/categories'),

  /** Top searched keywords this week. */
  getTrending: () => api.get('/jobs/trending'),

  // Employer CRUD
  create:        (data)     => api.post('/jobs', data),
  update:        (id, data) => api.patch(`/jobs/${id}`, data),
  remove:        (id)       => api.delete(`/jobs/${id}`),
  getMyListings: ()         => api.get('/jobs/my/listings'),
};

/* ─── Applications service ────────────────────────────────────── */

export const applicationsService = {
  apply:        (jobId, data)       => api.post(`/applications/job/${jobId}`, data),
  getMy:        ()                  => api.get('/applications/my'),
  getForJob:    (jobId)             => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, status, notes) => api.patch(`/applications/${id}/status`, { status, employerNotes: notes }),
};
