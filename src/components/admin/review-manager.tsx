'use client';

import {
  Brain,
  Star,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

interface TemplateReviewCount {
  id: string;
  title: string;
  _count: {
    reviews: number;
  };
}

interface ReviewManagerProps {
  initialReviews: Review[];
  templatesWithReviews: TemplateReviewCount[];
}

interface SummaryResult {
  templateId: string;
  templateTitle: string;
  summary: string;
  sentiment: 'POSITIVE' | 'MIXED' | 'NEGATIVE';
}

export function ReviewManager({
  initialReviews,
  templatesWithReviews,
}: ReviewManagerProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // AI Summarizer states
  const [summaryLoadingId, setSummaryLoadingId] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<SummaryResult | null>(
    null
  );

  async function handleApprove(reviewId: string) {
    setLoadingId(reviewId);
    try {
      const res = await approveReview(reviewId);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, status: 'APPROVED' } : r
          )
        );
        router.refresh();
      } else {
        alert(res.error || 'Failed to approve review.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve review.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(reviewId: string) {
    setLoadingId(reviewId);
    try {
      const res = await rejectReview(reviewId);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, status: 'REJECTED' } : r
          )
        );
        router.refresh();
      } else {
        alert(res.error || 'Failed to reject review.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject review.');
    } finally {
      setLoadingId(null);
    }
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
      const data = (await res.json()) as {
        summary?: string;
        sentiment?: 'POSITIVE' | 'MIXED' | 'NEGATIVE';
        error?: string;
      };
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.summary && data.sentiment) {
        setActiveSummary({
          templateId,
          templateTitle,
          summary: data.summary,
          sentiment: data.sentiment,
        });
      }
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
    <div className="grid grid-cols-1 items-start gap-8 font-sans transition-colors duration-300 xl:grid-cols-3">
      {/* Reviews Table/Feed - Columns 1 & 2 */}
      <div className="space-y-6 xl:col-span-2">
        <span className="dark:text-neutral-450 font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
          User Submissions Feed ({reviews.length})
        </span>

        {reviews.length === 0 ? (
          <div className="dark:border-neutral-850 space-y-6 rounded-[2rem] border border-neutral-200 bg-white/50 py-16 text-center shadow-sm backdrop-blur-sm dark:bg-neutral-900/10">
            <MessageSquare className="text-neutral-450 dark:text-neutral-550 mx-auto h-8 w-8" />
            <p className="text-neutral-550 dark:text-neutral-450 text-sm font-medium">
              No user reviews have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
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
                    <div className="text-left">
                      <p className="font-bold text-neutral-800 dark:text-neutral-200">
                        {r.author.name || 'Anonymous User'}
                      </p>
                      <p className="dark:text-neutral-450 mt-0.5 text-xs text-neutral-500">
                        Reviewed template:{' '}
                        <span className="text-indigo-650 font-semibold dark:text-indigo-400">
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
                            : 'text-neutral-200 dark:text-neutral-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.body && (
                  <p className="dark:border-neutral-850 border-l border-neutral-200 px-12 text-left font-sans text-xs leading-relaxed text-neutral-700 italic dark:text-neutral-300">
                    &ldquo;{r.body}&rdquo;
                  </p>
                )}

                <div className="dark:border-neutral-850/50 flex items-center justify-between border-t border-neutral-100 px-1 pt-4">
                  <span className="text-neutral-450 dark:text-neutral-550 font-mono text-[10px]">
                    Date: {new Date(r.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-3">
                    {r.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={loadingId !== null}
                          className="dark:text-rose-450 inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-rose-600 uppercase transition-all hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/20 dark:bg-rose-950/20"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={loadingId !== null}
                          className="border-emerald-250 inline-flex items-center gap-1 rounded-xl border bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase transition-all hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/20 dark:bg-emerald-950/20 dark:text-emerald-400"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                          r.status === 'APPROVED'
                            ? 'border-emerald-250 text-emerald-650 bg-emerald-50 dark:border-emerald-900/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'border-rose-250 text-rose-650 dark:text-rose-450 bg-rose-50 dark:border-rose-900/20 dark:bg-rose-950/30'
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
        <span className="dark:text-neutral-450 block font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
          AI Sentiment Analyzer
        </span>

        <div className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 text-left shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
          <div className="flex items-center gap-2">
            <Brain className="text-indigo-650 h-4 w-4 animate-pulse dark:text-indigo-400" />
            <h3 className="font-mono text-xs font-bold tracking-wider text-neutral-800 uppercase dark:text-neutral-200">
              Summarize Templates
            </h3>
          </div>

          <p className="text-neutral-550 dark:text-neutral-450 text-[11px] leading-normal font-medium">
            Generate Gemini-powered sentiment summaries and feedback bullet
            lists based on all approved template reviews.
          </p>

          <div className="space-y-2.5 pt-2">
            {templatesWithReviews.map((t) => (
              <button
                key={t.id}
                onClick={() => handleGenerateSummary(t.id, t.title)}
                disabled={summaryLoadingId !== null}
                className="group border-neutral-250 dark:border-neutral-850 flex w-full items-center justify-between gap-4 rounded-2xl border bg-neutral-50/50 p-3 text-left transition-all hover:border-indigo-500/50 dark:bg-neutral-950/40 dark:hover:border-indigo-500/50"
              >
                <div>
                  <h4 className="group-hover:text-indigo-650 line-clamp-1 font-mono text-xs font-bold text-neutral-800 transition-colors dark:text-neutral-300 dark:group-hover:text-indigo-400">
                    {t.title}
                  </h4>
                  <span className="text-neutral-450 dark:text-neutral-550 mt-0.5 block font-mono text-[10px]">
                    {t._count.reviews} active reviews
                  </span>
                </div>
                <div className="shrink-0 rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-500 transition-colors group-hover:text-indigo-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:group-hover:text-indigo-400">
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
          <div className="dark:text-rose-455 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:bg-rose-950/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{summaryError}</span>
          </div>
        )}

        {activeSummary && (
          <div className="dark:bg-violet-955/5 space-y-4 rounded-[2rem] border border-indigo-500/20 bg-indigo-50/30 p-6 text-left shadow-sm backdrop-blur-2xl dark:border-violet-900/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-mono text-xs font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                  Sentiment Result
                </h3>
                <h4 className="mt-1 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {activeSummary.templateTitle}
                </h4>
              </div>
              <span
                className={`inline-flex shrink-0 rounded border px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                  activeSummary.sentiment === 'POSITIVE'
                    ? 'border-emerald-250 text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/30'
                    : activeSummary.sentiment === 'MIXED'
                      ? 'border-amber-250 dark:text-amber-450 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-950/30'
                      : 'border-rose-250 text-rose-650 dark:text-rose-450 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/30'
                }`}
              >
                {activeSummary.sentiment}
              </span>
            </div>

            <div className="dark:border-neutral-850/80 border-t border-neutral-200 pt-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
              {activeSummary.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
