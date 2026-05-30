import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '../services/payments.service.js';

// Plan tier: higher = more features
export const PLAN_TIER = {
  starter: 0, free: 0,
  professional: 1, basic: 1,
  business: 2, premium: 2,
};

// Max active job postings per plan (mirrors backend PLAN_QUOTAS)
export const PLAN_LIMITS = {
  starter: 5, free: 5,
  professional: 20, basic: 20,
  business: Infinity, premium: Infinity,
};

// Display-friendly plan names (normalises legacy free/basic/premium)
export const PLAN_DISPLAY = {
  starter: 'Starter', free: 'Starter',
  professional: 'Professional', basic: 'Professional',
  business: 'Business', premium: 'Business',
};

export function useBilling({ enabled = true } = {}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['billing'],
    queryFn: paymentsService.getBilling,
    staleTime: 30_000,
    retry: false,
    enabled,
  });

  const currentPlan = data?.data?.currentPlan ?? null;
  const billingHistory = data?.data?.billingHistory ?? [];
  const planId = currentPlan?.id ?? 'starter';
  const tier = PLAN_TIER[planId] ?? 0;
  const jobLimit = PLAN_LIMITS[planId] ?? 5;

  return { currentPlan, billingHistory, planId, tier, jobLimit, isLoading, isError, refetch };
}
