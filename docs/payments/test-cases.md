# Payments — Test Cases

---

## Unit Tests

### Webhook Handler

| Test | Expected |
|------|---------|
| Valid `checkout.session.completed` | Employer plan updated to new plan |
| Duplicate event ID | Returns 200, no DB update (idempotent) |
| `customer.subscription.deleted` | Employer downgraded to free, limit = 2 |
| `invoice.payment_failed` | Billing event logged with status=failed, email queued |
| Invalid Stripe signature | Returns 400 |

---

## Integration Tests

### POST /api/payments/checkout

```javascript
it('returns checkout URL for valid plan', async () => {
  mockStripe.checkoutSessions.create.mockResolvedValue({ url: 'https://checkout.stripe.com/...' });
  const res = await employerAgent.post('/api/payments/checkout').send({ plan: 'professional' });
  expect(res.status).toBe(200);
  expect(res.body.data.checkoutUrl).toContain('checkout.stripe.com');
});

it('creates Stripe customer if first checkout', async () => {
  await res = employerAgent.post('/api/payments/checkout').send({ plan: 'professional' });
  expect(mockStripe.customers.create).toHaveBeenCalledWith({
    email: employer.email,
    name: employer.company_name,
  });
});
```

### POST /api/payments/webhook

```javascript
it('processes checkout.session.completed and updates plan', async () => {
  const event = buildStripeEvent('checkout.session.completed', {
    metadata: { employer_id: employer.id, plan: 'professional' },
    subscription: 'sub_test_123',
  });
  const sig = stripe.webhooks.generateTestHeaderString({ payload: JSON.stringify(event), secret: webhookSecret });
  
  const res = await request(app)
    .post('/api/payments/webhook')
    .set('Stripe-Signature', sig)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(event));

  expect(res.status).toBe(200);
  const profile = await EmployerProfile.findByPk(employer.id);
  expect(profile.subscription_plan).toBe('professional');
  expect(profile.job_post_limit).toBe(10);
});
```

---

## Dev Mode Test

```javascript
it('POST /api/payments/dev/upgrade upgrades plan in dev mode', async () => {
  const res = await employerAgent.post('/api/payments/dev/upgrade').send({ plan: 'business' });
  expect(res.status).toBe(200);
  const profile = await EmployerProfile.findByPk(employer.id);
  expect(profile.subscription_plan).toBe('business');
});
```
