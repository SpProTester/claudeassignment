export const formatSalary = (min, max) => {
  if (!min && !max) return 'Salary not specified';
  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
};

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const jobTypeBadgeColor = (type) => {
  const map = {
    'full-time': 'bg-blue-100 text-blue-700',
    'part-time': 'bg-purple-100 text-purple-700',
    'contract': 'bg-orange-100 text-orange-700',
    'remote': 'bg-green-100 text-green-700',
    'internship': 'bg-yellow-100 text-yellow-700',
  };
  return map[type] || 'bg-gray-100 text-gray-700';
};

export const applicationStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-indigo-100 text-indigo-700',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-green-100 text-green-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const truncate = (str, max = 120) =>
  str && str.length > max ? `${str.slice(0, max)}…` : str;

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(1)} MB`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
  });
};

export const atsStageColor = (stage) => {
  const map = {
    applied:     'bg-blue-100 text-blue-700',
    screening:   'bg-yellow-100 text-yellow-800',
    reviewing:   'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-indigo-100 text-indigo-700',
    interview:   'bg-purple-100 text-purple-700',
    offer:       'bg-teal-100 text-teal-700',
    hired:       'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-700',
  };
  return map[stage] || 'bg-gray-100 text-gray-700';
};

export const atsStageLabel = (stage) => {
  const map = {
    applied:     'Applied',
    screening:   'Screening',
    reviewing:   'Reviewing',
    shortlisted: 'Shortlisted',
    interview:   'Interview',
    offer:       'Offer Extended',
    hired:       'Hired',
    rejected:    'Rejected',
  };
  return map[stage] || stage;
};

export const jobStatusColor = (status) => {
  const map = {
    draft:   'bg-gray-100 text-gray-600',
    active:  'bg-green-100 text-green-700',
    paused:  'bg-yellow-100 text-yellow-700',
    closed:  'bg-red-100 text-red-700',
    expired: 'bg-orange-100 text-orange-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const jobStatusLabel = (status) => {
  const map = {
    draft: 'Draft', active: 'Active', paused: 'Paused', closed: 'Closed', expired: 'Expired',
  };
  return map[status] || status;
};

export const workModeBadgeColor = (mode) => {
  const map = {
    onsite: 'bg-slate-100 text-slate-700',
    remote: 'bg-emerald-100 text-emerald-700',
    hybrid: 'bg-cyan-100 text-cyan-700',
  };
  return map[mode] || 'bg-gray-100 text-gray-700';
};
