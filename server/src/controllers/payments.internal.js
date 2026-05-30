/**
 * Shared webhook event handlers used by both the real Stripe webhook endpoint
 * and the dev mock-trigger route.  Exported so they can be tested in isolation.
 */

import stripe from '../config/stripe.js';
import { EmployerProfile, BillingEvent } from '../models/index.js';
import { createNotification } from '../services/notification.service.js';

export async function onCheckoutCompleted(session) {
  if (session.mode !== 'subscription') return;

  const { employerId, plan } = session.metadata ?? {};
  if (!employerId) {
    console.warn('[webhook] checkout.session.completed — missing employerId in metadata');
    return;
  }

  const employer = await EmployerProfile.findByPk(employerId);
  if (!employer) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await employer.update({
    subscriptionPlan: plan,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  console.log(`[webhook] Employer ${employerId} upgraded to '${plan}'.`);
}

export async function onInvoicePaid(invoice) {
  if (!invoice.subscription) return;

  const employer = await EmployerProfile.findOne({
    where: { stripeCustomerId: invoice.customer },
  });
  if (!employer) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  await employer.update({
    subscriptionStatus: 'active',
    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  await BillingEvent.findOrCreate({
    where: { stripeInvoiceId: invoice.id },
    defaults: {
      employerId: employer.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      plan: employer.subscriptionPlan,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      receiptUrl: invoice.hosted_invoice_url ?? null,
    },
  });
}

export async function onInvoicePaymentFailed(invoice) {
  const employer = await EmployerProfile.findOne({
    where: { stripeCustomerId: invoice.customer },
  });
  if (!employer) return;

  await employer.update({ subscriptionStatus: 'at_risk' });

  await BillingEvent.findOrCreate({
    where: { stripeInvoiceId: invoice.id },
    defaults: {
      employerId: employer.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      plan: employer.subscriptionPlan,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      receiptUrl: null,
    },
  });

  await createNotification(employer.userId, 'system', {
    title: 'Payment failed',
    body: `We could not charge your card for your ${employer.subscriptionPlan} subscription. Please update your payment method to avoid service interruption.`,
    metadata: {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
    },
  });

  console.log(`[webhook] Payment failed for employer ${employer.id} — marked at_risk.`);
}

export async function onSubscriptionDeleted(subscription) {
  const employer = await EmployerProfile.findOne({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!employer) return;

  await employer.update({
    subscriptionPlan: 'starter',
    stripeSubscriptionId: null,
    subscriptionStatus: 'canceled',
    subscriptionCurrentPeriodEnd: null,
  });

  await createNotification(employer.userId, 'system', {
    title: 'Subscription canceled',
    body: 'Your subscription has been canceled and your account has been downgraded to the Starter plan.',
    metadata: { canceledPlan: subscription.metadata?.plan },
  });

  console.log(
    `[webhook] Subscription ${subscription.id} deleted — employer ${employer.id} downgraded to starter.`
  );
}
