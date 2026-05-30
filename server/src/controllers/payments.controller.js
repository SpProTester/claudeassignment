import stripe from '../config/stripe.js';
import { EmployerProfile, BillingEvent, User } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import {
  onCheckoutCompleted,
  onInvoicePaid,
  onInvoicePaymentFailed,
  onSubscriptionDeleted,
} from './payments.internal.js';

// ---------------------------------------------------------------------------
// Plan catalogue — single source of truth shared by controller and routes
// ---------------------------------------------------------------------------
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'usd',
    interval: null,
    stripePriceId: null,
    features: [
      '5 active job postings',
      'Basic applicant tracking',
      'Company profile page',
      'Email support',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 9900,
    currency: 'usd',
    interval: 'month',
    get stripePriceId() {
      return process.env.STRIPE_PRICE_PROFESSIONAL;
    },
    features: [
      '20 active job postings',
      'Full ATS kanban board',
      'Applicant notes & ratings',
      'Job analytics dashboard',
      'Priority email support',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 29900,
    currency: 'usd',
    interval: 'month',
    get stripePriceId() {
      return process.env.STRIPE_PRICE_BUSINESS;
    },
    features: [
      'Unlimited job postings',
      'Full ATS kanban board',
      'Advanced analytics & exports',
      'Resume parsing',
      'Dedicated account manager',
      'Custom employer branding',
    ],
  },
};

// ---------------------------------------------------------------------------
// GET /api/payments/plans
// ---------------------------------------------------------------------------
export const getPlans = (_req, res) => {
  const plans = Object.values(PLANS).map(({ id, name, price, currency, interval, features }) => ({
    id,
    name,
    price,
    currency,
    interval,
    features,
  }));
  sendSuccess(res, { plans });
};

// ---------------------------------------------------------------------------
// POST /api/payments/create-checkout
// Body: { plan: 'professional' | 'business' }
// ---------------------------------------------------------------------------
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['professional', 'business'].includes(plan)) {
      return sendError(res, "Invalid plan. Use 'professional' or 'business'.", 400);
    }

    const planConfig = PLANS[plan];
    const isMock = process.env.STRIPE_MOCK === 'true';
    if (!isMock && !planConfig.stripePriceId) {
      return sendError(res, `Stripe price ID for '${plan}' is not configured.`, 500);
    }

    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Create a company profile before subscribing.', 404);

    if (
      employer.stripeSubscriptionId &&
      ['active', 'trialing'].includes(employer.subscriptionStatus)
    ) {
      return sendError(
        res,
        'You already have an active subscription. Cancel it before switching plans.',
        409
      );
    }

    // Create or reuse Stripe customer
    let customerId = employer.stripeCustomerId;
    if (!customerId) {
      const user = await User.findByPk(req.user.id, { attributes: ['email', 'fullName'] });
      const customer = await stripe.customers.create({
        email: user.email,
        name: employer.companyName,
        metadata: { employerId: employer.id, userId: req.user.id },
      });
      customerId = customer.id;
      await employer.update({ stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planConfig.stripePriceId ?? 'mock_price', quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/employer/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/employer/billing?canceled=true`,
      metadata: { employerId: employer.id, plan },
      subscription_data: { metadata: { employerId: employer.id, plan } },
    });

    sendSuccess(res, { url: session.url, sessionId: session.id }, 'Checkout session created.');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/webhook  (raw body, verified by Stripe signature)
// ---------------------------------------------------------------------------
export const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  // In mock mode there is no real signature — we still call constructEvent
  // which in the mock just does JSON.parse(body).
  if (!sig && process.env.STRIPE_MOCK !== 'true') {
    return res.status(400).send('Missing stripe-signature header.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig ?? 'mock',
      process.env.STRIPE_WEBHOOK_SECRET ?? 'mock'
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onCheckoutCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await onInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await onInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await onSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error(`[webhook] Handler error for ${event.type}:`, err);
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/payments/billing
// ---------------------------------------------------------------------------
export const getBilling = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    const planId = employer.subscriptionPlan ?? 'starter';
    const planDisplayMap = { free: 'starter', basic: 'professional', premium: 'business' };
    const displayPlan = planDisplayMap[planId] ?? planId;
    const planConfig = PLANS[displayPlan] ?? PLANS.starter;

    let cancelAtPeriodEnd = false;
    if (employer.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(employer.stripeSubscriptionId);
        cancelAtPeriodEnd = sub.cancel_at_period_end;
      } catch {
        // Stripe unreachable — serve cached data
      }
    }

    const history = await BillingEvent.findAll({
      where: { employerId: employer.id },
      order: [['createdAt', 'DESC']],
      limit: 24,
    });

    sendSuccess(res, {
      currentPlan: {
        id: displayPlan,
        name: planConfig.name,
        price: planConfig.price,
        currency: planConfig.currency,
        interval: planConfig.interval,
        features: planConfig.features,
        status: employer.subscriptionStatus ?? null,
        currentPeriodEnd: employer.subscriptionCurrentPeriodEnd ?? null,
        cancelAtPeriodEnd,
      },
      billingHistory: history,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/cancel
// ---------------------------------------------------------------------------
export const cancelSubscription = async (req, res, next) => {
  try {
    const employer = await EmployerProfile.findOne({ where: { userId: req.user.id } });
    if (!employer) return sendError(res, 'Company profile not found.', 404);

    if (!employer.stripeSubscriptionId) {
      return sendError(res, 'No active subscription found.', 400);
    }
    if (employer.subscriptionStatus === 'canceled') {
      return sendError(res, 'Subscription is already canceled.', 409);
    }

    const subscription = await stripe.subscriptions.update(employer.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    sendSuccess(
      res,
      {
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      'Subscription will be canceled at the end of the current billing period.'
    );
  } catch (err) {
    next(err);
  }
};
