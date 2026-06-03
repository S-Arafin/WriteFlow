import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { type Metadata } from 'next';

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
            <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              {post.category}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl leading-tight">
              {post.title}
            </h1>
            
            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400 font-mono">
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
          <div className="flex items-center space-x-4 border-y border-neutral-200 dark:border-neutral-800 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/10 text-sm font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {post.author.name || 'Anonymous'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {post.author.bio || (post.author.role === 'ADMIN' ? 'Administrator' : 'Author')}
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-lg font-medium leading-relaxed text-neutral-700 dark:text-neutral-300 italic border-l-4 border-indigo-500 pl-4">
            {post.excerpt}
          </p>

          {/* Main Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed text-neutral-800 dark:text-neutral-300 space-y-6 whitespace-pre-wrap pt-4">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}
