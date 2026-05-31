'use client';

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
    <section className="border-y border-neutral-900 bg-neutral-900/40 px-4 py-20">
      <div className="container mx-auto max-w-3xl space-y-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
            Support
          </h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </p>
        </div>

        {/* Accordion Component */}
        <div className="pt-4 text-left">
          <Accordion className="w-full space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-5 py-0.5"
              >
                <AccordionTrigger className="py-4 text-sm font-semibold text-white transition-colors hover:text-indigo-400 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4 text-xs leading-relaxed text-neutral-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
