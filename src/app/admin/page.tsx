import {
  Users,
  FileText,
  Cpu,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
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
  ] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.usageLog.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.user.count({ where: { plan: 'PRO' } }),
    prisma.user.count({ where: { plan: 'TEAM' } }),
  ]);

  const estimatedMonthlyRevenue = proUsersCount * 15 + teamUsersCount * 49;

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
    const key = d.toISOString().split('T')[0];
    dailyUsageMap.set(key, { tokens: 0, calls: 0 });
  }

  usageLogs.forEach((log) => {
    const key = log.createdAt.toISOString().split('T')[0];
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
    const key = d.toISOString().split('T')[0];
    signupMap.set(key, 0);
  }

  newUsers.forEach((user) => {
    const key = user.createdAt.toISOString().split('T')[0];
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

  const metrics = [
    {
      name: 'Total Active Users',
      value: totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      name: 'Documents Created',
      value: totalDocuments.toLocaleString(),
      change: '+18.2%',
      icon: FileText,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      name: 'AI Completions Today',
      value: aiCallsToday.toLocaleString(),
      change: '+42.1%',
      icon: Cpu,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Monthly Revenue Estim.',
      value: `$${estimatedMonthlyRevenue.toLocaleString()}`,
      change: '+8.3%',
      icon: CircleDollarSign,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-white">
            <span>Analytics Dashboard</span>
            <span className="inline-flex rounded border border-violet-900 bg-violet-950 px-2 py-0.5 text-[10px] font-bold tracking-wider text-violet-400 uppercase">
              Active Control
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
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
              className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  {metric.name}
                </span>
                <div className={`rounded-xl border p-2 ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-extrabold text-white">
                  {metric.value}
                </p>
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
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
    </div>
  );
}
