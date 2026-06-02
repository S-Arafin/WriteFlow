import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { stripe } from '@/lib/stripe';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * API Route to create a Stripe Checkout Session or emulate a developer bypass.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });

    if (!token || !token.id) {
      return new Response('Unauthorized: Session not found', { status: 401 });
    }

    const userId = token.id as string;
    const body = await req.json();
    const { plan } = body as { plan?: string };

    if (!plan || (plan !== 'PRO' && plan !== 'TEAM')) {
      return new Response('Bad Request: Invalid plan type', { status: 400 });
    }

    const isDummyKey =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY ===
        'sk_test_placeholder_for_billing_flow' ||
      process.env.STRIPE_SECRET_KEY.includes('dummy');

    // 1. Developer Test-Mode Bypass Flow (for easy local demonstrations)
    if (isDummyKey) {
      console.log(
        `[Stripe Billing] Stripe Secret Key not configured. Triggering Developer Bypass Checkout Flow for Plan: ${plan}`
      );
      const mockSuccessUrl = `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/checkout/success?session_id=mock_dev_bypass_session_${Date.now()}&plan=${plan}`;

      return NextResponse.json({ url: mockSuccessUrl });
    }

    // 2. Real Stripe Test-Mode Checkout Session Flow
    const planName =
      plan === 'TEAM' ? 'WriteFlow Team Plan' : 'WriteFlow Pro Plan';
    const planDescription =
      plan === 'TEAM'
        ? 'Unlimited drafts, priority support, and up to 5 user seats included.'
        : 'Unlimited drafts, access to all premium Google Gemini models.';
    const planPriceCents = plan === 'TEAM' ? 8900 : 2900;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: planDescription,
            },
            unit_amount: planPriceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/api/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      }/dashboard/billing?checkout=cancel`,
      metadata: {
        userId,
        plan,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Stripe Billing] Failed to create checkout session:', error);
    return new Response(
      err.message ||
        'An unexpected server error occurred during checkout initialization.',
      { status: 500 }
    );
  }
}
