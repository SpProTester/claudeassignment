# Payments Module

> Stripe-powered subscription billing with plan enforcement, webhooks, and invoice management.

---

## Overview

The Payments module handles all monetization on the platform. Employers subscribe to plans that unlock higher job posting quotas, featured listings, and analytics. Billing is fully managed via Stripe.

**Scope:**
- Stripe Checkout session creation (employer upgrades plan)
- Stripe webhook processing (subscription events)
- Subscription plan enforcement (quota gating)
- Billing history / invoice list for employer
- Plan downgrade / cancellation flow
- Development mode: mock Stripe for local testing

**Plans:** `free` → `professional` → `business` → `enterprise`

---

## Key Files

| File | Responsibility |
|------|---------------|
| `server/src/config/stripe.js` | Stripe SDK initialization |
| `server/src/controllers/payments.controller.js` | Checkout, portal, billing routes |
| `server/src/controllers/payments.dev.controller.js` | Mock controller for dev mode |
| `server/src/models/BillingEvent.js` | Billing event audit log model |
| `server/src/routes/payments.routes.js` | Payment routes |
| `client/src/pages/Pricing.jsx` | Public pricing page |
| `client/src/pages/employer/BillingPage.jsx` | Employer billing management |
| `client/src/pages/employer/InvoicesPage.jsx` | Invoice history |
| `client/src/services/payments.service.js` | Axios calls for payments |
| `client/src/hooks/useBilling.js` | Billing state and actions hook |
| `client/src/components/billing/PlanGate.jsx` | Feature access gate |
| `client/src/components/billing/UpgradeModal.jsx` | Upgrade prompt modal |
| `client/src/components/billing/PricingCard.jsx` | Pricing tier card |

---

## Plan Limits

| Plan | Price/mo | Active Jobs | Featured | Analytics |
|------|---------|------------|---------|-----------|
| Free | $0 | 2 | 0 | Basic |
| Professional | $49 | 10 | 3 | Standard |
| Business | $149 | 50 | 15 | Advanced |
| Enterprise | Custom | Unlimited | Unlimited | Full |

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
