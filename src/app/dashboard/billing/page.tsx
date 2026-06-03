'use client';

import {
  Check,
  CreditCard,
  Sparkles,
  Zap,
  Users,
  Crown,
  ArrowRight,
  BadgeCheck,
  Star,
  Shield,
  Rocket,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useTransition, Suspense } from 'react';

/* ─────────────────────────────────────────────
   Plan Definitions
   ───────────────────────────────────────────── */
interface Plan {
  id: 'FREE' | 'PRO' | 'TEAM';
  name: string;
  price: string;
  period: string;
  tagline: string;
  icon: React.ElementType;
  badgeColor: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    period: '/month',
    tagline: 'Perfect to get started with AI writing.',
    icon: Zap,
    badgeColor: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    features: [
      '5 AI drafts per month',
      '3 document slots',
      'Access to standard templates',
      'Basic chat assistant',
      'Community support',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$29',
    period: '/month',
    tagline: 'Unlimited power for serious writers.',
    icon: Sparkles,
    badgeColor: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    popular: true,
    features: [
      'Unlimited AI drafts',
      'Unlimited document slots',
      'All premium templates',
      'Advanced AI rewrite & summarise',
      'Priority email support',
      'Usage analytics dashboard',
      'Custom AI model preferences',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: '$89',
    period: '/month',
    tagline: 'For collaborative writing teams at scale.',
    icon: Users,
    badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared document workspace',
      'Admin team analytics',
      'Priority on-call support',
      'SSO / custom auth (coming soon)',
      'Early feature access',
    ],
    cta: 'Upgrade to Team',
  },
];

/* ─────────────────────────────────────────────
   Toast Component
   ───────────────────────────────────────────── */
function Toast({
  type,
  message,
  onDismiss,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-450',
    error: 'border-red-500/20 bg-red-50 dark:bg-red-950/80 text-red-650 dark:text-red-400',
    info: 'border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-450',
  };

  const icons = { success: BadgeCheck, error: Shield, info: Star };
  const Icon = icons[type];

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-xl backdrop-blur-xl transition-all ${styles[type]}`}
      style={{ animation: 'slideInRight 0.35s ease-out' }}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-xs opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan Card Component
   ───────────────────────────────────────────── */
function PlanCard({
  plan,
  isCurrentPlan,
  isLoading,
  onUpgrade,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onUpgrade: (planId: string) => void;
}) {
  const Icon = plan.icon;
  const isPaidPlan = plan.id !== 'FREE';

  return (
    <div
      className={`relative flex flex-col rounded-[2.5rem] border p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        plan.popular
          ? 'z-10 border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xl shadow-indigo-600/10 dark:shadow-indigo-500/5 md:-translate-y-2'
          : 'border-neutral-200 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-950/60 hover:border-neutral-350 dark:hover:border-neutral-700/80'
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20">
            <Star className="h-3 w-3 fill-white text-white" />
            Most Popular
          </div>
        </div>
      )}

      <div className="flex h-full flex-col justify-between space-y-6">
        {/* Header */}
        <div>
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 ${plan.badgeColor}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            {isCurrentPlan && (
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Crown className="h-3 w-3" />
                Active Plan
              </div>
            )}
          </div>

          <h3 className="mb-1 text-xl font-bold text-neutral-900 dark:text-white font-mono uppercase">{plan.name}</h3>
          <p className="text-xs leading-relaxed text-neutral-550 dark:text-neutral-400">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
            {plan.price}
          </span>
          <span className="text-xs text-neutral-500">{plan.period}</span>
        </div>

        {/* Features List */}
        <ul className="space-y-3 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-3.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="h-4 w-4" />
            Your Current Plan
          </div>
        ) : isPaidPlan ? (
          <button
            id={`upgrade-btn-${plan.id.toLowerCase()}`}
            onClick={() => onUpgrade(plan.id)}
            disabled={isLoading}
            className={`group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-md ${
              plan.id === 'TEAM'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/10'
                : 'bg-lime-400 hover:bg-lime-300 dark:bg-lime-300 dark:hover:bg-lime-200 text-neutral-950 shadow-lime-400/10'
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                Processing…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Billing Page (inner — reads searchParams)
   ───────────────────────────────────────────── */
function BillingPageInner() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Derive initial toast from checkout query param on first render (avoids setState-in-effect)
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(() => {
    const status = searchParams.get('checkout');
    if (status === 'success') {
      return {
        type: 'success',
        message: '🎉 Payment successful! Your plan has been upgraded.',
      };
    }
    if (status === 'cancel') {
      return {
        type: 'info',
        message: 'Checkout was cancelled. No charges were made.',
      };
    }
    if (status === 'error') {
      const msg =
        searchParams.get('message') ?? 'An error occurred during checkout.';
      return {
        type: 'error',
        message: `Checkout failed: ${msg.replace(/_/g, ' ')}`,
      };
    }
    return null;
  });

  const currentPlan: string = session ? session.user.plan : 'FREE';

  // Refresh session when landing on success page
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      startTransition(() => {
        updateSession();
      });
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to initiate checkout.');
      }

      const data = (await res.json()) as { url: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to start checkout. Please try again.';
      setToast({ type: 'error', message });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen pb-12">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="mb-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm">
          <CreditCard className="h-3.5 w-3.5" />
          Billing &amp; Plans
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase font-mono sm:text-5xl">
          Choose Your Writing Plan
        </h1>
        <p className="mx-auto max-w-xl text-base text-neutral-500 dark:text-neutral-400">
          Unlock the full power of AI writing. Upgrade anytime, cancel anytime. All plans include our core editor.
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className="mb-10 flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/40 px-6 py-4 shadow-sm backdrop-blur">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
          <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          You are currently on the{' '}
          <span className="font-bold text-neutral-900 dark:text-white font-mono uppercase">{currentPlan}</span> plan
          {currentPlan === 'FREE' && ' — upgrade to unlock unlimited AI power.'}
          {currentPlan !== 'FREE' && ' — thank you for supporting WriteFlow AI!'}
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            isLoading={loadingPlan === plan.id || isPending}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      {/* Trust / Security Footer */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 dark:text-neutral-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-indigo-500/70" />
          Secured by Stripe
        </div>
        <div className="flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-indigo-500/70" />
          Cancel anytime, no hidden fees
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-indigo-500/70" />
          Test mode: use card{' '}
          <span className="ml-1 font-mono font-bold text-neutral-600 dark:text-neutral-450">
            4242 4242 4242 4242
          </span>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Exported Page (wrapped in Suspense for useSearchParams)
   ───────────────────────────────────────────── */
export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
        </div>
      }
    >
      <BillingPageInner />
    </Suspense>
  );
}
