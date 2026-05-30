import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useStats, useSearchTrends } from '../../hooks/useAdmin';
import StatCard from '../../components/common/StatCard';

const PERIOD_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const PIE_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706'];

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { data: stats, isLoading } = useStats();
  const { data: trends, isLoading: trendsLoading } = useSearchTrends(days);

  const roleData = stats
    ? [
        { name: 'Seekers', value: stats.users.seeker },
        { name: 'Employers', value: stats.users.employer },
        { name: 'Admins', value: stats.users.admin },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Platform performance and search insights</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                days === opt.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.users?.total?.toLocaleString()} loading={isLoading} />
        <StatCard title="Active Jobs" value={stats?.jobs?.active?.toLocaleString()} colorClass="text-amber-400" loading={isLoading} />
        <StatCard title="Applications Today" value={stats?.applications?.today?.toLocaleString()} colorClass="text-sky-400" loading={isLoading} />
        <StatCard title="New Users Today" value={stats?.users?.newToday?.toLocaleString()} colorClass="text-emerald-400" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration trend */}
        <div className="admin-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">User Registrations (Last 30 Days)</h3>
          {stats?.registrationsTrend?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.registrationsTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(d) => d?.slice(5)} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} name="Registrations" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data</div>
          )}
        </div>

        {/* User breakdown pie */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">User Breakdown</h3>
          {roleData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 11 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Search trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Search Keywords</h3>
          {trendsLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trends?.topKeywords?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends.topKeywords.slice(0, 6)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="category" dataKey="keywords" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 11 }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No search data for this period</div>
          )}
        </div>

        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Zero-Result Searches</h3>
          {trends?.zeroResults?.length ? (
            <div className="space-y-2">
              {trends.zeroResults.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800 last:border-0">
                  <span className="text-slate-300 font-mono text-xs">{item.keywords}</span>
                  <span className="text-red-400 text-xs font-medium">{item.count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center text-slate-500 text-sm">
              No zero-result searches
            </div>
          )}
          <p className="text-xs text-slate-600 mt-3">These keywords had no results — consider adding matching content</p>
        </div>
      </div>
    </div>
  );
}
