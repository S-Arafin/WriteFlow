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
  gradient: string;
  borderGradient: string;
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
    gradient: 'from-slate-800/80 to-slate-900/80',
    borderGradient: 'from-slate-700 to-slate-800',
    badgeColor: 'bg-slate-700/60 text-slate-300',
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
    gradient: 'from-teal-900/50 to-slate-900/80',
    borderGradient: 'from-teal-500 to-emerald-500',
    badgeColor: 'bg-teal-500/20 text-teal-300',
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
    gradient: 'from-violet-900/50 to-slate-900/80',
    borderGradient: 'from-violet-500 to-fuchsia-500',
    badgeColor: 'bg-violet-500/20 text-violet-300',
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
    success: 'border-teal-500/40 bg-teal-950/80 text-teal-300',
    error: 'border-rose-500/40 bg-rose-950/80 text-rose-300',
    info: 'border-violet-500/40 bg-violet-950/80 text-violet-300',
  };

  const icons = { success: BadgeCheck, error: Shield, info: Star };
  const Icon = icons[type];

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-2xl backdrop-blur-xl transition-all ${styles[type]}`}
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
      className={`relative flex flex-col rounded-3xl border bg-gradient-to-b p-px transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${plan.popular ? 'shadow-lg shadow-teal-500/20' : ''}`}
      style={{
        background: plan.popular
          ? 'linear-gradient(135deg, rgba(20,184,166,0.4), rgba(16,185,129,0.2), rgba(15,23,42,0.8))'
          : plan.id === 'TEAM'
            ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(217,70,239,0.15), rgba(15,23,42,0.8))'
            : 'linear-gradient(135deg, rgba(71,85,105,0.4), rgba(30,41,59,0.8))',
      }}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-teal-500/30">
            <Star className="h-3 w-3 fill-white" />
            Most Popular
          </div>
        </div>
      )}

      <div
        className={`flex h-full flex-col rounded-[calc(1.5rem-1px)] bg-gradient-to-b p-7 ${plan.gradient}`}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${plan.badgeColor}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            {isCurrentPlan && (
              <div className="flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400">
                <Crown className="h-3 w-3" />
                Active Plan
              </div>
            )}
          </div>

          <h3 className="mb-1 text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-slate-400">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-6 flex items-end gap-1">
          <span className="text-4xl font-black tracking-tight text-white">
            {plan.price}
          </span>
          <span className="mb-1 text-sm text-slate-500">{plan.period}</span>
        </div>

        {/* Features List */}
        <ul className="mb-8 flex-1 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15">
                <Check className="h-3 w-3 text-teal-400" />
              </div>
              <span className="text-sm text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-teal-500/30 bg-teal-500/10 py-3.5 text-sm font-semibold text-teal-400">
            <BadgeCheck className="h-4 w-4" />
            Your Current Plan
          </div>
        ) : isPaidPlan ? (
          <button
            id={`upgrade-btn-${plan.id.toLowerCase()}`}
            onClick={() => onUpgrade(plan.id)}
            disabled={isLoading}
            className={`group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              plan.id === 'TEAM'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/30'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-teal-500/30'
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
    <div className="relative min-h-screen">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-teal-500/5 blur-[100px]" />
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
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-400">
          <CreditCard className="h-3.5 w-3.5" />
          Billing &amp; Plans
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
          Choose Your Writing Plan
        </h1>
        <p className="mx-auto max-w-xl text-base text-slate-400">
          Unlock the full power of AI writing. Upgrade anytime, cancel anytime.
          All plans include our core editor.
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className="mb-10 flex items-center justify-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 px-6 py-4 backdrop-blur">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-violet-500/20">
          <Crown className="h-4 w-4 text-teal-400" />
        </div>
        <span className="text-sm text-slate-400">
          You are currently on the{' '}
          <span className="font-bold text-white">{currentPlan}</span> plan
          {currentPlan === 'FREE' && ' — upgrade to unlock unlimited AI power.'}
          {currentPlan !== 'FREE' &&
            ' — thank you for supporting WriteFlow AI!'}
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
      <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-teal-500/70" />
          Secured by Stripe
        </div>
        <div className="flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-teal-500/70" />
          Cancel anytime, no hidden fees
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-teal-500/70" />
          Test mode: use card{' '}
          <span className="ml-1 font-mono font-semibold text-slate-400">
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-400" />
        </div>
      }
    >
      <BillingPageInner />
    </Suspense>
  );
}
