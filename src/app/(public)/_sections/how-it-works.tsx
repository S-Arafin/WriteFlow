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
    <section className="bg-neutral-950 px-4 py-20">
      <div className="container mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
            Workflow
          </h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            How WriteFlow Fuels Momentum
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col items-center space-y-4 text-center"
              >
                {/* Connecting Line (Only visible on larger screens) */}
                {idx < 2 && (
                  <div className="pointer-events-none absolute top-7 right-[-40%] left-[60%] hidden h-[1px] bg-neutral-800 md:block" />
                )}

                {/* Step Circle */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-indigo-400">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {step.step}
                  </span>
                </div>

                <h3 className="pt-2 text-lg font-bold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
