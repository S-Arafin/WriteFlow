import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Callback route for Stripe Checkout success.
 * Validates Stripe Checkout session or developer bypass ID,
 * updates the user's plan in Neon DB, and redirects to Dashboard Billing.
 * Extracts Next.js redirect calls from the try/catch block to prevent catching redirects as errors.
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });

  if (!token || !token.id) {
    redirect('/login');
  }

  const userId = token.id as string;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan');

  if (!sessionId || !plan || (plan !== 'PRO' && plan !== 'TEAM')) {
    redirect(
      '/dashboard/billing?checkout=error&message=Invalid_session_parameters'
    );
  }

  let redirectUrl = '';

  try {
    const isDevBypass = sessionId.startsWith('mock_dev_bypass');

    if (!isDevBypass) {
      // 1. Verify payment status with Stripe API
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        throw new Error('Payment_verification_failed');
      }
    }

    // 2. Perform safe, atomic plan update in Neon DB
    await prisma.user.update({
      where: { id: userId },
      data: { plan: plan },
    });

    console.log(
      `[Stripe Billing] Successfully updated Plan to ${plan} for User ID: ${userId}`
    );
    redirectUrl = '/dashboard/billing?checkout=success';
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(
      '[Stripe Billing] Payment callback processing failed:',
      error
    );
    const message = err.message || 'callback_internal_error';
    redirectUrl = `/dashboard/billing?checkout=error&message=${encodeURIComponent(message)}`;
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}
