export default function StatCard({ title, value, sub, colorClass = 'text-violet-400', loading = false }) {
  return (
    <div className="admin-card">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      {loading ? (
        <div className="h-8 bg-slate-800 animate-pulse rounded w-24 mt-2" />
      ) : (
        <p className={`text-3xl font-bold ${colorClass}`}>{value ?? '—'}</p>
      )}
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
