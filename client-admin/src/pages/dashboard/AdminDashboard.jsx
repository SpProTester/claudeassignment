import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useStats, useSearchTrends } from '../../hooks/useAdmin';
import StatCard from '../../components/common/StatCard';

const TOOLTIP_STYLE = { background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 11 };
const TICK_STYLE = { fill: '#94a3b8', fontSize: 11 };
const fmt = (n) => n != null ? `$${(n / 100).toFixed(2)}` : '$0.00';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useStats();
  const { data: trends } = useSearchTrends(7);

  const kpiRows = [
    // Row 1 – Users & Jobs
    [
      { title: 'Total Users', value: stats?.users?.total?.toLocaleString(), sub: `+${stats?.users?.newToday ?? 0} today`, colorClass: 'text-violet-400' },
      { title: 'Job Seekers', value: stats?.users?.seeker?.toLocaleString(), colorClass: 'text-emerald-400' },
      { title: 'Employers', value: stats?.users?.employer?.toLocaleString(), colorClass: 'text-blue-400' },
      { title: 'Total Admins', value: stats?.users?.admin?.toLocaleString(), colorClass: 'text-slate-300' },
    ],
    // Row 2 – Jobs
    [
      { title: 'Active Jobs', value: stats?.jobs?.active?.toLocaleString(), colorClass: 'text-amber-400' },
      { title: 'Total Jobs', value: stats?.jobs?.total?.toLocaleString(), colorClass: 'text-slate-300' },
      { title: 'Expired Jobs', value: stats?.jobs?.expired?.toLocaleString(), colorClass: 'text-red-400' },
      { title: 'Total Applications', value: stats?.applications?.total?.toLocaleString(), sub: `+${stats?.applications?.today ?? 0} today`, colorClass: 'text-sky-400' },
    ],
    // Row 3 – Subscriptions & Revenue
    [
      { title: 'Active Subscriptions', value: stats?.subscriptions?.active?.toLocaleString(), colorClass: 'text-emerald-400' },
      { title: 'Expired / Canceled', value: stats?.subscriptions?.expired?.toLocaleString(), colorClass: 'text-red-400' },
      { title: 'Total Revenue', value: fmt(stats?.revenue?.total), colorClass: 'text-emerald-300' },
    ],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Platform overview — real-time stats</p>
      </div>

      {/* KPI Rows */}
      {kpiRows.map((row, ri) => (
        <div key={ri} className={`grid gap-4 ${row.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {row.map((kpi) => (
            <StatCard key={kpi.title} title={kpi.title} value={kpi.value} sub={kpi.sub} colorClass={kpi.colorClass} loading={isLoading} />
          ))}
        </div>
      ))}

      {/* Registration Trend */}
      <div className="admin-card">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">User Registrations — Last 30 Days</h3>
        {stats?.registrationsTrend?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.registrationsTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={TICK_STYLE} tickFormatter={(d) => d?.slice(5)} />
              <YAxis tick={TICK_STYLE} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#regGrad)" name="Registrations" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">No registration data yet</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search Trends */}
        {trends?.topKeywords?.length > 0 && (
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Search Keywords — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.topKeywords.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ ...TICK_STYLE, fontSize: 10 }} />
                <YAxis type="category" dataKey="keyword" tick={{ ...TICK_STYLE, fontSize: 10 }} width={110} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Categories */}
        {stats?.topCategories?.length > 0 && (
          <div className="admin-card">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Job Categories</h3>
            <div className="space-y-2">
              {stats.topCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-800 last:border-0">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className="text-slate-400 text-xs">{cat.jobCount} active</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivities?.length > 0 && (
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {stats.recentActivities.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-violet-300">{log.action}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{log.admin?.fullName || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
