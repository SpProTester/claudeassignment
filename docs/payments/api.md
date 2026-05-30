# Payments — API Reference

All endpoints require: `Authorization: Bearer <token>` + role `employer` (except webhook).

---

## POST /api/payments/checkout

Create a Stripe Checkout session for plan upgrade.

**Auth:** Bearer (employer)

**Request Body:**
```json
{
  "plan": "professional"
}
```

**Response 200:**
```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/..."
  }
}
```

**Flow:** Frontend redirects user to `checkoutUrl`. On success, Stripe calls the webhook.

---

## POST /api/payments/portal

Create a Stripe Customer Portal session for self-service billing management.

**Auth:** Bearer (employer)

**Response 200:**
```json
{
  "data": {
    "portalUrl": "https://billing.stripe.com/p/session/..."
  }
}
```

---

## GET /api/payments/subscription

Get current subscription status.

**Auth:** Bearer (employer)

**Response 200:**
```json
{
  "data": {
    "plan": "professional",
    "status": "active",
    "currentPeriodEnd": "2026-06-30T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "jobPostLimit": 10
  }
}
```

---

## GET /api/payments/invoices

List all invoices for the employer.

**Auth:** Bearer (employer)

**Response 200:**
```json
{
  "data": {
    "invoices": [
      {
        "id": "in_xxx",
        "date": "2026-05-01T00:00:00.000Z",
        "amount": 4900,
        "currency": "usd",
        "status": "paid",
        "plan": "professional",
        "invoicePdfUrl": "https://..."
      }
    ]
  }
}
```

---

## POST /api/payments/webhook

Stripe webhook endpoint. Processes subscription lifecycle events.

**Auth:** Stripe signature header (`Stripe-Signature`)

**Handled Events:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update plan, store stripe_customer_id |
| `customer.subscription.updated` | Sync plan and limits |
| `customer.subscription.deleted` | Downgrade to free |
| `invoice.payment_failed` | Log event, send warning email |

**Response:** Always `200 OK` (Stripe retries if non-200 received).

---

## POST /api/payments/dev/upgrade (Development Only)

Manually upgrade plan without real payment (dev/test mode only).

**Auth:** Bearer (employer)

**Request Body:** `{ "plan": "business" }`

**Response 200:** Updated employer profile with new plan.
