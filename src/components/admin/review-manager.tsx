'use client';

import {
  Star,
  CheckCircle,
  XCircle,
  Brain,
  Sparkles,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { approveReview, rejectReview } from '@/actions/admin';

interface Review {
  id: string;
  rating: number;
  body: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  author: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  template: {
    id: string;
    title: string;
    slug: string;
  };
}

interface ReviewManagerProps {
  initialReviews: Review[];
  templatesWithReviews: Array<{
    id: string;
    title: string;
    _count: { reviews: number };
  }>;
}

export function ReviewManager({
  initialReviews,
  templatesWithReviews,
}: ReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [summaryLoadingId, setSummaryLoadingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<{
    templateId: string;
    templateTitle: string;
    summary: string;
    sentiment: string;
  } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoadingId(id);
    const res = await approveReview(id);
    if (res.success) {
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
      );
    } else {
      alert(res.error || 'Failed to approve review.');
    }
    setLoadingId(null);
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    const res = await rejectReview(id);
    if (res.success) {
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
      );
    } else {
      alert(res.error || 'Failed to reject review.');
    }
    setLoadingId(null);
  }

  async function handleGenerateSummary(
    templateId: string,
    templateTitle: string
  ) {
    setSummaryLoadingId(templateId);
    setSummaryError(null);
    setActiveSummary(null);

    try {
      const res = await fetch(`/api/ai/summarise?templateId=${templateId}`);
      if (!res.ok) {
        throw new Error('Failed to generate summary.');
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setActiveSummary({
        templateId,
        templateTitle,
        summary: data.summary,
        sentiment: data.sentiment,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to generate review summary.';
      setSummaryError(errorMsg);
    } finally {
      setSummaryLoadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 font-sans xl:grid-cols-3">
      {/* Reviews Table/Feed - Columns 1 & 2 */}
      <div className="space-y-6 xl:col-span-2">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          User Submissions Feed ({reviews.length})
        </span>

        {reviews.length === 0 ? (
          <div className="space-y-3 rounded-3xl border border-slate-900 bg-slate-900/10 py-12 text-center backdrop-blur-sm">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">
              No user reviews have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="space-y-4 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900 text-slate-400">
                      {r.author.avatarUrl ? (
                        <Image
                          src={r.author.avatarUrl}
                          alt={r.author.name || 'User'}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {r.author.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {r.author.name || 'Anonymous User'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Reviewed template:{' '}
                        <span className="font-medium text-violet-400">
                          {r.template.title}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.body && (
                  <p className="text-slate-350 border-l border-slate-900/80 px-12 font-sans text-xs leading-relaxed">
                    &ldquo;{r.body}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-900/50 px-1 pt-4">
                  <span className="font-mono text-[10px] text-slate-500">
                    Date: {new Date(r.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-3">
                    {r.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={loadingId !== null}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-950/30 bg-red-950/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-red-400 uppercase transition-all hover:bg-red-950/30 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={loadingId !== null}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-950/30 bg-emerald-950/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase transition-all hover:bg-emerald-950/30 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                          r.status === 'APPROVED'
                            ? 'border-emerald-900/30 bg-emerald-950/30 text-emerald-400'
                            : 'border-red-900/30 bg-red-950/30 text-red-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Sentiment Summaries panel - Column 3 */}
      <div className="space-y-6">
        <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
          AI Sentiment Analyzer
        </span>

        <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 animate-pulse text-violet-400" />
            <h3 className="text-slate-350 text-xs font-bold tracking-wider uppercase">
              Summarize Templates
            </h3>
          </div>

          <p className="text-[11px] leading-normal text-slate-500">
            Generate Gemini-powered sentiment summaries and feedback bullet
            lists based on all approved template reviews.
          </p>

          <div className="space-y-2.5 pt-2">
            {templatesWithReviews.map((t) => (
              <button
                key={t.id}
                onClick={() => handleGenerateSummary(t.id, t.title)}
                disabled={summaryLoadingId !== null}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-900 bg-slate-950/40 p-3 text-left transition-all hover:border-slate-800"
              >
                <div>
                  <h4 className="line-clamp-1 text-xs font-bold text-slate-300 transition-colors group-hover:text-violet-400">
                    {t.title}
                  </h4>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-500">
                    {t._count.reviews} active reviews
                  </span>
                </div>
                <div className="shrink-0 rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-slate-400 transition-colors group-hover:text-white">
                  {summaryLoadingId === t.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Summarizer Result Popup */}
        {summaryError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{summaryError}</span>
          </div>
        )}

        {activeSummary && (
          <div className="space-y-4 rounded-3xl border border-violet-900/30 bg-violet-950/5 p-6 backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-violet-400 uppercase">
                  Sentiment Result
                </h3>
                <h4 className="mt-1 text-xs font-semibold text-slate-200">
                  {activeSummary.templateTitle}
                </h4>
              </div>
              <span
                className={`inline-flex shrink-0 rounded border px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                  activeSummary.sentiment === 'POSITIVE'
                    ? 'border-emerald-900/30 bg-emerald-950/30 text-emerald-400'
                    : activeSummary.sentiment === 'MIXED'
                      ? 'border-amber-900/30 bg-amber-950/30 text-amber-400'
                      : 'border-red-900/30 bg-red-950/30 text-red-400'
                }`}
              >
                {activeSummary.sentiment}
              </span>
            </div>

            <div className="text-slate-350 border-t border-slate-900/80 pt-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
              {activeSummary.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
