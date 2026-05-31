import { Award, Compass, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function AboutPage() {
  const values = [
    {
      title: 'Systematic Discipline',
      description:
        'We do not believe in passing creative motivation. We believe in building rigorous processes and automated pipelines that deliver content momentum day in, day out.',
      icon: Award,
    },
    {
      title: 'Clarity of Action',
      description:
        'Our workspace is built to streamline copywriting tasks. From outline structures to localized folder organization, every UI element is designed to minimize friction.',
      icon: Compass,
    },
    {
      title: 'Data and Model Integrity',
      description:
        "We guarantee state-of-the-art context window accuracy and strict Role-Based Access boundaries so your team's proprietary ideas remain completely protected.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen space-y-20 bg-neutral-950 px-4 py-16">
      {/* Hero Header */}
      <div className="container mx-auto max-w-4xl space-y-6 text-center">
        <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
          Our Philosophy
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Discipline Creates Momentum
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-lg">
          WriteFlow AI was built by copy architects and full-stack systems
          engineers who grew tired of standard, motivative-heavy writing
          assistants. We design tools that prioritize consistency, performance,
          and structure.
        </p>
      </div>

      {/* Core Values Section */}
      <div className="container mx-auto max-w-5xl space-y-12">
        <h2 className="text-center text-xl font-bold tracking-tight text-white sm:text-3xl">
          Our Core Principles
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="flex flex-col space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-md font-bold tracking-tight text-white">
                  {val.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-400">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
