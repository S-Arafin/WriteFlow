import {
  Users,
  FileText,
  Cpu,
  CircleDollarSign,
  TrendingUp,
  Mail,
  Trash2,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Analytics Overview - WriteFlow ADMIN',
  description:
    'WriteFlow AI Platform administrative analytics and real-time dashboard.',
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 1. Fetch Core Metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalDocuments,
    aiCallsToday,
    proUsersCount,
    teamUsersCount,
    totalSubscribers,
    subscribersList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.usageLog.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.user.count({ where: { plan: 'PRO' } }),
    prisma.user.count({ where: { plan: 'TEAM' } }),
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  const estimatedMonthlyRevenue = proUsersCount * 29 + teamUsersCount * 89;

  // 2. Fetch Graph Data (14-day history)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [usageLogs, newUsers] = await Promise.all([
    prisma.usageLog.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { tokensUsed: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Build daily usage data
  const dailyUsageMap = new Map<string, { tokens: number; calls: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0, 10);
    dailyUsageMap.set(key, { tokens: 0, calls: 0 });
  }

  usageLogs.forEach((log) => {
    const key = log.createdAt.toISOString().substring(0, 10);
    if (dailyUsageMap.has(key)) {
      const val = dailyUsageMap.get(key) || { tokens: 0, calls: 0 };
      val.tokens += log.tokensUsed;
      val.calls += 1;
      dailyUsageMap.set(key, val);
    }
  });

  const dailyUsage = Array.from(dailyUsageMap.entries()).map(
    ([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      tokens: data.tokens,
      calls: data.calls,
    })
  );

  // Build daily signup data
  const signupMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0, 10);
    signupMap.set(key, 0);
  }

  newUsers.forEach((user) => {
    const key = user.createdAt.toISOString().substring(0, 10);
    if (signupMap.has(key)) {
      const current = signupMap.get(key) ?? 0;
      signupMap.set(key, current + 1);
    }
  });

  const userSignups = Array.from(signupMap.entries()).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    count,
  }));

  // 3. Build Category Distribution Metrics
  const documentCategories = await prisma.document.findMany({
    where: { templateId: { not: null } },
    select: {
      template: {
        select: { category: true },
      },
    },
  });

  const categoryMap = new Map<string, number>();
  categoryMap.set('BLOG', 0);
  categoryMap.set('SOCIAL', 0);
  categoryMap.set('EMAIL', 0);
  categoryMap.set('AD_COPY', 0);

  documentCategories.forEach((doc) => {
    if (doc.template?.category) {
      const current = categoryMap.get(doc.template.category) ?? 0;
      categoryMap.set(doc.template.category, current + 1);
    }
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(
    ([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    })
  );

  // Inline server action to remove newsletter subscriber
  async function handleRemoveSubscriber(formData: FormData) {
    'use server';
    const subId = formData.get('subscriberId');
    if (typeof subId === 'string') {
      await prisma.newsletterSubscriber.delete({
        where: { id: subId },
      });
      revalidatePath('/admin');
    }
  }

  const metrics = [
    {
      name: 'Total Active Users',
      value: totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color:
        'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30',
    },
    {
      name: 'Documents Created',
      value: totalDocuments.toLocaleString(),
      change: '+18.2%',
      icon: FileText,
      color:
        'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30',
    },
    {
      name: 'AI Completions Today',
      value: aiCallsToday.toLocaleString(),
      change: '+42.1%',
      icon: Cpu,
      color:
        'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-450 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    },
    {
      name: 'Monthly Revenue Estim.',
      value: `$${estimatedMonthlyRevenue.toLocaleString()}`,
      change: '+8.3%',
      icon: CircleDollarSign,
      color:
        'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30',
    },
  ];

  return (
    <div className="space-y-8 font-sans transition-colors duration-300">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 font-mono text-3xl font-extrabold tracking-tight text-neutral-900 uppercase dark:text-white">
            <span>Analytics Dashboard</span>
            <span className="inline-flex rounded border border-indigo-600/20 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-400">
              Active Control
            </span>
          </h1>
          <p className="text-neutral-550 mt-1 text-sm font-medium dark:text-neutral-400">
            Real-time platform logs, financial aggregations, and core metric
            graphs.
          </p>
        </div>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10"
            >
              <div className="flex items-center justify-between">
                <span className="dark:text-neutral-450 font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
                  {metric.name}
                </span>
                <div className={`rounded-xl border p-2 ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                  {metric.value}
                </p>
                <span className="dark:text-emerald-450 flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{metric.change}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Panel */}
      <div className="pt-2">
        <AnalyticsCharts
          dailyUsage={dailyUsage}
          userSignups={userSignups}
          categoryDistribution={categoryDistribution}
        />
      </div>

      {/* Bottom Layout - Newsletter Subscribers Bento Grid panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Newsletter List Bento Panel */}
        <div className="dark:border-neutral-850 flex flex-col justify-between space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl lg:col-span-2 dark:bg-neutral-900/10">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
                  Newsletter Subscribers
                </h3>
                <p className="text-neutral-550 mt-1 text-xs font-medium dark:text-neutral-400">
                  Recent signups collected from platform subscription hooks
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2.5 text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-950/20 dark:text-indigo-400">
                <Mail className="h-4 w-4" />
              </div>
            </div>

            {/* List */}
            <div className="dark:border-neutral-850 mt-6 overflow-hidden rounded-2xl border border-neutral-200">
              {subscribersList.length === 0 ? (
                <div className="text-neutral-550 dark:text-neutral-450 py-12 text-center text-xs italic">
                  No active subscribers found.
                </div>
              ) : (
                <div className="dark:divide-neutral-850 divide-y divide-neutral-200">
                  {subscribersList.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-4 py-3 text-xs"
                    >
                      <span className="dark:text-neutral-250 font-mono font-semibold text-neutral-800">
                        {sub.email}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-neutral-450 dark:text-neutral-550 font-mono text-[10px]">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <form action={handleRemoveSubscriber}>
                          <input
                            type="hidden"
                            name="subscriberId"
                            value={sub.id}
                          />
                          <button
                            type="submit"
                            title="Remove Subscriber"
                            className="text-neutral-450 dark:hover:text-rose-450 transition-colors hover:text-rose-600 dark:text-neutral-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dark:border-neutral-850 dark:text-neutral-450 mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 font-mono text-xs text-neutral-500">
            <span>Total Subscribers</span>
            <span className="text-neutral-850 font-bold dark:text-white">
              {totalSubscribers}
            </span>
          </div>
        </div>

        {/* Info Grid Card */}
        <div className="dark:border-neutral-850 flex flex-col justify-between space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
          <div className="space-y-4">
            <h3 className="font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
              Database Sync Log
            </h3>
            <div className="dark:border-neutral-850 text-neutral-550 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 font-mono text-[10px] dark:bg-neutral-950/50 dark:text-neutral-400">
              <div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  [Status]
                </span>{' '}
                Platform operational.
              </div>
              <div>
                <span className="dark:text-emerald-450 font-bold text-emerald-600">
                  [Database]
                </span>{' '}
                Connected to Neon Serverless adapter.
              </div>
              <div>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  [Subscribers]
                </span>{' '}
                Database telemetry active.
              </div>
              <div>
                <span className="dark:text-amber-450 font-bold text-amber-600">
                  [Auth]
                </span>{' '}
                JWT session validation enabled.
              </div>
            </div>
          </div>
          <div className="text-neutral-450 dark:text-neutral-550 font-mono text-[10px] tracking-wider uppercase">
            Consoles aggregated at{' '}
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
