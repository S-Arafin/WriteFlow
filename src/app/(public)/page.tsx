import React from 'react';

import { FAQSection } from './_sections/faq';
import { FeaturesSection } from './_sections/features';
import { HeroSection } from './_sections/hero';
import { HowItWorksSection } from './_sections/how-it-works';
import { NewsletterSection } from './_sections/newsletter';
import { PricingSection } from './_sections/pricing';
import { StatsSection } from './_sections/stats';
import { TemplatesSection } from './_sections/templates';
import { TestimonialsSection } from './_sections/testimonials';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features Grid */}
      <FeaturesSection />

      {/* 3. How It Works Workflow */}
      <HowItWorksSection />

      {/* 4. Pre-Seeded Templates Showcase */}
      <TemplatesSection />

      {/* 5. Animated Metrics Stats */}
      <StatsSection />

      {/* 6. SaaS Pricing Comparison */}
      <PricingSection />

      {/* 7. Industry Reviews Testimonials */}
      <TestimonialsSection />

      {/* 8. FAQ Accordion Grid */}
      <FAQSection />

      {/* 9. Newsletter Subscription Panel */}
      <NewsletterSection />
    </div>
  );
}
