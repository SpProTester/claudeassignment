/**
 * Stateful in-memory Stripe mock.
 * Mimics the subset of the Stripe SDK used by payments.controller.js.
 * Only active when STRIPE_MOCK=true — never shipped to production.
 */

import { randomBytes } from 'crypto';

const id = (prefix) => `${prefix}_mock_${randomBytes(8).toString('hex')}`;

// In-memory stores (reset on server restart — fine for dev)
const customers = new Map();
const subscriptions = new Map();
const sessions = new Map();

const stripeMock = {
  customers: {
    create({ email, name, metadata = {} } = {}) {
      const customer = { id: id('cus'), email, name, metadata };
      customers.set(customer.id, customer);
      return Promise.resolve(customer);
    },
  },

  checkout: {
    sessions: {
      create({ customer, mode, line_items, success_url, cancel_url, metadata = {}, subscription_data = {} } = {}) {
        const sessionId = id('cs');
        const plan = metadata.plan ?? 'professional';
        const employerId = metadata.employerId ?? '';

        // Mock checkout URL — hits the dev complete endpoint which fires the webhook
        const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const url = `${baseUrl}/api/payments/dev/mock-checkout-complete?session_id=${sessionId}&plan=${plan}&employer_id=${employerId}&customer=${customer}`;

        const session = { id: sessionId, url, mode, customer, metadata, subscription: null };
        sessions.set(sessionId, session);
        return Promise.resolve(session);
      },
    },
  },

  subscriptions: {
    retrieve(subscriptionId) {
      const sub = subscriptions.get(subscriptionId);
      if (!sub) {
        const err = new Error(`No such subscription: '${subscriptionId}'`);
        err.type = 'StripeInvalidRequestError';
        return Promise.reject(err);
      }
      return Promise.resolve(sub);
    },

    update(subscriptionId, updates = {}) {
      const sub = subscriptions.get(subscriptionId);
      if (!sub) {
        const err = new Error(`No such subscription: '${subscriptionId}'`);
        err.type = 'StripeInvalidRequestError';
        return Promise.reject(err);
      }
      Object.assign(sub, updates);
      subscriptions.set(subscriptionId, sub);
      return Promise.resolve(sub);
    },
  },

  webhooks: {
    // In mock mode skip HMAC verification — just parse the raw body
    constructEvent(body, _sig, _secret) {
      try {
        return JSON.parse(body.toString());
      } catch {
        const err = new Error('Invalid JSON in mock webhook body');
        err.type = 'StripeSignatureVerificationError';
        throw err;
      }
    },
  },

  // Internal helpers used by the dev route
  _internal: {
    createSubscription({ customerId, plan, employerId }) {
      const sub = {
        id: id('sub'),
        status: 'active',
        cancel_at_period_end: false,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // +30 days
        metadata: { plan, employerId },
        customer: customerId,
      };
      subscriptions.set(sub.id, sub);
      return sub;
    },
    getSession: (sessionId) => sessions.get(sessionId),
    updateSession: (sessionId, updates) => {
      const s = sessions.get(sessionId);
      if (s) Object.assign(s, updates);
    },
  },
};

export default stripeMock;
