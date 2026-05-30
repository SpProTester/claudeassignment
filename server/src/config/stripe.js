/**
 * Exports a Stripe client — real SDK in production, in-memory mock in development
 * when STRIPE_MOCK=true.  Import from here everywhere instead of `new Stripe(...)`.
 */

import Stripe from 'stripe';

let stripeClient;

if (process.env.STRIPE_MOCK === 'true') {
  const { default: stripeMock } = await import('../mocks/stripe.mock.js');
  stripeClient = stripeMock;
  console.log('[stripe] Mock mode active — no real Stripe calls will be made.');
} else {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env or set STRIPE_MOCK=true for local dev.');
  }
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export default stripeClient;
