import type { UUID, Timestamp } from "./common";

export type PlanTier = "free" | "starter" | "professional" | "enterprise";
export type BillingInterval = "monthly" | "annual";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "paused";

export interface Plan {
  id: UUID;
  name: string;
  tier: PlanTier;
  billingInterval: BillingInterval;
  price: number;
  currency: string;
  features: PlanFeatures;
  stripePriceId: string | null;
  razorpayPlanId: string | null;
  isActive: boolean;
}

export interface PlanFeatures {
  jobPostings: number;
  featuredJobPostings: number;
  resumeSearches: number;
  teamMembers: number;
  candidateDatabase: boolean;
  atsAccess: boolean;
  aiScreening: boolean;
  analyticsLevel: "basic" | "advanced" | "enterprise";
  supportLevel: "community" | "email" | "priority" | "dedicated";
}

export interface Subscription {
  id: UUID;
  companyId: UUID | null;
  seekerId: UUID | null;
  planId: UUID;
  status: SubscriptionStatus;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Timestamp | null;
  stripeSubscriptionId: string | null;
  razorpaySubscriptionId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
