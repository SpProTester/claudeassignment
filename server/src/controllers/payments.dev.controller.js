/**
 * Dev-only controllers for mock Stripe flow testing.
 * These are only mounted when STRIPE_MOCK=true — never reachable in production.
 */

import stripe from '../config/stripe.js';
import { EmployerProfile, BillingEvent } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { onCheckoutCompleted, onInvoicePaid, onInvoicePaymentFailed, onSubscriptionDeleted } from './payments.internal.js';

/**
 * GET /api/payments/dev/mock-checkout-complete
 * Simulates Stripe redirecting the user back after a successful checkout.
 * Creates a fake subscription, fires onCheckoutCompleted, then redirects to the success URL.
 */
export const mockCheckoutComplete = async (req, res, next) => {
  try {
    const { session_id, plan, employer_id, customer } = req.query;

    if (!session_id || !plan || !employer_id) {
      return res.status(400).send('Missing session_id, plan, or employer_id query params.');
    }

    const employer = await EmployerProfile.findByPk(employer_id);
    if (!employer) return res.status(404).send('Employer not found.');

    // Create a mock subscription in the in-memory store
    const subscription = stripe._internal.createSubscription({
      customerId: customer || employer.stripeCustomerId,
      plan,
      employerId: employer_id,
    });

    // Attach subscription ID to mock session
    stripe._internal.updateSession(session_id, { subscription: subscription.id });

    // Simulate the checkout.session.completed webhook event
    const fakeSession = {
      id: session_id,
      mode: 'subscription',
      customer: customer || employer.stripeCustomerId,
      subscription: subscription.id,
      metadata: { employerId: employer_id, plan },
    };
    await onCheckoutCompleted(fakeSession);

    // Also fire invoice.paid so billing history is seeded
    const fakeInvoice = {
      id: `in_mock_${Date.now()}`,
      subscription: subscription.id,
      customer: customer || employer.stripeCustomerId,
      amount_paid: plan === 'business' ? 29900 : 9900,
      amount_due: plan === 'business' ? 29900 : 9900,
      currency: 'usd',
      period_start: Math.floor(Date.now() / 1000),
      period_end: subscription.current_period_end,
      hosted_invoice_url: null,
    };
    await onInvoicePaid(fakeInvoice);

    // Redirect to the billing page success URL
    const successUrl = `${process.env.CLIENT_URL}/employer/billing?success=true&session_id=${session_id}`;
    res.redirect(successUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/dev/trigger-webhook
 * Manually fire any webhook event for integration testing.
 * Body: { type: 'invoice.payment_failed' | 'customer.subscription.deleted', employerId?, ... }
 */
export const triggerMockWebhook = async (req, res, next) => {
  try {
    const { type, employerId } = req.body;

    if (!type) return sendError(res, 'Body must include { type }.', 400);

    const employer = employerId
      ? await EmployerProfile.findByPk(employerId)
      : null;

    switch (type) {
      case 'invoice.payment_failed': {
        if (!employer) return sendError(res, 'employerId required for this event.', 400);
        const fakeInvoice = {
          id: `in_mock_fail_${Date.now()}`,
          subscription: employer.stripeSubscriptionId || `sub_mock_${Date.now()}`,
          customer: employer.stripeCustomerId || `cus_mock_${Date.now()}`,
          amount_due: employer.subscriptionPlan === 'business' ? 29900 : 9900,
          currency: 'usd',
          period_start: Math.floor(Date.now() / 1000),
          period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          hosted_invoice_url: null,
        };
        await onInvoicePaymentFailed(fakeInvoice);
        break;
      }
      case 'customer.subscription.deleted': {
        if (!employer) return sendError(res, 'employerId required for this event.', 400);
        const fakeSub = {
          id: employer.stripeSubscriptionId || `sub_mock_${Date.now()}`,
          metadata: { plan: employer.subscriptionPlan, employerId },
        };
        await onSubscriptionDeleted(fakeSub);
        break;
      }
      default:
        return sendError(res, `Unsupported mock event type: ${type}`, 400);
    }

    sendSuccess(res, null, `Mock event '${type}' processed.`);
  } catch (err) {
    next(err);
  }
};
