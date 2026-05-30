# Payments — Backend Flow

---

## Checkout Session Creation

```
POST /api/payments/checkout { plan: 'professional' }
  │
  ├─ [authenticateToken + authorizeRole('employer')]
  │
  ├─ payments.controller.js → createCheckout(req, res, next)
  │     ├─ Load EmployerProfile by userId
  │     ├─ If no stripe_customer_id:
  │     │     stripe.customers.create({ email, name: company_name })
  │     │     → save stripe_customer_id
  │     ├─ Lookup price ID from PLAN_PRICE_MAP[plan]
  │     └─ stripe.checkout.sessions.create({
  │           customer: stripe_customer_id,
  │           mode: 'subscription',
  │           line_items: [{ price: priceId, quantity: 1 }],
  │           success_url: CLIENT_URL + '/employer/billing?success=true',
  │           cancel_url: CLIENT_URL + '/pricing',
  │           metadata: { employer_id, plan }
  │         })
  └─ Response 200: { checkoutUrl: session.url }
```

---

## Webhook Processing

```
POST /api/payments/webhook
  │
  ├─ Raw body required (express.raw middleware — NOT express.json)
  ├─ stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  │   → throws if signature invalid → 400
  │
  ├─ Idempotency check:
  │     BillingEvent.findOne({ where: { stripe_event_id: event.id } })
  │     → if exists: return 200 (already processed)
  │
  ├─ Switch on event.type:
  │
  │   case 'checkout.session.completed':
  │     session = event.data.object
  │     plan = session.metadata.plan
  │     employer_id = session.metadata.employer_id
  │     stripe_subscription_id = session.subscription
  │     → EmployerProfile.update({ subscription_plan: plan,
  │                                 job_post_limit: PLAN_LIMITS[plan],
  │                                 stripe_subscription_id })
  │
  │   case 'customer.subscription.updated':
  │     sub = event.data.object
  │     plan = getPlanFromPriceId(sub.items.data[0].price.id)
  │     → EmployerProfile.update({ subscription_plan: plan, ... })
  │
  │   case 'customer.subscription.deleted':
  │     → EmployerProfile.update({ subscription_plan: 'free',
  │                                 job_post_limit: 2,
  │                                 stripe_subscription_id: null })
  │
  │   case 'invoice.payment_failed':
  │     → emailService.sendPaymentFailedEmail(employer.email)
  │     → BillingEvent.create({ status: 'failed', ... })
  │
  └─ BillingEvent.create({ stripe_event_id, event_type, status: 'success', raw_payload })
  └─ Response 200
```

---

## Development Mode Mock

```javascript
// payments.dev.controller.js
export async function devUpgrade(req, res) {
  const { plan } = req.body;
  const profile = await EmployerProfile.findOne({ where: { user_id: req.user.userId } });
  await profile.update({
    subscription_plan: plan,
    job_post_limit: PLAN_LIMITS[plan],
    stripe_subscription_id: `mock_sub_${Date.now()}`,
  });
  res.json({ success: true, data: { profile } });
}
```

Routes are registered only when `NODE_ENV !== 'production'`.
