export default function StatsCard({ label, value, icon, color = 'purple', loading, trend }) {
  const colors = {
    purple: { bg: 'bg-primary-50',  icon: 'text-primary-600',  text: 'text-primary-700', border: 'border-primary-100' },
    green:  { bg: 'bg-green-50',    icon: 'text-green-600',    text: 'text-green-700',   border: 'border-green-100' },
    blue:   { bg: 'bg-blue-50',     icon: 'text-blue-600',     text: 'text-blue-700',    border: 'border-blue-100' },
    orange: { bg: 'bg-orange-50',   icon: 'text-orange-600',   text: 'text-orange-700',  border: 'border-orange-100' },
  };
  const c = colors[color] ?? colors.purple;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-20 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <p className={`mt-2 text-3xl font-extrabold ${c.text}`}>{value ?? '—'}</p>
          )}
          {trend && !loading && (
            <p className="text-xs text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${c.bg} ${c.icon} p-3 rounded-2xl border ${c.border}`}>{icon}</div>
      </div>
    </div>
  );
}
