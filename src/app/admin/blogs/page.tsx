import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { BlogManager } from '@/components/admin/blog-manager';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Manage Blogs - WriteFlow ADMIN',
  description:
    'Moderate blog posts, check report logs, view upvotes, downvotes, and remove content.',
};

export default async function ManageBlogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all posts with telemetry, votes, and reports details
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reports: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 font-sans transition-colors duration-300">
      <div>
        <h1 className="font-mono text-3xl font-extrabold tracking-tight text-neutral-900 uppercase dark:text-white">
          Manage Blogs
        </h1>
        <p className="text-neutral-555 mt-1 text-sm font-medium dark:text-neutral-400">
          Monitor user-published articles, analyze telemetry upvotes/downvotes,
          investigate user report logs, and delete posts if necessary.
        </p>
      </div>

      <BlogManager initialPosts={posts} />
    </div>
  );
}
