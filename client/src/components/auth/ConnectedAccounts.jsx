import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/auth.service.js';
import SocialLoginButtons from './SocialLoginButtons.jsx';

function ProviderIcon({ provider }) {
  if (provider === 'google') {
    return (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 shrink-0 fill-gray-800" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function ConnectedAccounts() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [unlinkTarget, setUnlinkTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['connected-accounts'],
    queryFn: async () => {
      const res = await authService.getConnectedAccounts();
      return res.data;
    },
  });

  const accounts = data?.accounts ?? [];
  const hasPassword = data?.hasPassword ?? false;

  const unlinkMutation = useMutation({
    mutationFn: (provider) => authService.unlinkSocialAccount(provider),
    onSuccess: () => {
      setUnlinkTarget(null);
      queryClient.invalidateQueries({ queryKey: ['connected-accounts'] });
    },
    onError: (err) => {
      setError(err.message || 'Failed to unlink account.');
      setUnlinkTarget(null);
    },
  });

  const linkedProviders = new Set(accounts.map((a) => a.provider));
  const allProviders = ['google', 'apple'];
  const unlinkedProviders = allProviders.filter((p) => !linkedProviders.has(p));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Linked accounts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Connected accounts</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-xl">
            No social accounts linked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={account.provider} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{account.provider}</p>
                    <p className="text-xs text-gray-500">
                      {account.email || account.displayName || 'No email provided'}
                    </p>
                  </div>
                </div>

                {unlinkTarget === account.provider ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Are you sure?</span>
                    <button
                      onClick={() => unlinkMutation.mutate(account.provider)}
                      disabled={unlinkMutation.isPending}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {unlinkMutation.isPending ? 'Removing…' : 'Remove'}
                    </button>
                    <button
                      onClick={() => setUnlinkTarget(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setError(''); setUnlinkTarget(account.provider); }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Unlink
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Link more accounts */}
      {unlinkedProviders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Link another account</h3>
          <p className="text-xs text-gray-400 mb-3">
            Link a social account so you can sign in with it in the future.
          </p>
          <SocialLoginButtons
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['connected-accounts'] })}
            onError={setError}
          />
        </div>
      )}

      {!hasPassword && accounts.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>
            Your account has no password. You must keep at least one social login linked, or{' '}
            <a href="/forgot-password" className="font-semibold underline">set a password</a>{' '}
            before you can remove social accounts.
          </span>
        </div>
      )}
    </div>
  );
}
