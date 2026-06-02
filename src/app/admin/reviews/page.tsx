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
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Manage Reviews
        </h1>
        <p className="mt-1 text-sm text-slate-400">
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
