# Prompt 16 â€” Payment & Subscriptions Backend

## Phase
Phase 7 â€” Payments

## Objective
Integrate Stripe for subscription management with checkout, webhooks, invoice generation, and plan enforcement.

---

## Prompt to Use

```
Build the Stripe subscription payment system for the Job Portal backend.

1. server/src/config/stripe.js:
   - Initialize Stripe with STRIPE_SECRET_KEY from env
   - Export stripe instance
   - Define PLANS constant:
     {
       professional: { name: 'Professional', priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID, jobLimit: 10 },
       business: { name: 'Business', priceId: process.env.STRIPE_BUSINESS_PRICE_ID, jobLimit: 50 },
       enterprise: { name: 'Enterprise', priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID, jobLimit: 999999 }
     }

2. server/src/services/paymentService.js:

   getOrCreateStripeCustomer(employerUserId):
   - Check employer_profiles.stripe_customer_id
   - If exists: return existing customer
   - If not: stripe.customers.create({ email, name: companyName })
   - Save stripe_customer_id to employer_profiles
   - Return customer

   createCheckoutSession(userId, planKey):
   - Get or create Stripe customer
   - stripe.checkout.sessions.create({
       customer: stripeCustomerId,
       payment_method_types: ['card'],
       mode: 'subscription',
       line_items: [{ price: PLANS[planKey].priceId, quantity: 1 }],
       success_url: CLIENT_URL + '/employer/billing?success=true',
       cancel_url: CLIENT_URL + '/employer/billing?cancelled=true',
       metadata: { userId, planKey }
     })
   - Return { sessionId, url }

   handleWebhook(rawBody, signature):
   - stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
   - Switch on event.type:
     
     'checkout.session.completed':
     - Extract metadata: userId, planKey
     - Update employer_profiles: subscription_plan=planKey, 
       subscription_expires_at=+30days, job_post_limit=PLANS[planKey].jobLimit
     - Create Payment record
     - Create Notification for employer
     - Send payment success email
     
     'invoice.payment_succeeded':
     - Update subscription_expires_at
     - Create Payment record (recurring)
     
     'invoice.payment_failed':
     - Create Notification (payment failed, action required)
     - Send urgent payment failed email
     
     'customer.subscription.deleted':
     - Downgrade to free plan
     - Update job_post_limit = 2
     - Send plan cancelled email

   cancelSubscription(userId):
   - Get employer's Stripe subscription ID (need to add stripe_subscription_id to employer_profiles)
   - stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
   - Update employer_profiles.subscription_cancel_at_period_end = true
   - Return { message, cancels_at }

   getInvoices(userId):
   - stripe.invoices.list({ customer: stripeCustomerId, limit: 10 })
   - Return formatted invoice list

   getBillingPortalSession(userId):
   - stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: CLIENT_URL + '/employer/billing' })
   - Return { url } (redirect to Stripe billing portal)

3. server/src/models/Payment.js:
   id, employer_id FK, stripe_payment_intent_id, stripe_subscription_id,
   plan, amount_cents, currency, status(succeeded/failed/refunded),
   invoice_url, created_at

4. server/src/routes/payments.js:
   POST /checkout         â†’ authenticateToken + authorizeRole('employer'), createCheckoutSession
   POST /webhook          â†’ express.raw({ type: 'application/json' }), handleWebhook (NO auth middleware)
   POST /cancel           â†’ authenticateToken + authorizeRole('employer'), cancelSubscription
   GET  /invoices         â†’ authenticateToken + authorizeRole('employer'), getInvoices
   GET  /portal           â†’ authenticateToken + authorizeRole('employer'), getBillingPortalSession
   GET  /plans            â†’ getAllPlans (public)

   CRITICAL: Webhook route MUST use express.raw() not express.json() â€” Stripe needs raw body for signature verification
   In app.js: app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
   ALL other routes: app.use(express.json())

5. server/.env additions:
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PROFESSIONAL_PRICE_ID=price_...
   STRIPE_BUSINESS_PRICE_ID=price_...
   STRIPE_ENTERPRISE_PRICE_ID=price_...

6. Stripe CLI for local webhook testing:
   stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## Key Concepts to Learn

- **Stripe Checkout** â€” hosted payment page by Stripe; no card data touches your server; PCI compliant by default
- **Stripe webhooks** â€” Stripe calls your server when events happen (payment succeeded, failed, subscription cancelled); you MUST handle these asynchronously
- **Webhook signature verification** â€” `stripe.webhooks.constructEvent(rawBody, sig, secret)` prevents fake webhook calls; MUST use raw body (not parsed JSON)
- **`cancel_at_period_end`** â€” subscription stays active until period ends, then cancels; better UX than immediate cancellation
- **Stripe billing portal** â€” hosted page where customers manage payment methods, view invoices, cancel; saves you building all that UI

---

## Local Testing with Stripe CLI

```bash
# Install Stripe CLI (Mac)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/payments/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

