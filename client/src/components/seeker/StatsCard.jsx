export default function StatsCard({ label, value, icon, color = 'blue', loading }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   text: 'text-blue-700'  },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  text: 'text-green-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700'},
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-700'},
  };
  const c = colors[color] ?? colors.blue;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className={`mt-1 text-3xl font-bold ${c.text}`}>{value ?? '—'}</p>
          )}
        </div>
        <div className={`${c.bg} ${c.icon} p-3 rounded-xl`}>{icon}</div>
      </div>
    </div>
  );
}
