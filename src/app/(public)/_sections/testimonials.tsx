'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import React from 'react';

export function TestimonialsSection() {
  const reviews = [
    {
      name: 'Marcus Vance',
      role: 'Lead Content Architect at TechScale',
      body: 'WriteFlow AI has completely shifted our drafting operations from creative guesswork to structured, high-momentum execution. The outliners and folder tag hierarchies make team asset sync incredibly robust.',
      rating: 5,
      initials: 'MV',
    },
    {
      name: 'Sophia Martinez',
      role: 'VP of Growth at AdPulse',
      body: 'Outbound sales pitch generation and Cold hooks are incredibly conversions-optimized. The tone pipeline makes adjusting vocabulary registers seamless. The platform does not rely on motivation; it just delivers.',
      rating: 5,
      initials: 'SM',
    },
    {
      name: 'Elena Rostova',
      role: 'Senior Copywriter at FinMedia',
      body: "We replaced our disparate Markdown editor and spreadsheets with WriteFlow AI's database workspace. Role-Based permissions ensure security. Type safety is excellent and the Edge-protected dashboards compile instantly.",
      rating: 5,
      initials: 'ER',
    },
  ];

  return (
    <section className="bg-background px-4 py-20 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-500 uppercase">
            Reviews
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Endorsed By Industry Creators
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex flex-col justify-between space-y-6 rounded-xl border border-neutral-200 bg-white/70 dark:border-neutral-800/80 dark:bg-neutral-900/10 p-6 text-left shadow-sm transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              {/* Rating Stars */}
              <div className="flex space-x-1">
                {[...Array(rev.rating)].map((_, sIdx) => (
                  <Star key={sIdx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 italic">
                &quot;{rev.body}&quot;
              </p>

              {/* User Bio Block */}
              <div className="flex items-center space-x-3 border-t border-neutral-100 dark:border-neutral-900 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {rev.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {rev.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    {rev.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
