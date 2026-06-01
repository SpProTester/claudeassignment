# Prompt 17 — Billing & Pricing Frontend

## Phase
Phase 7 — Payments

## Objective
Build the public pricing page, employer billing dashboard, plan upgrade flow, and invoice management UI.

---

## Prompt to Use

```
Build the billing and subscription UI for the Job Portal React app.

1. client/src/pages/public/PricingPage.jsx:
   - Monthly/Annual toggle (annual = 20% discount label)
   - 3 plan cards in a row:
     
     Starter (Free):
     - Price: $0/month
     - Features list with checkmarks and X marks:
       ✓ 2 active job posts
       ✓ Basic applicant view
       ✓ Community support
       ✗ Featured listings
       ✗ ATS features
       ✗ Analytics
     - CTA: "Get Started Free" → /register?role=employer

     Professional ($99/month):
     - "Most Popular" badge (highlighted border)
     - 10 active posts, 2 featured/month, Full ATS, Standard analytics, Email support
     - CTA: "Start Free Trial" (14 days)

     Business ($299/month):
     - 50 active posts, 10 featured/month, Full ATS + Export, Advanced analytics, Priority support
     - CTA: "Upgrade to Business"

   - FAQ section below: 5-6 common billing questions with accordion

2. client/src/pages/employer/BillingPage.jsx:
   
   Current Plan Card:
   - Plan name badge (color coded)
   - Renewal date or "Cancels on {date}" if cancelled
   - Usage: "7 / 10 job posts used" with progress bar
   - Featured listings used this month
   - "Manage Billing" button → Stripe billing portal
   - "Cancel Plan" link with confirmation modal

   Upgrade/Change Plan section:
   - Compact 3-column plan comparison
   - Current plan highlighted with "Current Plan" badge
   - Other plans show "Upgrade" or "Downgrade" button
   - Clicking Upgrade → loading state → redirect to Stripe Checkout

   Invoices table:
   - Date, Plan, Amount, Status (Paid/Failed), Download PDF link
   - Empty state if no invoices

   Payment history (last 10):
   - Same as invoices but shows all payment attempts

3. Success/Cancel return pages:
   /employer/billing?success=true:
   - Confetti animation (use canvas-confetti library)
   - "Payment Successful!" heading
   - "Your {plan} plan is now active. You now have {limit} job posts."
   - Button to go to employer dashboard

   /employer/billing?cancelled=true:
   - "Payment cancelled" message
   - "No charges were made"
   - Return to billing button

4. client/src/components/employer/PlanGate.jsx:
   Component that wraps premium features:
   Props: requiredPlan ('professional' | 'business'), children, fallback?
   - If user's plan meets requirement: render children
   - If not: render upgrade prompt card:
     - Lock icon
     - "This feature requires the {plan} plan"
     - "Upgrade Now" button → /employer/billing

   Usage:
   <PlanGate requiredPlan="professional">
     <AnalyticsDashboard />
   </PlanGate>

5. client/src/api/paymentApi.js:
   - getPlans() → GET /payments/plans
   - createCheckout(planKey) → POST /payments/checkout → returns { url }, redirect to url
   - getInvoices() → GET /payments/invoices
   - cancelSubscription() → POST /payments/cancel
   - getBillingPortal() → GET /payments/portal → returns { url }, redirect to url

6. client/src/hooks/useBilling.js:
   - usePlans() — React Query, cache 1 hour
   - useBilling() — current employer billing status from profile
   - useCheckout(planKey) — mutation, handles redirect
   - useInvoices() — React Query
```

---

## Key Concepts to Learn

- **Stripe redirect flow** — your backend creates checkout session → returns URL → frontend redirects; no iframe or embedded form needed
- **`canvas-confetti`** — lightweight library for celebration animations: `confetti({ particleCount: 100, spread: 70 })`
- **Plan gate pattern** — component-level feature gating is cleaner than duplicating plan checks throughout the codebase
- **Stripe billing portal** — redirect to Stripe's hosted portal for payment method changes, invoice downloads; saves building all that UI yourself

---

## Validation Checklist

- [ ] Pricing page shows all 3 plans with correct features
- [ ] Clicking upgrade → Stripe Checkout page opens
- [ ] Completing payment → confetti + plan updated in billing page
- [ ] Billing page shows correct quota usage
- [ ] `<PlanGate requiredPlan="professional">` hides analytics for free users
- [ ] Cancel subscription shows cancellation date (not immediate termination)
- [ ] Manage billing → Stripe billing portal opens

---

## Next Step
**Prompt 18 — AI Resume Parser**
