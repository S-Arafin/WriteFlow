import Stripe from 'stripe';

const apiKey =
  process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key_for_builds';

/**
 * Singleton Stripe client instance for test-mode subscriptions.
 */
export const stripe = new Stripe(apiKey);
