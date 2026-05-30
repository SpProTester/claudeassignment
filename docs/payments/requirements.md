# Payments — Requirements

---

## Functional Requirements

### FR-PAY-001: Plan Subscription
- Employer SHALL be able to view available subscription plans on the Pricing page
- Employer SHALL be able to initiate a Stripe Checkout session to upgrade their plan
- On successful payment, system SHALL update employer's `subscription_plan` and `job_post_limit`
- System SHALL send a confirmation email when a subscription activates

### FR-PAY-002: Stripe Webhook Processing
- System SHALL process Stripe events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- System SHALL log every processed event to the `billing_events` table
- System SHALL handle webhook signature verification (reject unsigned requests)

### FR-PAY-003: Billing Portal
- Employer SHALL be able to access the Stripe Customer Portal to manage payment methods, view invoices, and cancel subscription
- System SHALL redirect employer to Stripe-hosted portal via a server-generated session URL

### FR-PAY-004: Plan Enforcement
- System SHALL gate features behind plan tiers using `PlanGate` component
- System SHALL show `UpgradeModal` when employer tries to exceed plan limits
- System SHALL downgrade employer to `free` plan when subscription is cancelled or payment fails

### FR-PAY-005: Invoice History
- Employer SHALL be able to view a list of past invoices
- Invoices SHALL show: date, plan, amount, status (paid/failed), PDF download link

### FR-PAY-006: Development Mode
- In `NODE_ENV=development`, system SHALL use mock Stripe responses
- Developers SHALL be able to manually trigger plan upgrades without real payment

---

## Non-Functional Requirements

- Webhook endpoint MUST validate Stripe signature (prevent replay attacks)
- Payment data MUST NOT be stored in the application DB (Stripe is the source of truth)
- Stripe secret key MUST be loaded from environment variables, never hardcoded

---

## Acceptance Criteria

- [ ] Click "Upgrade to Professional" → redirected to Stripe Checkout
- [ ] Complete Stripe payment → plan updated within 30 seconds (via webhook)
- [ ] Cancel subscription in Stripe portal → plan downgraded to free at period end
- [ ] Invoice list shows all past charges with download links
- [ ] Webhook rejects requests with invalid signature (403)
