import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  statsApi,
  usersApi,
  employersApi,
  jobsApi,
  applicationsApi,
  subscriptionsApi,
  reportsApi,
  categoriesApi,
  adminUsersApi,
  auditApi,
} from '../api/adminApi';

// ── Stats ─────────────────────────────────────────────────────────────────────
export const useStats = () =>
  useQuery({ queryKey: ['admin', 'stats'], queryFn: () => statsApi.overview().then((r) => r.data.data), staleTime: 30_000 });

export const useSearchTrends = (days) =>
  useQuery({ queryKey: ['admin', 'search-trends', days], queryFn: () => statsApi.searchTrends(days).then((r) => r.data.data) });

// ── Users ─────────────────────────────────────────────────────────────────────
export const useUsers = (params) =>
  useQuery({ queryKey: ['admin', 'users', params], queryFn: () => usersApi.list(params).then((r) => r.data.data), keepPreviousData: true });

export const useUser = (id) =>
  useQuery({ queryKey: ['admin', 'user', id], queryFn: () => usersApi.get(id).then((r) => r.data.data), enabled: !!id });

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => usersApi.updateStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

// ── Employers ─────────────────────────────────────────────────────────────────
export const useEmployers = (params) =>
  useQuery({ queryKey: ['admin', 'employers', params], queryFn: () => employersApi.list(params).then((r) => r.data.data), keepPreviousData: true });

export const useEmployer = (id) =>
  useQuery({ queryKey: ['admin', 'employer', id], queryFn: () => employersApi.get(id).then((r) => r.data.data), enabled: !!id });

export const useVerifyEmployer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerified }) => employersApi.verify(id, isVerified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'employers'] }),
  });
};

export const useAssignEmployerPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => employersApi.assignPlan(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'employers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'employer', vars.id] });
    },
  });
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const useAdminJobs = (params) =>
  useQuery({ queryKey: ['admin', 'jobs', params], queryFn: () => jobsApi.list(params).then((r) => r.data.data), keepPreviousData: true });

export const useModerateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => jobsApi.moderate(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => jobsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

// ── Applications ──────────────────────────────────────────────────────────────
export const useApplications = (params) =>
  useQuery({ queryKey: ['admin', 'applications', params], queryFn: () => applicationsApi.list(params).then((r) => r.data.data), keepPreviousData: true });

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, atsStage }) => applicationsApi.updateStatus(id, atsStage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'applications'] }),
  });
};

// ── Subscriptions & Payments ──────────────────────────────────────────────────
export const useSubscriptions = (params) =>
  useQuery({ queryKey: ['admin', 'subscriptions', params], queryFn: () => subscriptionsApi.list(params).then((r) => r.data.data), keepPreviousData: true });

export const usePayments = (params) =>
  useQuery({ queryKey: ['admin', 'payments', params], queryFn: () => subscriptionsApi.payments(params).then((r) => r.data.data), keepPreviousData: true });

// ── Reports ───────────────────────────────────────────────────────────────────
export const useReports = (params) =>
  useQuery({ queryKey: ['admin', 'reports', params], queryFn: () => reportsApi.get(params).then((r) => r.data.data), keepPreviousData: true });

// ── Categories ────────────────────────────────────────────────────────────────
export const useCategories = () =>
  useQuery({ queryKey: ['admin', 'categories'], queryFn: () => categoriesApi.list().then((r) => r.data.data.categories) });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => categoriesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  });
};

// ── Admin Users ───────────────────────────────────────────────────────────────
export const useAdminUsers = () =>
  useQuery({ queryKey: ['admin', 'admin-users'], queryFn: () => adminUsersApi.list().then((r) => r.data.data.users) });

export const useCreateAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminUsersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'admin-users'] }),
  });
};

export const useUpdateAdminStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => adminUsersApi.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'admin-users'] }),
  });
};

// ── Audit Log ─────────────────────────────────────────────────────────────────
export const useAuditLog = (params) =>
  useQuery({ queryKey: ['admin', 'audit-log', params], queryFn: () => auditApi.list(params).then((r) => r.data.data), keepPreviousData: true });
