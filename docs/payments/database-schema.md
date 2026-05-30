# Payments — Database Schema

---

## Stripe Fields in `employer_profiles`

| Column | Type | Description |
|--------|------|-------------|
| `subscription_plan` | ENUM | `free`, `professional`, `business`, `enterprise` |
| `job_post_limit` | INTEGER | Active job quota for the plan |
| `stripe_customer_id` | VARCHAR(255) | Stripe `cus_xxx` ID |
| `stripe_subscription_id` | VARCHAR(255) | Active `sub_xxx` ID |
| `subscription_status` | VARCHAR(50) | `active`, `past_due`, `cancelled` |
| `current_period_end` | TIMESTAMPTZ | Subscription renewal date |
| `cancel_at_period_end` | BOOLEAN | Pending cancellation flag |

---

## Table: `billing_events`

Audit log of all Stripe webhook events processed.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `employer_id` | UUID | FK → employer_profiles(id) |
| `stripe_event_id` | VARCHAR(255) | UNIQUE — prevents duplicate processing |
| `event_type` | VARCHAR(100) | e.g., `checkout.session.completed` |
| `plan` | VARCHAR(50) | Plan affected |
| `amount` | INTEGER | Amount in cents |
| `currency` | VARCHAR(3) | |
| `status` | VARCHAR(50) | `success`, `failed`, `ignored` |
| `raw_payload` | JSONB | Full Stripe event object |
| `created_at` | TIMESTAMPTZ | |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_billing_events_stripe_id ON billing_events(stripe_event_id);
CREATE INDEX idx_billing_events_employer_id ON billing_events(employer_id);
```

---

## Data Flow

```
Stripe → POST /webhook → billing_events (log) → employer_profiles (update plan)
```

Stripe is the source of truth for payment data. The application only stores the plan identifier and the Stripe IDs needed to create portal sessions.
