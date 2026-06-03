import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { ReviewManager } from '@/components/admin/review-manager';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Manage Reviews - WriteFlow ADMIN',
  description:
    'Manage users submissions, template ratings, and sentiment averages.',
};

export default async function ManageReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all reviews
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      template: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  // Fetch templates that have at least one review (to display in summarizer options)
  const templatesWithReviews = await prisma.template.findMany({
    where: {
      reviews: {
        some: {},
      },
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          reviews: {
            where: {
              status: 'APPROVED',
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
          Manage Reviews
        </h1>
        <p className="text-neutral-555 mt-1 text-sm font-medium dark:text-neutral-400">
          Review feedback submissions, adjust template ratings, trigger AI
          sentiment reports.
        </p>
      </div>

      <ReviewManager
        initialReviews={reviews}
        templatesWithReviews={templatesWithReviews}
      />
    </div>
  );
}
