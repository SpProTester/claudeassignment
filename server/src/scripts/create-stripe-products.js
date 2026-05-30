/**
 * One-time setup script: creates Stripe products and prices for Professional and Business plans.
 * Run with: node src/scripts/create-stripe-products.js
 * Copy the printed price IDs into your .env file.
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  console.log('Creating Stripe products and prices...\n');

  const professional = await stripe.products.create({
    name: 'Professional',
    description: '20 active job postings, full ATS kanban board, job analytics, priority support',
    metadata: { plan: 'professional' },
  });

  const professionalPrice = await stripe.prices.create({
    product: professional.id,
    unit_amount: 9900,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'professional' },
  });

  const business = await stripe.products.create({
    name: 'Business',
    description: 'Unlimited job postings, advanced analytics, dedicated account manager, custom branding',
    metadata: { plan: 'business' },
  });

  const businessPrice = await stripe.prices.create({
    product: business.id,
    unit_amount: 29900,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'business' },
  });

  console.log('Products and prices created successfully!\n');
  console.log('Add these price IDs to your server/.env:\n');
  console.log(`STRIPE_PRICE_PROFESSIONAL=${professionalPrice.id}`);
  console.log(`STRIPE_PRICE_BUSINESS=${businessPrice.id}`);
  console.log(`\nProduct IDs (for reference):`);
  console.log(`  Professional product: ${professional.id}`);
  console.log(`  Business product:     ${business.id}`);
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
