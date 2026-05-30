import React, { useState } from 'react';
import { useAuditLog } from '../../hooks/useAdmin';
import Pagination from '../../components/common/Pagination';

const ACTION_COLORS = {
  ADMIN_LOGIN: 'text-emerald-400', ADMIN_LOGOUT: 'text-slate-400',
  USER_DEACTIVATED: 'text-red-400', USER_ACTIVATED: 'text-emerald-400',
  JOB_DELETED: 'text-red-400', JOB_CLOSE: 'text-amber-400', JOB_ACTIVATE: 'text-emerald-400',
  CATEGORY_CREATED: 'text-blue-400', CATEGORY_DELETED: 'text-red-400',
  BROADCAST_SENT: 'text-violet-400',
};

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', entityType: '', page: 1, limit: 50 });
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useAuditLog(filters);
  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Audit Log</h2>
        <p className="text-sm text-slate-400 mt-0.5">Immutable record of all admin actions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="admin-input w-52"
          placeholder="Filter by action…"
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))}
        />
        <select
          className="admin-input w-40"
          value={filters.entityType}
          onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value, page: 1 }))}
        >
          <option value="">All entities</option>
          <option value="user">User</option>
          <option value="job">Job</option>
          <option value="category">Category</option>
          <option value="session">Session</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th>IP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j}><div className="h-4 bg-slate-800 animate-pulse rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No audit entries found</td></tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                      <td className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <p className="text-sm text-slate-200">{log.admin?.fullName}</p>
                        <p className="text-xs text-slate-500">{log.admin?.email}</p>
                      </td>
                      <td>
                        <span className={`text-xs font-mono font-medium ${ACTION_COLORS[log.action] || 'text-slate-300'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        {log.entityType && (
                          <span className="text-xs text-slate-400">
                            {log.entityType}
                            {log.entityId && (
                              <span className="ml-1 text-slate-600 font-mono">{log.entityId.slice(0, 8)}…</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500">{log.ipAddress || '—'}</td>
                      <td className="text-slate-500 text-xs">{expanded === log.id ? '▲' : '▼'}</td>
                    </tr>
                    {expanded === log.id && log.details && Object.keys(log.details).length > 0 && (
                      <tr className="bg-slate-800/30">
                        <td colSpan={6} className="px-4 py-3">
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="p-4 border-t border-slate-800">
            <Pagination
              page={filters.page}
              totalPages={pagination.totalPages}
              onPage={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
