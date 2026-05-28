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
