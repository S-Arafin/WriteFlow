import {
  BarChart3,
  Clock,
  Cpu,
  Coins,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'AI Usage History - WriteFlow AI',
  description: 'View your AI token usage logs and prompt history.',
};

interface UsagePageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function UsagePage({ searchParams }: UsagePageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const itemsPerPage = 10;

  // 1. Fetch paginated logs and aggregate sums
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [usageLogs, totalCount, monthlyTokensAggregate, totalTokensAggregate] =
    await Promise.all([
      prisma.usageLog.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
      }),
      prisma.usageLog.count({
        where: { userId: session.user.id },
      }),
      prisma.usageLog.aggregate({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
        _sum: { tokensUsed: true },
      }),
      prisma.usageLog.aggregate({
        where: { userId: session.user.id },
        _sum: { tokensUsed: true },
      }),
    ]);

  const monthlyTokensUsed = monthlyTokensAggregate._sum.tokensUsed || 0;
  const totalTokensUsed = totalTokensAggregate._sum.tokensUsed || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const stats = [
    {
      name: 'Monthly Tokens Used',
      value: monthlyTokensUsed.toLocaleString(),
      description: 'Used since beginning of current month',
      icon: Coins,
    },
    {
      name: 'Lifetime Tokens Used',
      value: totalTokensUsed.toLocaleString(),
      description: 'Total historical generation volume',
      icon: Cpu,
    },
    {
      name: 'Total AI Interactions',
      value: totalCount.toLocaleString(),
      description: 'Number of times agent queries completed',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
          AI Usage History
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Review your real-time agent completions, prompt snippets, and token balances.
        </p>
      </div>

      {/* Aggregate Bento Cards */}
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

      {/* Usage Logs Bento list table */}
      {usageLogs.length === 0 ? (
        <div className="space-y-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white/50 dark:bg-neutral-900/10 py-16 text-center backdrop-blur-sm shadow-sm">
          <div className="inline-flex rounded-2xl border border-neutral-200 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-900/50 p-4 text-neutral-450 dark:text-neutral-550 shadow-sm">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              No usage logs recorded
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-550 dark:text-neutral-450">
              Your AI usage logs will update in real-time as you compose drafts, rewrite content, and talk with the AI assistant.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10"
          >
            <Compass className="h-4 w-4" />
            <span>Explore AI Templates</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white/50 dark:bg-neutral-950/40 backdrop-blur-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-850/80 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50/50 dark:bg-neutral-900/20">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Agent Type</th>
                  <th className="px-6 py-4">Generative Model</th>
                  <th className="px-6 py-4">Tokens Used</th>
                  <th className="px-6 py-4">Prompt Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-850 text-sm">
                {usageLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="group transition-colors hover:bg-neutral-100/30 dark:hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          log.agentType === 'DRAFT'
                            ? 'border-indigo-150 bg-indigo-50 text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : log.agentType === 'REWRITE'
                              ? 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900/20 dark:bg-purple-950/30 dark:text-purple-400'
                              : log.agentType === 'CHAT'
                                ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/20 dark:bg-amber-950/30 dark:text-amber-400'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}
                      >
                        {log.agentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                      {log.model}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {log.tokensUsed.toLocaleString()} tokens
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-xs text-neutral-650 dark:text-neutral-400">
                      {log.promptSnippet || (
                        <span className="text-neutral-400 dark:text-neutral-650 italic">
                          No prompt details
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-6">
              <p className="text-xs text-neutral-550 dark:text-neutral-400">
                Showing Page{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-350">{page}</span> of{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-350">
                  {totalPages}
                </span>{' '}
                ({totalCount} total logs)
              </p>

              <div className="flex items-center gap-1.5">
                {page > 1 ? (
                  <Link
                    href={`/dashboard/usage?page=${page - 1}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-650 transition-colors hover:border-neutral-350 hover:text-neutral-800 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-neutral-100 bg-white/30 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-700"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>
                )}

                {page < totalPages ? (
                  <Link
                    href={`/dashboard/usage?page=${page + 1}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-650 transition-colors hover:border-neutral-350 hover:text-neutral-800 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-neutral-100 bg-white/30 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-700"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