---

## Validation Checklist

- [ ] `/api/payments/plans` returns plan list without auth
- [ ] `/api/payments/checkout` redirects to Stripe Checkout page
- [ ] Complete checkout â†’ employer plan updated in DB
- [ ] Failed payment â†’ employer notified by email
- [ ] Subscription cancel â†’ scheduled to cancel at period end
- [ ] Webhook signature verification rejects tampered payloads

---

## Next Step
**Prompt 17 â€” Billing Frontend**


# Prompt 17 â€” Billing & Pricing Frontend

## Phase
Phase 7 â€” Payments

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
       âœ“ 2 active job posts
       âœ“ Basic applicant view
       âœ“ Community support
       âœ— Featured listings
       âœ— ATS features
       âœ— Analytics
     - CTA: "Get Started Free" â†’ /register?role=employer

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
   - "Manage Billing" button â†’ Stripe billing portal
   - "Cancel Plan" link with confirmation modal

   Upgrade/Change Plan section:
   - Compact 3-column plan comparison
   - Current plan highlighted with "Current Plan" badge
   - Other plans show "Upgrade" or "Downgrade" button
   - Clicking Upgrade â†’ loading state â†’ redirect to Stripe Checkout

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
     - "Upgrade Now" button â†’ /employer/billing

   Usage:
   <PlanGate requiredPlan="professional">
     <AnalyticsDashboard />
   </PlanGate>

5. client/src/api/paymentApi.js:
   - getPlans() â†’ GET /payments/plans
   - createCheckout(planKey) â†’ POST /payments/checkout â†’ returns { url }, redirect to url
   - getInvoices() â†’ GET /payments/invoices
   - cancelSubscription() â†’ POST /payments/cancel
   - getBillingPortal() â†’ GET /payments/portal â†’ returns { url }, redirect to url

6. client/src/hooks/useBilling.js:
   - usePlans() â€” React Query, cache 1 hour
   - useBilling() â€” current employer billing status from profile
   - useCheckout(planKey) â€” mutation, handles redirect
   - useInvoices() â€” React Query
```

---

## Key Concepts to Learn

- **Stripe redirect flow** â€” your backend creates checkout session â†’ returns URL â†’ frontend redirects; no iframe or embedded form needed
- **`canvas-confetti`** â€” lightweight library for celebration animations: `confetti({ particleCount: 100, spread: 70 })`
- **Plan gate pattern** â€” component-level feature gating is cleaner than duplicating plan checks throughout the codebase
- **Stripe billing portal** â€” redirect to Stripe's hosted portal for payment method changes, invoice downloads; saves building all that UI yourself

---

## Validation Checklist

- [ ] Pricing page shows all 3 plans with correct features
- [ ] Clicking upgrade â†’ Stripe Checkout page opens
- [ ] Completing payment â†’ confetti + plan updated in billing page
- [ ] Billing page shows correct quota usage
- [ ] `<PlanGate requiredPlan="professional">` hides analytics for free users
- [ ] Cancel subscription shows cancellation date (not immediate termination)
- [ ] Manage billing â†’ Stripe billing portal opens

---

## Next Step
**Prompt 18 â€” AI Resume Parser**

