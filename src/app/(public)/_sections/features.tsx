'use client';

import { motion } from 'framer-motion';
import { PenTool, Shuffle, Users } from 'lucide-react';
import React from 'react';

export function FeaturesSection() {
  const features = [
    {
      title: 'AI Drafting Engine',
      description:
        'Draft structural blog copy, marketing ads, and email campaigns in seconds. Select target word volumes and let our state-of-the-art context window optimize the scaffolding.',
      icon: PenTool,
    },
    {
      title: 'Tone & Rewriting Pipelines',
      description:
        'Instantly rewrite, expand, or condense your sentences. Standardize brand assets, swap vocabulary registers, and generate multi-sentence variations on demand.',
      icon: Shuffle,
    },
    {
      title: 'Team Collaboration Tools',
      description:
        'Organize assets dynamically using folders and tags. Standardize review cycles, lock publication access, and sync team changes securely using NextAuth permissions.',
      icon: Users,
    },
  ];

  return (
    <section className="border-y border-neutral-200 bg-neutral-50/50 px-4 py-20 transition-colors duration-300 dark:border-neutral-900 dark:bg-neutral-900/40">
      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Headers */}
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-500">
            Advanced Features
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Engineered For High-Velocity Creators
          </h2>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -4 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col space-y-4 rounded-xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg dark:border-neutral-800/80 dark:bg-neutral-950/60 dark:hover:border-indigo-500/50 dark:hover:shadow-indigo-500/5"
              >
                {/* Icon Wrapper */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
