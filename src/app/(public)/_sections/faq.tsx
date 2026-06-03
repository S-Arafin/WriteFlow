'use client';

import { motion } from 'framer-motion';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQSection() {
  const faqs = [
    {
      question: 'How does WriteFlow AI generate content?',
      answer:
        'WriteFlow AI integrates directly with top-tier LLM API endpoints (including Claude 3.5 Sonnet and Google Gemini) via a secure Node.js connection layer. When you select a template, the workspace optimizes the context window and structural formatting parameters to produce relevant, copywriter-grade output.',
    },
    {
      question: 'Is there a monthly generation limit?',
      answer:
        'Yes, our subscriptions are value-driven based on word volumes. The Free Tier supports up to 2,000 generated words per month. The Pro Tier supports up to 50,000 words. The Team Tier includes up to 5 user seats with shared word pools.',
    },
    {
      question: 'How are my documents and data secured?',
      answer:
        "Your workspace documents are stored securely inside high-performance Neon PostgreSQL instances. All user sessions are protected at the Edge routing boundary using NextAuth's JWT session adapters. Commits and integrations are guarded by rigorous CI checks.",
    },
    {
      question: 'Can I cancel or upgrade my subscription plan?',
      answer:
        'Yes, you can upgrade, downgrade, or cancel your subscription plan at any time through the Billing portal inside your Dashboard. Our billing cycles are managed securely via Stripe.',
    },
  ];

  return (
    <section className="border-y border-neutral-200 bg-neutral-50/50 px-4 py-20 transition-colors duration-300 dark:border-neutral-900 dark:bg-neutral-900/40">
      <div className="container mx-auto max-w-3xl space-y-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-500">
            Support
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-4 text-left"
        >
          <Accordion className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border border-neutral-200 bg-white/70 px-5 py-0.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/60"
              >
                <AccordionTrigger className="py-4 text-sm font-semibold text-neutral-900 transition-colors hover:text-indigo-600 hover:no-underline dark:text-white dark:hover:text-indigo-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
