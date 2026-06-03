import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { BlogInteractions } from '@/components/blog/blog-interactions';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!post) {
    return {
      title: 'Post Not Found — WriteFlow AI',
    };
  }

  return {
    title: `${post.title} — WriteFlow AI`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          bio: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let userVote: 'UPVOTE' | 'DOWNVOTE' | null = null;

  if (session) {
    const vote = await prisma.blogVote.findUnique({
      where: {
        userId_blogPostId: {
          userId: session.user.id,
          blogPostId: post.id,
        },
      },
      select: { type: true },
    });
    userVote = vote?.type || null;
  }

  const initials = post.author.name
    ? post.author.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WF';

  return (
    <div className="bg-background text-foreground min-h-screen py-16 transition-colors duration-300">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back Navigation */}
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Insights
        </Link>

        {/* Article Header */}
        <article className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              {post.category}
            </span>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
              {post.title}
            </h1>

            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-6 font-mono text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Author Banner */}
          <div className="flex items-center space-x-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/10 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {post.author.name || 'Anonymous'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {post.author.bio ||
                  (post.author.role === 'ADMIN' ? 'Administrator' : 'Author')}
              </p>
            </div>
          </div>

          {/* User interactions (votes, edit/delete actions) */}
          <BlogInteractions
            postId={post.id}
            postSlug={post.slug}
            initialUpvotes={post.upvotesCount}
            initialDownvotes={post.downvotesCount}
            initialReportsCount={post.reportsCount}
            userVote={userVote}
            authorId={post.authorId}
            session={session}
          />

          {/* Excerpt */}
          <p className="mt-6 border-l-4 border-indigo-500 pl-4 text-lg leading-relaxed font-medium text-neutral-700 italic dark:text-neutral-300">
            {post.excerpt}
          </p>

          {/* Main Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 pt-4 text-base leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-300">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}
