'use client';

import { motion } from 'framer-motion';
import { BookOpen, Share2, Mail, Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function TemplatesSection() {
  const templates = [
    {
      title: 'Blog Post Outliner',
      description:
        'Map complete headings, keyword hierarchies, and structural concepts for SEO optimization.',
      category: 'Blog',
      estimatedWords: '300 - 500',
      usageCount: '12,450',
      icon: BookOpen,
    },
    {
      title: 'Social Media Hook',
      description:
        'Draft high-converting captions, threads, and short captions for Twitter, LinkedIn, and Instagram.',
      category: 'Social',
      estimatedWords: '50 - 150',
      usageCount: '8,920',
      icon: Share2,
    },
    {
      title: 'Outbound Sales Pitch',
      description:
        'Formulate cold email sequences, follow-ups, and value propositions that convert cold leads.',
      category: 'Email',
      estimatedWords: '150 - 250',
      usageCount: '6,130',
      icon: Mail,
    },
    {
      title: 'High-CTR Ad Copy',
      description:
        'Write short, engaging hooks for Facebook Ads, Google Ads, and landing page headlines.',
      category: 'Ad Copy',
      estimatedWords: '25 - 75',
      usageCount: '9,540',
      icon: Megaphone,
    },
  ];

  return (
    <section className="border-y border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/40 px-4 py-20 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Headers */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-3 text-left">
            <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-500 uppercase">
              Templates
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Pre-Seeded Content Blueprints
            </h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <span>Explore All 40+ Templates</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col space-y-4 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-950/60 p-5 text-left transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                {/* Category Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[9px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                    {tpl.category}
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                    {tpl.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {tpl.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-900 pt-3 font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                  <span>Est. Words: {tpl.estimatedWords}</span>
                  <span>Used: {tpl.usageCount}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
