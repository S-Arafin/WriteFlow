'use client';

import { motion } from 'framer-motion';
import { Sliders, Zap, CheckCircle } from 'lucide-react';
import React from 'react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Configure Goals',
      description:
        'Select from our specialized library of templates. Define word boundaries, target audiences, and tone variables inside our clean dashboard workspace.',
      icon: Sliders,
    },
    {
      step: '02',
      title: 'Execute Generation',
      description:
        "Let WriteFlow's integrated LLM pipelines draft your raw copy. We compile outlines, optimize structure, and format lists automatically in seconds.",
      icon: Zap,
    },
    {
      step: '03',
      title: 'Refine & Publish',
      description:
        'Audit the generated copy in our markdown editor. Tweak vocabulary, categorize drafts using tags, and export final copies seamlessly to your publishing channels.',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="bg-background px-4 py-20 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-500 uppercase">
            Workflow
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            How WriteFlow Fuels Momentum
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative flex flex-col items-center space-y-4 text-center group"
              >
                {/* Connecting Line (Only visible on larger screens) */}
                {idx < 2 && (
                  <div className="pointer-events-none absolute top-7 right-[-40%] left-[60%] hidden h-[1px] bg-neutral-200 dark:bg-neutral-800 md:block transition-colors duration-300" />
                )}

                {/* Step Circle */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white text-indigo-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-indigo-400 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-500/50">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                    {step.step}
                  </span>
                </div>

                <h3 className="pt-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
