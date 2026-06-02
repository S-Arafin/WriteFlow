import {
  BarChart3,
  Clock,
  Cpu,
  Coins,
  ChevronLeft,
  ChevronRight,
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
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      name: 'Lifetime Tokens Used',
      value: totalTokensUsed.toLocaleString(),
      description: 'Total historical generation volume',
      icon: Cpu,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      name: 'Total AI Interactions',
      value: totalCount.toLocaleString(),
      description: 'Number of times agent queries completed',
      icon: BarChart3,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          AI Usage History
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your real-time agent completions, prompt snippets, and token
          balances.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  {stat.name}
                </span>
                <div
                  className={`rounded-xl border p-2 ${stat.bgColor} ${stat.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-normal text-slate-400">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Logs Table */}
      {usageLogs.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 py-16 text-center backdrop-blur-sm">
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-slate-500">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">
              No usage logs recorded
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
              Your AI usage logs will update in real-time as you compose drafts,
              rewrite content, and talk with the AI assistant.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            Explore AI Templates
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-900 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Agent Type</th>
                  <th className="px-6 py-4">Generative Model</th>
                  <th className="px-6 py-4">Tokens Used</th>
                  <th className="px-6 py-4">Prompt Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {usageLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="group transition-colors hover:bg-slate-900/10"
                  >
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                          log.agentType === 'DRAFT'
                            ? 'border-teal-900/30 bg-teal-950/30 text-teal-400'
                            : log.agentType === 'REWRITE'
                              ? 'border-violet-900/30 bg-violet-950/30 text-violet-400'
                              : log.agentType === 'CHAT'
                                ? 'border-amber-900/30 bg-amber-950/30 text-amber-400'
                                : 'border-emerald-900/30 bg-emerald-950/30 text-emerald-400'
                        }`}
                      >
                        {log.agentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {log.model}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-200">
                      {log.tokensUsed.toLocaleString()} tokens
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-xs text-slate-400">
                      {log.promptSnippet || (
                        <span className="text-slate-600 italic">
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
            <div className="flex items-center justify-between border-t border-slate-900 pt-6">
              <p className="text-xs text-slate-500">
                Showing Page{' '}
                <span className="font-semibold text-slate-300">{page}</span> of{' '}
                <span className="font-semibold text-slate-300">
                  {totalPages}
                </span>{' '}
                ({totalCount} total logs)
              </p>

              <div className="flex items-center gap-1.5">
                {page > 1 ? (
                  <Link
                    href={`/dashboard/usage?page=${page - 1}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>
                )}

                {page < totalPages ? (
                  <Link
                    href={`/dashboard/usage?page=${page + 1}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
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
