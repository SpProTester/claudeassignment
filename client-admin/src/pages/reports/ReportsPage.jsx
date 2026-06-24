import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useReports, useStats } from '../../hooks/useAdmin';
import StatCard from '../../components/common/StatCard';

const REPORT_TYPES = [
  { value: 'users', label: 'User Registrations' },
  { value: 'jobs', label: 'Job Postings' },
  { value: 'applications', label: 'Applications' },
  { value: 'revenue', label: 'Revenue' },
];

const DAY_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '6 months' },
  { value: 365, label: '1 year' },
];

const CHART_COLOR = '#7c3aed';
const TOOLTIP_STYLE = { background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 11 };
const TICK_STYLE = { fill: '#94a3b8', fontSize: 10 };

const fmt = (n) => n != null ? `$${(Number(n) / 100).toFixed(2)}` : '—';

function exportToCsv(filename, rows) {
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? '';
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [type, setType] = useState('users');
  const [days, setDays] = useState(30);

  const { data: reportData, isLoading } = useReports({ type, days });
  const { data: stats } = useStats();

  const chartData = reportData?.data || [];

  const isRevenue = type === 'revenue';
  const total = isRevenue
    ? chartData.reduce((sum, d) => sum + Number(d.total || 0), 0)
    : chartData.reduce((sum, d) => sum + Number(d.count || 0), 0);

  const summary = [
    { title: 'Total Users', value: stats?.users?.total?.toLocaleString(), colorClass: 'text-violet-400' },
    { title: 'Total Jobs', value: stats?.jobs?.total?.toLocaleString(), colorClass: 'text-amber-400' },
    { title: 'Total Applications', value: stats?.applications?.total?.toLocaleString(), colorClass: 'text-sky-400' },
    { title: 'Total Revenue', value: stats?.revenue?.total ? fmt(stats.revenue.total) : '$0', colorClass: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Reports &amp; Analytics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Platform-wide statistics and trend reports</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} colorClass={s.colorClass} loading={!stats} />
        ))}
      </div>

      {/* Report controls */}
      <div className="admin-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-slate-800 rounded-lg p-1">
            {REPORT_TYPES.map((rt) => (
              <button
                key={rt.value}
                onClick={() => setType(rt.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  type === rt.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDays(d.value)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    days === d.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button
              disabled={chartData.length === 0}
              onClick={() => {
                const label = REPORT_TYPES.find((r) => r.value === type)?.label ?? type;
                const rows = isRevenue
                  ? chartData.map((r) => ({ month: r.month ?? '', transactions: r.count ?? 0, revenue_usd: ((r.total ?? 0) / 100).toFixed(2) }))
                  : chartData.map((r) => ({ date: r.date ?? '', count: r.count ?? 0 }));
                exportToCsv(`${type}-report-${days}d.csv`, rows);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Period total */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-white">
              {isRevenue ? fmt(total) : total.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {REPORT_TYPES.find((r) => r.value === type)?.label} in last {days} days
            </p>
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-[260px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
            No data for this period
          </div>
        ) : isRevenue ? (
          <RevenueChart data={chartData} />
        ) : (
          <TrendChart data={chartData} label={REPORT_TYPES.find((r) => r.value === type)?.label} />
        )}
      </div>

      {/* Breakdown tables */}
      {!isRevenue && chartData.length > 0 && (
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {[...chartData].reverse().slice(0, 30).map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{row.date}</td>
                    <td className="font-medium text-violet-300">{Number(row.count).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isRevenue && chartData.length > 0 && (
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Transactions</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...chartData].reverse().map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{row.month ? new Date(row.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="text-slate-300">{Number(row.count).toLocaleString()}</td>
                    <td className="font-semibold text-emerald-400">{fmt(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendChart({ data, label }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={TICK_STYLE} tickFormatter={(d) => d?.slice(5)} />
        <YAxis tick={TICK_STYLE} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [Number(v).toLocaleString(), label]} />
        <Area type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} fill="url(#trendGrad)" name={label} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RevenueChart({ data }) {
  const chartData = data.map((d) => ({
    month: d.month ? new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : '?',
    revenue: Number(d.total || 0) / 100,
    count: Number(d.count || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" tick={TICK_STYLE} />
        <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v, name) => [name === 'revenue' ? `$${v.toFixed(2)}` : v, name === 'revenue' ? 'Revenue' : 'Transactions']}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <Bar dataKey="revenue" fill={CHART_COLOR} radius={[4, 4, 0, 0]} name="revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
}
