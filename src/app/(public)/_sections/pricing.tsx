'use client';

import { motion } from 'framer-motion';
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
    <section className="bg-background px-4 py-20 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-500 uppercase">
            Pricing plans
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Simple, Value-Driven Subscriptions
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 items-stretch gap-8 pt-4 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={cn(
                'relative flex flex-col space-y-6 rounded-2xl border p-8 text-left transition-all duration-300 backdrop-blur-md',
                plan.isPopular
                  ? 'z-10 scale-105 border-indigo-500 bg-white dark:bg-neutral-900/40 shadow-xl shadow-indigo-600/10 dark:shadow-indigo-500/5 md:-translate-y-2'
                  : 'border-neutral-200 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-950/60 hover:border-neutral-300 dark:hover:border-neutral-700/80 hover:shadow-md'
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <span className="absolute -top-3 left-[50%] -translate-x-[50%] rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
                  Most Popular
                </span>
              )}

              {/* Title & Price */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Contact' && (
                    <span className="text-xs text-neutral-500">/ month</span>
                  )}
                </div>
                <p className="min-h-[36px] text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {plan.description}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href={plan.href}
                className={cn(
                  'flex h-11 cursor-pointer items-center justify-center rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95',
                  plan.isPopular
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white'
                )}
              >
                {plan.cta}
              </Link>

              {/* Features List */}
              <div className="flex-1 space-y-3.5 border-t border-neutral-100 dark:border-neutral-900 pt-4">
                {plan.features.map((feature, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start space-x-3 text-xs text-neutral-600 dark:text-neutral-400"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
