'use client';

import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  FilePenLine,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { voteBlogPost, reportBlogPost, deleteBlogPost } from '@/actions/blog';

interface BlogInteractionsProps {
  postId: string;
  postSlug: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialReportsCount: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
  authorId: string;
  session: import('next-auth').Session | null;
}

export function BlogInteractions({
  postId,
  postSlug,
  initialUpvotes,
  initialDownvotes,
  initialReportsCount,
  userVote: initialUserVote,
  authorId,
  session,
}: BlogInteractionsProps) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(
    initialUserVote
  );
  const [reportsCount, setReportsCount] = useState(initialReportsCount);

  // Modals / Dialogs states
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Status feedback messages
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleVote = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session) {
      setStatusMessage({
        text: 'You must be logged in to vote.',
        isError: true,
      });
      return;
    }

    try {
      const res = await voteBlogPost(postId, type);
      if (res.success) {
        setUpvotes(res.upvotes);
        setDownvotes(res.downvotes);
        setUserVote(res.userVote as 'UPVOTE' | 'DOWNVOTE' | null);
        setStatusMessage(null);
      } else {
        setStatusMessage({
          text: res.error || 'Failed to register vote.',
          isError: true,
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Failed to process vote.', isError: true });
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setStatusMessage({
        text: 'You must be logged in to report.',
        isError: true,
      });
      return;
    }

    if (!reportReason || reportReason.trim().length < 5) {
      setStatusMessage({
        text: 'Please specify a reason (at least 5 characters).',
        isError: true,
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await reportBlogPost(postId, reportReason);
        if (res.success) {
          setReportsCount(res.reportsCount || reportsCount + 1);
          setShowReportModal(false);
          setReportReason('');
          setStatusMessage({
            text: 'Thank you. The report has been recorded.',
            isError: false,
          });
        } else {
          setStatusMessage({
            text: res.error || 'Failed to submit report.',
            isError: true,
          });
        }
      } catch (err) {
        console.error(err);
        setStatusMessage({
          text: 'An unexpected error occurred.',
          isError: true,
        });
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const res = await deleteBlogPost(postId);
        if (res.success) {
          router.push('/blog');
          router.refresh();
        } else {
          setStatusMessage({
            text: res.error || 'Failed to delete post.',
            isError: true,
          });
          setShowDeleteModal(false);
        }
      } catch (err) {
        console.error(err);
        setStatusMessage({
          text: 'An unexpected error occurred.',
          isError: true,
        });
        setShowDeleteModal(false);
      }
    });
  };

  const isOwner = session && session.user.id === authorId;
  const isAdmin = session && session.user.role === 'ADMIN';
  const canModify = isOwner || isAdmin;

  return (
    <div className="space-y-4 border-y border-neutral-200 py-6 dark:border-neutral-800">
      {/* Toast Feedback */}
      {statusMessage && (
        <div
          className={`animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium duration-250 ${
            statusMessage.isError
              ? 'border-rose-500/25 bg-rose-500/5 text-rose-600 dark:text-rose-400'
              : 'dark:text-emerald-450 border-emerald-500/25 bg-emerald-500/5 text-emerald-600'
          }`}
        >
          {statusMessage.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="dark:text-neutral-550 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Voting & Report triggers */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleVote('UPVOTE')}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
              userVote === 'UPVOTE'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-neutral-200 bg-white/50 text-neutral-600 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400 dark:hover:bg-neutral-900/60'
            }`}
          >
            <ThumbsUp
              className={`h-3.5 w-3.5 ${userVote === 'UPVOTE' ? 'fill-emerald-500/20' : ''}`}
            />
            <span>{upvotes}</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote('DOWNVOTE')}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
              userVote === 'DOWNVOTE'
                ? 'dark:text-rose-450 border-rose-500/30 bg-rose-500/10 text-rose-600'
                : 'border-neutral-200 bg-white/50 text-neutral-600 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400 dark:hover:bg-neutral-900/60'
            }`}
          >
            <ThumbsDown
              className={`h-3.5 w-3.5 ${userVote === 'DOWNVOTE' ? 'fill-rose-500/20' : ''}`}
            />
            <span>{downvotes}</span>
          </button>

          {session && (
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="dark:text-neutral-450 flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/50 px-4 py-2 text-xs font-bold text-neutral-500 transition-all hover:scale-105 hover:bg-white hover:text-neutral-700 active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/30 dark:hover:bg-neutral-900/60 dark:hover:text-neutral-300"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Report ({reportsCount})</span>
            </button>
          )}
        </div>

        {/* Ownership actions */}
        {canModify && (
          <div className="flex items-center gap-3">
            <Link
              href={`/blog/${postSlug}/edit`}
              className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 text-xs font-bold text-indigo-600 transition-all hover:scale-105 hover:bg-indigo-500/10 active:scale-95 dark:text-indigo-400"
            >
              <FilePenLine className="h-3.5 w-3.5" />
              <span>Edit Post</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="dark:text-rose-450 flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs font-bold text-rose-600 transition-all hover:scale-105 hover:bg-rose-500/10 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:border-neutral-850 animate-in zoom-in-95 w-full max-w-md space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 dark:bg-neutral-950">
            <div className="space-y-1">
              <h3 className="font-mono text-lg font-bold text-neutral-900 uppercase dark:text-white">
                Report Article
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Please provide a brief description explaining why this post
                violates community guidelines (spam, harassment, plagiarism,
                incorrect AI data, etc.).
              </p>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for reporting this blog post..."
                rows={4}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-200 dark:placeholder:text-neutral-500"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  disabled={isPending}
                  className="dark:border-neutral-850 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="dark:bg-rose-650 dark:hover:bg-rose-550 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500 disabled:opacity-50"
                >
                  {isPending ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:border-neutral-850 animate-in zoom-in-95 w-full max-w-sm space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 dark:bg-neutral-950">
            <div className="space-y-2">
              <h3 className="font-mono text-lg font-bold text-neutral-900 uppercase dark:text-white">
                Confirm Deletion
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                Are you absolutely sure you want to delete this article? This
                action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="dark:bg-rose-650 dark:hover:bg-rose-550 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500 disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
