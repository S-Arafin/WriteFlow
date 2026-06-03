import { ArrowRight, Clock, BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import React from 'react';

import { BlogCardVotes } from '@/components/blog/blog-card-votes';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const revalidate = 0; // dynamic page to show new blog posts instantly

export default async function BlogPage() {
  const session = await getServerSession(authOptions);

  // 1. Fetch posts from Prisma DB
  let posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          role: true,
        },
      },
    },
  });

  // 2. Self-seeding fallback if empty
  if (posts.length === 0) {
    let systemAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!systemAdmin) {
      systemAdmin = await prisma.user.findFirst();
    }

    if (!systemAdmin) {
      systemAdmin = await prisma.user.create({
        data: {
          email: 'admin@writeflow.ai',
          name: 'System Admin',
          role: 'ADMIN',
          plan: 'TEAM',
          bio: 'Platform Core Architect',
        },
      });
    }

    // Seed the 4 initial articles
    const initialPosts = [
      {
        slug: 'ai-content-pipelines',
        category: 'Workspaces',
        readTime: '5 min read',
        title: 'Maximizing Output: The Science of AI Content Pipelines',
        excerpt:
          'Why single-prompt generation is obsolete. Learn how structured multi-agent workflows and sequential data validation pipelines double content output while keeping context error-free.',
        content: `Single-prompt generation is rapidly becoming obsolete. In enterprise copywriting workflows, relying on a single prompt to generate hundreds of paragraphs introduces compounding context errors, factual hallucination, and generic styling. 

Instead, professional writing teams deploy multi-agent content pipelines. These pipelines split the creative process into discrete, programmatic phases:
1. **Research & Structuring**: An agent analyses input files and outlines the core thematic anchors.
2. **Drafting**: A dedicated model drafts individual sections, guided by the generated outline.
3. **Verification**: A third checking agent compares the output text against database facts to catch hallucinations.
4. **Refining**: A final agent optimizes the prose for readability, tone alignment, and length.

By utilizing component-driven workspaces, copywriters can inspect and refine the output of each phase. This collaborative workflow ensures high-speed production without sacrificing technical accuracy.`,
        date: 'May 28, 2026',
        authorId: systemAdmin.id,
      },
      {
        slug: 'role-based-content-governance',
        category: 'Governance',
        readTime: '7 min read',
        title: 'Role-Based Content Governance: The Enterprise Security Mandate',
        excerpt:
          'Enterprise safety requires absolute boundaries. A technical breakdown of how we enforce strict RBAC limits at the edge, safeguarding proprietary enterprise models and sensitive data namespaces.',
        content: `As generative AI becomes deeply embedded in enterprise operations, guarding sensitive corporate intelligence is a non-negotiable security requirement. Letting writing tools access raw engineering documents or financial forecasts without access controls risks critical data leaks.

Implementing Role-Based Access Control (RBAC) at the content application layer is the standard security solution. WriteFlow solves this by isolating writing workspaces by team roles. An editor can create workspace templates, while general authors can only execute them. 

Furthermore, data namespaces are strictly bounded:
* **Session Sanitization**: Prompts are dynamically cleaned of personally identifiable information (PII) before submission to public LLM endpoints.
* **Audit Trails**: Every generation request log is archived with telemetry tags, noting the author, tokens consumed, and validation status.
* **On-Premise Relays**: Critical workloads can be routed to isolated on-premise models, bypassing external public APIs.`,
        date: 'May 24, 2026',
        authorId: systemAdmin.id,
      },
      {
        slug: 'prompt-engineering-vs-workspaces',
        category: 'Engineering',
        readTime: '6 min read',
        title:
          'Prompt Engineering vs. Systematic Workspaces: The New Writing Paradigm',
        excerpt:
          'Simple chat bubbles are a bottleneck. Discover how component-driven, state-aware visual workspaces empower copywriters to interact directly with LLM schema layers to bypass context fatigue.',
        content: `Standard chat interfaces are a bottleneck for production-grade writing. While typing plain-text prompts into a conversational window works for casual brainstorming, it fails for structured layouts like blog outlines, email newsletters, or code docs.

The future of professional AI writing lies in Systematic Workspaces. Instead of conversing with an LLM, writers interact with schema layers:
1. **Fields, not Bubbles**: Inputs are separated into specific form controls (audience, tone, keyword target, outline constraint).
2. **State Management**: Drafts can be split into chunks, letting you regenerate single sections without throwing away the rest of the text.
3. **Context Injection**: Relevant brand guidelines are fetched from a database and injected automatically behind the scenes.

This structured environment reduces context fatigue and eliminates the need for copywriters to become prompt engineers.`,
        date: 'May 19, 2026',
        authorId: systemAdmin.id,
      },
      {
        slug: 'analytics-of-authority-content-velocity',
        category: 'Analytics',
        readTime: '4 min read',
        title: 'The Analytics of Authority: Measuring Content Velocity',
        excerpt:
          'How domain authority corresponds to systematic publication cadences. Explore the standard data metrics that high-performing marketing teams monitor in the generative era.',
        content: `In the modern digital landscape, publishing speed must be balanced with content authority. Search engines increasingly utilize semantic algorithms to identify low-effort, mass-produced text.

To build organic search visibility, high-growth marketing teams track Content Velocity metrics:
* **Topic Coverage**: The percentage of related sub-topics addressed in a given content cluster.
* **Revision Cycles**: How frequently published articles are updated with fresh data points.
* **Engagement-to-Token Ratio**: A metric that calculates user dwell time relative to the word count of the generated article.

By combining high content velocity with systematic validation, brands build real authority without triggering search quality filters.`,
        date: 'May 15, 2026',
        authorId: systemAdmin.id,
      },
    ];

    await prisma.blogPost.createMany({
      data: initialPosts,
    });

    // Re-fetch
    posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            role: true,
          },
        },
      },
    });
  }

  // Fetch the votes for the current user to pass to BlogCardVotes
  const userVotesMap: Record<string, 'UPVOTE' | 'DOWNVOTE'> = {};
  if (session) {
    const votes = await prisma.blogVote.findMany({
      where: { userId: session.user.id },
      select: { blogPostId: true, type: true },
    });
    votes.forEach((v) => {
      userVotesMap[v.blogPostId] = v.type;
    });
  }

  return (
    <div className="bg-background text-foreground min-h-screen py-16 transition-colors duration-300">
      {/* Blog Hero Header */}
      <div className="container mx-auto max-w-4xl space-y-6 px-4 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-indigo-500 uppercase dark:text-indigo-400">
          <BookOpen className="h-4 w-4" />
          WriteFlow Insights
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
          Architecting Content Leadership
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
          Deep-dives into prompt engineering workflows, enterprise data
          governance, custom LLM fine-tuning schemas, and structural copywriting
          discipline.
        </p>

        {session && (
          <div className="flex justify-center pt-4">
            <Link
              href="/blog/create"
              id="create-blog-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" />
              Write New Article
            </Link>
          </div>
        )}
      </div>

      {/* Blog Cards Grid */}
      <div className="container mx-auto mt-16 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {posts.map((post) => {
            const initials = post.author.name
              ? post.author.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'WF';

            return (
              <div
                key={post.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white/50 p-8 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:bg-white hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/60 dark:hover:shadow-indigo-500/5"
              >
                {/* Decorative radial gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-indigo-400/5" />

                <div className="relative z-10 space-y-6">
                  {/* Meta details */}
                  <div className="flex items-center justify-between font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-3">
                      <BlogCardVotes
                        postId={post.id}
                        initialUpvotes={post.upvotesCount}
                        initialDownvotes={post.downvotesCount}
                        userVote={userVotesMap[post.id] || null}
                        session={session}
                      />
                      <span className="h-3 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title and Excerpt */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 transition-colors duration-200 group-hover:text-indigo-600 sm:text-2xl dark:text-white dark:group-hover:text-indigo-400">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Author & CTA */}
                <div className="relative z-10 mt-8 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800/80">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/10 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-xs leading-tight font-bold text-neutral-900 dark:text-white">
                        {post.author.name || 'Anonymous'}
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {post.author.bio ||
                          (post.author.role === 'ADMIN'
                            ? 'Administrator'
                            : 'Author')}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Newsletter Teaser */}
      <div className="container mx-auto max-w-4xl px-4 pt-16">
        <div className="relative space-y-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white/50 p-8 text-center shadow-sm backdrop-blur-md sm:p-12 dark:border-neutral-800 dark:bg-neutral-900/30">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-50 dark:from-indigo-400/5" />
          <div className="relative z-10 mx-auto max-w-md space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Stay Configured with WriteFlow
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Receive advanced workspace patterns, prompt structure designs, and
              our product roadmap releases directly in your inbox.
            </p>
            <div className="pt-2">
              <Link
                href="/#newsletter"
                className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95"
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
