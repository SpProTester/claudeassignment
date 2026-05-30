# Payments — Jira Notes

---

## Epic: JP-PAY — Subscription Billing & Payments

**Priority:** High | **Status:** Production (Stripe test mode)

---

## Stories

### JP-PAY-001: Pricing Page & Plan Display
**Points:** 3 | **Status:** Done

### JP-PAY-002: Stripe Checkout Integration
**Points:** 5 | **Status:** Done

### JP-PAY-003: Webhook Processing & Plan Sync
**Points:** 5 | **Status:** Done

### JP-PAY-004: Stripe Customer Portal
**Points:** 2 | **Status:** Done

### JP-PAY-005: Invoice History Page
**Points:** 3 | **Status:** Done

### JP-PAY-006: Plan Enforcement (PlanGate / UpgradeModal)
**Points:** 3 | **Status:** Done

---

## Decisions

- **Stripe Checkout (hosted)** chosen over custom payment form — reduces PCI scope to SAQ-A
- **Webhook-driven** plan updates (not polling) — reliable, handles payment failures automatically
- **BillingEvent log** provides full audit trail without depending on Stripe API for history

## Pending

- Switch Stripe from test mode to live mode before production launch
- Set up Stripe webhook endpoint in Stripe dashboard for production URL
- Add usage-based billing for featured job boosts (future)
