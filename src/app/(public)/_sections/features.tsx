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
    <section className="border-y border-neutral-900 bg-neutral-900/40 px-4 py-20">
      <div className="container mx-auto max-w-5xl space-y-12">
        {/* Headers */}
        <div className="space-y-3 text-center">
          <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">
            Advanced Features
          </h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered For High-Velocity Creators
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex flex-col space-y-4 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-6 backdrop-blur transition-colors hover:border-neutral-700/80"
              >
                {/* Icon Wrapper */}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
