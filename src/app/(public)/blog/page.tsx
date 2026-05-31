import { ArrowRight, Calendar, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface BlogPost {
  slug: string;
  category: string;
  readTime: string;
  title: string;
  excerpt: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatarInitials: string;
  };
}

export default function BlogPage() {
  const posts: BlogPost[] = [
    {
      slug: 'ai-content-pipelines',
      category: 'Workspaces',
      readTime: '5 min read',
      title: 'Maximizing Output: The Science of AI Content Pipelines',
      excerpt:
        'Why single-prompt generation is obsolete. Learn how structured multi-agent workflows and sequential data validation pipelines double content output while keeping context error-free.',
      date: 'May 28, 2026',
      author: {
        name: 'Sarah Chen',
        role: 'Head of AI Research',
        avatarInitials: 'SC',
      },
    },
    {
      slug: 'role-based-content-governance',
      category: 'Governance',
      readTime: '7 min read',
      title: 'Role-Based Content Governance: The Enterprise Security Mandate',
      excerpt:
        'Enterprise safety requires absolute boundaries. A technical breakdown of how we enforce strict RBAC limits at the edge, safeguarding proprietary enterprise models and sensitive data namespaces.',
      date: 'May 24, 2026',
      author: {
        name: 'Marcus Vance',
        role: 'Principal Security Architect',
        avatarInitials: 'MV',
      },
    },
    {
      slug: 'prompt-engineering-vs-workspaces',
      category: 'Engineering',
      readTime: '6 min read',
      title:
        'Prompt Engineering vs. Systematic Workspaces: The New Writing Paradigm',
      excerpt:
        'Simple chat bubbles are a bottleneck. Discover how component-driven, state-aware visual workspaces empower copywriters to interact directly with LLM schema layers to bypass context fatigue.',
      date: 'May 19, 2026',
      author: {
        name: 'Elena Rostova',
        role: 'Lead Product Designer',
        avatarInitials: 'ER',
      },
    },
    {
      slug: 'analytics-of-authority-content-velocity',
      category: 'Analytics',
      readTime: '4 min read',
      title: 'The Analytics of Authority: Measuring Content Velocity',
      excerpt:
        'How domain authority corresponds to systematic publication cadences. Explore the standard data metrics that high-performing marketing teams monitor in the generative era.',
      date: 'May 15, 2026',
      author: {
        name: 'Jameson Kelly',
        role: 'Director of Content Strategy',
        avatarInitials: 'JK',
      },
    },
  ];

  return (
    <div className="min-h-screen space-y-16 bg-neutral-950 px-4 py-16">
      {/* Blog Hero Header */}
      <div className="container mx-auto max-w-4xl space-y-6 text-center">
        <span className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-indigo-500 uppercase">
          <BookOpen className="h-4 w-4" />
          WriteFlow Insights
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Architecting Content Leadership
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-lg">
          Deep-dives into prompt engineering workflows, enterprise data
          governance, custom LLM fine-tuning schemas, and structural copywriting
          discipline.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-left backdrop-blur transition-all duration-300 hover:border-indigo-500/50 hover:bg-neutral-900/60"
            >
              {/* Decorative radial gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 space-y-6">
                {/* Meta details */}
                <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
                    {post.category}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                </div>

                {/* Title and Excerpt */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-indigo-400 sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Author & CTA */}
              <div className="relative z-10 mt-8 flex items-center justify-between border-t border-neutral-800/80 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/20 text-xs font-bold text-indigo-400">
                    {post.author.avatarInitials}
                  </div>
                  <div>
                    <h4 className="text-xs leading-tight font-bold text-white">
                      {post.author.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500">
                      {post.author.role}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Newsletter Teaser */}
      <div className="container mx-auto max-w-4xl pt-8">
        <div className="relative space-y-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/30 p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-50" />
          <div className="relative z-10 mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Stay Configured with WriteFlow
            </h3>
            <p className="text-xs text-neutral-400">
              Receive advanced workspace patterns, prompt structure designs, and
              our product roadmap releases directly in your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/#newsletter"
                className="inline-flex cursor-pointer items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <span>Subscribe to Newsletter</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
