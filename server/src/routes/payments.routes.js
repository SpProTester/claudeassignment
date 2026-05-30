import { Router } from 'express';
import { protect, authorizeRole } from '../middleware/auth.middleware.js';
import {
  getPlans,
  createCheckoutSession,
  handleWebhook,
  getBilling,
  cancelSubscription,
} from '../controllers/payments.controller.js';
import { mockCheckoutComplete, triggerMockWebhook } from '../controllers/payments.dev.controller.js';

const router = Router();

// Public — list available plans with features and pricing
router.get('/plans', getPlans);

// Stripe webhook — raw body required (express.raw applied in app.js before express.json)
router.post('/webhook', handleWebhook);

// Dev-only mock routes — only mounted when STRIPE_MOCK=true
if (process.env.STRIPE_MOCK === 'true') {
  // Browser redirect after clicking "Pay" in mock checkout
  router.get('/dev/mock-checkout-complete', mockCheckoutComplete);
  // Manually fire any webhook event for testing
  router.post('/dev/trigger-webhook', triggerMockWebhook);
}

// Protected employer-only routes
router.use(protect, authorizeRole('employer'));

router.post('/create-checkout', createCheckoutSession);
router.get('/billing', getBilling);
router.post('/cancel', cancelSubscription);

export default router;
