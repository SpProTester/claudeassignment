# Payments — Frontend Flow

---

## Pricing Page (Public)

```
/pricing
  ↓
Pricing.jsx:
  ├─ 4 PricingCard components (Free / Pro / Business / Enterprise)
  │   Each shows: price, feature list, CTA button
  ├─ "Current plan" badge on active plan (if logged in as employer)
  └─ "Get Started" → /register?role=employer
     "Upgrade" → POST /api/payments/checkout → redirect to Stripe Checkout
```

## Employer Billing Page

```
/employer/billing
  ↓
BillingPage.jsx:
  ├─ Current Plan card: plan name, renewal date, cancel status
  ├─ Usage bar: active jobs / limit
  ├─ "Upgrade Plan" button → checkout flow
  ├─ "Manage Billing" button → Stripe Customer Portal
  └─ Invoice list (last 5) with link to InvoicesPage
```

## Upgrade Flow

```
Employer clicks "Upgrade to Professional"
  ↓
POST /api/payments/checkout { plan: 'professional' }
  ↓
Redirect to Stripe Checkout URL (new tab or same page)
  ↓
User completes payment on Stripe
  ↓
Stripe calls POST /api/payments/webhook (checkout.session.completed)
  ↓
Backend updates employer_profiles.subscription_plan
  ↓
User is redirected back to /employer/billing?success=true
  ↓
BillingPage shows updated plan + success toast
```

## Feature Gating

```jsx
// PlanGate.jsx — renders children if plan meets minimum, otherwise UpgradeModal
<PlanGate minPlan="professional">
  <AdvancedAnalytics />
</PlanGate>

// UpgradeModal — shown when quota exceeded or gated feature accessed
<UpgradeModal
  currentPlan="free"
  requiredPlan="professional"
  feature="More than 2 job listings"
/>
```

## useBilling Hook

```javascript
const { plan, jobPostLimit, usedJobs, isAtLimit, upgrade } = useBilling();
```
