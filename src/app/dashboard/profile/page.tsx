import { FileText, BookOpen, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { ProfileForm } from '@/components/dashboard/profile-form';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'My Profile - WriteFlow AI',
  description: 'View your workspace metrics and edit your profile parameters.',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Fetch full details from database to make sure it is accurate
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      plan: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Compute aggregate statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [documentsThisMonth, wordAggregate] = await Promise.all([
    prisma.document.count({
      where: {
        authorId: user.id,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.document.aggregate({
      where: { authorId: user.id },
      _sum: { wordCount: true },
    }),
  ]);

  const totalWords = wordAggregate._sum.wordCount || 0;

  const stats = [
    {
      name: 'Documents (This Month)',
      value: documentsThisMonth.toLocaleString(),
      description: 'Drafts created since start of month',
      icon: FileText,
    },
    {
      name: 'Total Words Generated',
      value: totalWords.toLocaleString(),
      description: 'Aggregated outputs across all folders',
      icon: BookOpen,
    },
    {
      name: 'Member Since',
      value: new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      description: 'Account activation date',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Monitor your workspace metrics and modify your profile details.
        </p>
      </div>

      {/* Aggregate Stats Bento Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="space-y-4 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/30 p-6 backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  {stat.name}
                </span>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-normal text-neutral-550 dark:text-neutral-400">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Form Details Bento block */}
      <div className="rounded-[2.5rem] border border-neutral-200 dark:border-neutral-850 bg-white/75 dark:bg-neutral-900/20 p-6 sm:p-8 backdrop-blur-xl shadow-sm">
        <ProfileForm initialUser={user} />
      </div>
    </div>
  );
}
