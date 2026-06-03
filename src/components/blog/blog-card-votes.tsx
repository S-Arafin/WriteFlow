'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import React, { useState } from 'react';

import { voteBlogPost } from '@/actions/blog';

interface BlogCardVotesProps {
  postId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
  session: import('next-auth').Session | null;
}

export function BlogCardVotes({
  postId,
  initialUpvotes,
  initialDownvotes,
  userVote: initialUserVote,
  session,
}: BlogCardVotesProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(
    initialUserVote
  );

  const handleVote = async (
    e: React.MouseEvent,
    type: 'UPVOTE' | 'DOWNVOTE'
  ) => {
    e.preventDefault(); // prevent navigation to blog article details page
    e.stopPropagation();

    if (!session) {
      alert('You must be signed in to vote.');
      return;
    }

    try {
      const res = await voteBlogPost(postId, type);
      if (res.success) {
        setUpvotes(res.upvotes);
        setDownvotes(res.downvotes);
        setUserVote(res.userVote as 'UPVOTE' | 'DOWNVOTE' | null);
      } else {
        alert(res.error || 'Failed to register vote.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process vote.');
    }
  };

  return (
    <div className="flex items-center gap-2.5 font-mono text-[11px]">
      <button
        type="button"
        onClick={(e) => handleVote(e, 'UPVOTE')}
        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all hover:scale-105 active:scale-95 ${
          userVote === 'UPVOTE'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'dark:text-neutral-450 border-neutral-200/60 bg-white/40 text-neutral-500 hover:text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:text-neutral-300'
        }`}
      >
        <ThumbsUp
          className={`h-3 w-3 ${userVote === 'UPVOTE' ? 'fill-emerald-500/25' : ''}`}
        />
        <span className="font-bold">{upvotes}</span>
      </button>

      <button
        type="button"
        onClick={(e) => handleVote(e, 'DOWNVOTE')}
        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all hover:scale-105 active:scale-95 ${
          userVote === 'DOWNVOTE'
            ? 'dark:text-rose-450 border-rose-500/30 bg-rose-500/10 text-rose-600'
            : 'dark:text-neutral-450 border-neutral-200/60 bg-white/40 text-neutral-500 hover:text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:text-neutral-300'
        }`}
      >
        <ThumbsDown
          className={`h-3 w-3 ${userVote === 'DOWNVOTE' ? 'fill-rose-500/25' : ''}`}
        />
        <span className="font-bold">{downvotes}</span>
      </button>
    </div>
  );
}
