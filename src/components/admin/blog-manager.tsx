'use client';

import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  User,
  X,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition, useMemo } from 'react';

import { deleteBlogPost } from '@/actions/blog';

interface BlogReport {
  id: string;
  reason: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  upvotesCount: number;
  downvotesCount: number;
  reportsCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  reports: BlogReport[];
}

interface BlogManagerProps {
  initialPosts: BlogPost[];
}

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [reportedOnly, setReportedOnly] = useState(false);
  const [activeReportPost, setActiveReportPost] = useState<BlogPost | null>(
    null
  );
  const [confirmDeletePost, setConfirmDeletePost] = useState<BlogPost | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialPosts.forEach((post) => cats.add(post.category));
    return Array.from(cats);
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.category.toLowerCase().includes(search.toLowerCase()) ||
        (post.author.name &&
          post.author.name.toLowerCase().includes(search.toLowerCase())) ||
        post.author.email.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' || post.category === categoryFilter;
      const matchesReported = !reportedOnly || post.reportsCount > 0;

      return matchesSearch && matchesCategory && matchesReported;
    });
  }, [posts, search, categoryFilter, reportedOnly]);

  const handleDelete = async (postId: string) => {
    startTransition(async () => {
      const res = await deleteBlogPost(postId);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setConfirmDeletePost(null);
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete blog post.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Dashboard Panel */}
      <div className="dark:border-neutral-850 flex flex-col items-stretch justify-between gap-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center dark:bg-neutral-900/20">
        <div className="relative max-w-lg flex-1">
          <Search className="dark:text-neutral-550 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blogs by title, category, author..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pr-4 pl-10 text-sm text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setReportedOnly(!reportedOnly)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              reportedOnly
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Reported Only</span>
          </button>
        </div>
      </div>

      {/* Blogs Grid or Table list */}
      {filteredPosts.length === 0 ? (
        <div className="dark:border-neutral-850 space-y-6 rounded-[2rem] border border-neutral-200 bg-white/50 py-16 text-center shadow-sm backdrop-blur-sm dark:bg-neutral-900/10">
          <div className="dark:border-neutral-850 text-neutral-450 dark:text-neutral-550 inline-flex rounded-2xl border border-neutral-200 bg-neutral-100 p-4 shadow-sm dark:bg-neutral-900/50">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-mono text-xl font-bold text-neutral-900 uppercase dark:text-white">
              No blog posts found
            </h3>
            <p className="text-neutral-555 dark:text-neutral-450 mx-auto mt-1 max-w-sm text-sm leading-relaxed">
              No articles match your search filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="dark:border-neutral-850 overflow-hidden overflow-x-auto rounded-[2rem] border border-neutral-200 bg-white/50 shadow-sm backdrop-blur-xl dark:bg-neutral-950/40">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="dark:border-neutral-850/80 border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:bg-neutral-900/20 dark:text-neutral-400">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Metrics</th>
                <th className="px-6 py-4">Safety status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="dark:divide-neutral-850 divide-y divide-neutral-200 text-sm">
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="group transition-colors hover:bg-neutral-100/30 dark:hover:bg-neutral-900/20"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-sm space-y-1 sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="dark:text-neutral-250 inline-flex items-center gap-1.5 font-bold text-neutral-800 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span className="truncate">{post.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </div>
                      <p className="dark:text-neutral-450 line-clamp-1 text-xs text-neutral-500">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 font-mono text-[9px] text-neutral-400">
                        <span className="rounded border border-indigo-500/20 bg-indigo-500/5 px-1.5 py-0.5 font-semibold text-indigo-600 uppercase dark:text-indigo-400">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="border-neutral-250/20 rounded-full border bg-neutral-100 p-2 text-neutral-400 dark:bg-neutral-900">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="leading-tight font-bold text-neutral-800 dark:text-neutral-200">
                          {post.author.name || 'Anonymous'}
                        </p>
                        <p className="dark:text-neutral-450 font-mono text-[10px] text-neutral-500">
                          {post.author.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <div className="dark:text-emerald-450 flex items-center gap-1 text-emerald-600">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="font-bold">{post.upvotesCount}</span>
                      </div>
                      <div className="dark:text-rose-450 flex items-center gap-1 text-rose-500">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span className="font-bold">{post.downvotesCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.reportsCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveReportPost(post)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 transition-all hover:scale-105 active:scale-95 dark:text-rose-400"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{post.reportsCount} reported</span>
                      </button>
                    ) : (
                      <span className="dark:text-emerald-450 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        Safe
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setConfirmDeletePost(post)}
                      className="dark:hover:text-rose-450 text-neutral-400 transition-colors hover:text-rose-600 dark:text-neutral-600"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Details Modal */}
      {activeReportPost && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:border-neutral-850 animate-in zoom-in-95 relative w-full max-w-lg space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 dark:bg-neutral-950">
            <button
              type="button"
              onClick={() => setActiveReportPost(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="flex items-center gap-2 font-mono text-lg font-bold text-neutral-900 uppercase dark:text-white">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <span>Reports Log</span>
              </h3>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Showing reports submitted by users for:{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  &ldquo;{activeReportPost.title}&rdquo;
                </span>
              </p>
            </div>

            <div className="border-neutral-150 dark:border-neutral-850 divide-neutral-150 dark:divide-neutral-850 max-h-60 divide-y overflow-y-auto rounded-2xl border">
              {activeReportPost.reports.map((report) => (
                <div key={report.id} className="space-y-2 p-4 text-xs">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                    <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {report.user.name || 'Anonymous'} ({report.user.email})
                    </span>
                    <span className="font-mono text-[10px]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="rounded-lg border border-neutral-200/50 bg-neutral-50 p-2.5 font-sans leading-relaxed text-neutral-800 italic dark:border-neutral-800/40 dark:bg-neutral-900/50 dark:text-neutral-200">
                    &ldquo;{report.reason}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveReportPost(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Close Logs
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveReportPost(null);
                  setConfirmDeletePost(activeReportPost);
                }}
                className="dark:bg-rose-650 dark:hover:bg-rose-550 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500"
              >
                Moderation Action (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {confirmDeletePost && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="dark:border-neutral-850 animate-in zoom-in-95 w-full max-w-md space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200 dark:bg-neutral-950">
            <div className="space-y-2">
              <h3 className="font-mono text-lg font-bold text-neutral-900 uppercase dark:text-white">
                Confirm Deletion
              </h3>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                Are you absolutely sure you want to delete the blog post{' '}
                <span className="font-bold text-neutral-800 dark:text-white">
                  &ldquo;{confirmDeletePost.title}&rdquo;
                </span>
                ? This action is permanent and cannot be undone. All votes and
                reports will be deleted from the database.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeletePost(null)}
                disabled={isPending}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeletePost.id)}
                disabled={isPending}
                className="dark:bg-rose-650 dark:hover:bg-rose-550 flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500 disabled:opacity-50"
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
