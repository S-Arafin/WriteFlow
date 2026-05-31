import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

export function PricingSection() {
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      description:
        'For individual creators starting their disciplined content journey.',
      features: [
        'Up to 5 active documents',
        '2,000 words generated / mo',
        '10+ copywriting templates',
        'Standard TCP local connections',
        'Community support access',
      ],
      isPopular: false,
      cta: 'Get Started Free',
      href: '/register',
    },
    {
      name: 'Pro Plan',
      price: '$29',
      description:
        'For active professionals and writers who require maximum generation volume.',
      features: [
        'Unlimited active documents',
        '50,000 words generated / mo',
        'Access to all 40+ templates',
        'Dedicated folder tagging organization',
        'Priority email support',
        'Google Gemini & Claude access',
      ],
      isPopular: true,
      cta: 'Start Free Trial',
      href: '/register',
    },
    {
      name: 'Team Plan',
      price: '$89',
      description:
        'For organizations scaling content production with role-based editing.',
      features: [
        'Everything in the Pro plan',
        'Up to 5 user seats included',
        'Role-Based Access Controls (RBAC)',
        'Shared folder asset structures',
        'Real-time editor sync',
        '24/7 dedicated account manager',
      ],
      isPopular: false,
      cta: 'Get Team Access',
      href: '/register',
    },
  ];

  return (
    <section className="bg-neutral-950 px-4 py-20">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
            Pricing plans
          </h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, Value-Driven Subscriptions
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 items-stretch gap-8 pt-4 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex flex-col space-y-6 rounded-2xl border bg-neutral-950/60 p-8 text-left transition-all',
                plan.isPopular
                  ? 'z-10 scale-105 border-indigo-500 bg-neutral-900/40 shadow-xl shadow-indigo-500/10 md:-translate-y-2'
                  : 'border-neutral-800/80 hover:border-neutral-700/80'
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <span className="absolute -top-3 left-[50%] -translate-x-[50%] rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                  Most Popular
                </span>
              )}

              {/* Title & Price */}
              <div className="space-y-2">
                <h3 className="text-md font-bold tracking-wider text-white uppercase">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Contact' && (
                    <span className="text-xs text-neutral-500">/ month</span>
                  )}
                </div>
                <p className="min-h-[36px] text-xs leading-relaxed text-neutral-400">
                  {plan.description}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href={plan.href}
                className={cn(
                  'flex h-11 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition-all',
                  plan.isPopular
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15 hover:bg-indigo-500'
                    : 'border border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white'
                )}
              >
                {plan.cta}
              </Link>

              {/* Features List */}
              <div className="flex-1 space-y-3.5 border-t border-neutral-900 pt-4">
                {plan.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start space-x-3 text-xs text-neutral-400"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
