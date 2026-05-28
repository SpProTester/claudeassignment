import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { atsStageColor, atsStageLabel, timeAgo } from '../../utils/helpers.js';
import { toast } from '../../store/uiStore.js';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-gray-100 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}

function WithdrawDialog({ app, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Withdraw Application?</h3>
        <p className="text-sm text-gray-600 mb-5">
          You are about to withdraw your application for <strong>{app.job?.title}</strong> at{' '}
          <strong>{app.job?.employer?.companyName}</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-outline flex-1">Keep</button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Withdrawing…' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeekerApplications() {
  const queryClient = useQueryClient();
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', 'my'],
    queryFn: seekerService.getMyApplications,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => seekerService.withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['seeker', 'dashboard'] });
      toast.success('Application withdrawn.');
      setWithdrawTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const applications = data?.applications ?? [];
  const filtered = stageFilter === 'all'
    ? applications
    : applications.filter((a) => a.atsStage === stageFilter);

  const canWithdraw = (app) => !['hired', 'rejected'].includes(app.atsStage);

  const STAGES = ['all', 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">Browse More Jobs</Link>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              stageFilter === stage
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {stage === 'all' ? 'All' : atsStageLabel(stage)}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600">{error.message}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-medium text-gray-700">No applications found</p>
          <p className="text-xs text-gray-400 mt-1">
            {stageFilter !== 'all' ? 'Try a different filter.' : 'Start applying to land your dream job!'}
          </p>
          {stageFilter === 'all' && (
            <Link to="/jobs" className="btn-primary mt-4 inline-flex text-sm">Browse Jobs</Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${app.job?.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {app.job?.title ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {app.job?.employer?.companyName ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {timeAgo(app.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${atsStageColor(app.atsStage)}`}>
                        <span className="mr-1">●</span>
                        {atsStageLabel(app.atsStage)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {canWithdraw(app) ? (
                        <button
                          onClick={() => setWithdrawTarget(app)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {withdrawTarget && (
        <WithdrawDialog
          app={withdrawTarget}
          onConfirm={() => withdrawMutation.mutate(withdrawTarget.id)}
          onCancel={() => setWithdrawTarget(null)}
          isPending={withdrawMutation.isPending}
        />
      )}
    </div>
  );
}
