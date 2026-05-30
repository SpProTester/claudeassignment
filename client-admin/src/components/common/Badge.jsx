const VARIANTS = {
  green:  'bg-emerald-500/15 text-emerald-400',
  red:    'bg-red-500/15 text-red-400',
  yellow: 'bg-amber-500/15 text-amber-400',
  blue:   'bg-blue-500/15 text-blue-400',
  violet: 'bg-violet-500/15 text-violet-400',
  gray:   'bg-slate-700 text-slate-400',
};

const STATUS_COLOR = {
  // user / account status
  active: 'green', inactive: 'red', deactivated: 'red',
  // job status
  draft: 'gray', closed: 'gray', expired: 'yellow', paused: 'yellow',
  // roles
  admin: 'violet', employer: 'blue', seeker: 'green',
  // subscription plans
  free: 'gray', starter: 'gray', professional: 'blue', business: 'violet', enterprise: 'yellow', premium: 'yellow', basic: 'blue',
  // subscription status
  canceled: 'red', past_due: 'red', trialing: 'blue', at_risk: 'yellow', none: 'gray',
  // payment status
  paid: 'green', failed: 'red', pending: 'yellow', refunded: 'yellow',
  // verification
  verified: 'green', unverified: 'yellow',
  // ATS stages
  applied: 'gray', screening: 'blue', reviewing: 'blue', shortlisted: 'violet',
  interview: 'violet', offer: 'green', hired: 'green', rejected: 'red',
};

export default function Badge({ label, variant }) {
  const color = variant || STATUS_COLOR[label?.toLowerCase()] || 'gray';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${VARIANTS[color] || VARIANTS.gray}`}>
      {label}
    </span>
  );
}
