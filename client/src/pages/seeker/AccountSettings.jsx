import ConnectedAccounts from '../../components/auth/ConnectedAccounts.jsx';

export default function AccountSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your login methods and security preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900">Social login</h2>
          <p className="text-sm text-gray-500 mt-1">
            Link social accounts to sign in without a password.
          </p>
        </div>
        <ConnectedAccounts />
      </div>
    </div>
  );
}
