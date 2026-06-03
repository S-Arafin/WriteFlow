'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';

import { createBlogPost } from '@/actions/blog';

// Validation Schema matches the server-side validation
const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(30, 'Category cannot exceed 30 characters'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt cannot exceed 300 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters'),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export function BlogCreateForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState('1 min read');
  const [isPreview, setIsPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      category: 'Workspaces',
      excerpt: '',
      content: '',
    },
  });

  // Watch content field to calculate words & reading time dynamically
  const contentValue = watch('content');
  const titleValue = watch('title');
  const categoryValue = watch('category');
  const excerptValue = watch('excerpt');

  useEffect(() => {
    if (!contentValue) {
      setWordCount(0);
      setReadTime('1 min read');
      return;
    }
    const words = contentValue.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    const minutes = Math.max(1, Math.ceil(words / 225));
    setReadTime(`${minutes} min read`);
  }, [contentValue]);

  const onSubmit = async (data: BlogFormValues) => {
    setSubmitError(null);
    try {
      const result = await createBlogPost(data);
      if (result.success && result.slug) {
        router.push(`/blog/${result.slug}`);
        router.refresh();
      } else {
        setSubmitError(result.error ?? 'An unexpected error occurred.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to publish the post. Please check your connection.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab switchers: Edit vs Preview */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Blog
        </Link>

        <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isPreview
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            disabled={!titleValue && !contentValue}
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isPreview
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
          {submitError}
        </div>
      )}

      {!isPreview ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Title input */}
          <div className="space-y-1.5">
            <label htmlFor="blog-title" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-title"
              type="text"
              placeholder="e.g. Architecting High-Performance LLM Systems"
              {...register('title')}
              className="w-full rounded-xl border border-neutral-200 bg-background px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label htmlFor="blog-category" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="blog-category"
                {...register('category')}
                className="w-full rounded-xl border border-neutral-200 bg-background px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors"
              >
                <option value="Workspaces">Workspaces</option>
                <option value="Governance">Governance</option>
                <option value="Engineering">Engineering</option>
                <option value="Analytics">Analytics</option>
                <option value="Productivity">Productivity</option>
              </select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Read Time Info */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Estimated Reading Speed
              </label>
              <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 flex justify-between items-center select-none font-mono">
                <span>{wordCount} words</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{readTime}</span>
              </div>
            </div>
          </div>

          {/* Excerpt Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="blog-excerpt" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Short Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="blog-excerpt"
              rows={3}
              placeholder="Provide a concise meta description or executive summary of your article..."
              {...register('excerpt')}
              className="w-full rounded-xl border border-neutral-200 bg-background px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors resize-none"
            />
            {errors.excerpt && (
              <p className="text-xs text-red-500">{errors.excerpt.message}</p>
            )}
          </div>

          {/* Content Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="blog-content" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Content Markdown <span className="text-red-500">*</span>
            </label>
            <textarea
              id="blog-content"
              rows={12}
              placeholder="Write your article body here. Markdown spacing and standard linebreaks are fully preserved..."
              {...register('content')}
              className="w-full rounded-xl border border-neutral-200 bg-background px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 transition-colors resize-y font-sans leading-relaxed"
            />
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              id="submit-blog-post"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Publishing…' : 'Publish Article'}
            </button>
          </div>
        </form>
      ) : (
        /* Preview UI */
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              {categoryValue}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl leading-tight">
              {titleValue || 'Untitled Post'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              <div>Draft Mode</div>
              <div className="flex items-center space-x-1">
                <span>{readTime}</span>
              </div>
            </div>
          </div>

          {excerptValue && (
            <p className="text-base font-medium leading-relaxed text-neutral-700 dark:text-neutral-300 italic border-l-4 border-indigo-500 pl-4 bg-neutral-50 dark:bg-neutral-900/10 py-2 pr-2 rounded-r-md">
              {excerptValue}
            </p>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed text-neutral-800 dark:text-neutral-300 space-y-6 whitespace-pre-wrap pt-4">
            {contentValue || 'No content drafted yet. Use the Edit tab to write some content.'}
          </div>
        </div>
      )}
    </div>
  );
}
