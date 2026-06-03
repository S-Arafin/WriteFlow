import { TemplateCategory } from '@prisma/client';
import { BookOpen, Star, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { type TemplateListItem } from '@/lib/data/templates';
import { cn } from '@/lib/utils';

// ─── Category display helpers ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  BLOG: 'Blog',
  SOCIAL: 'Social',
  EMAIL: 'Email',
  AD_COPY: 'Ad Copy',
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  BLOG: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20',
  SOCIAL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20',
  EMAIL: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  AD_COPY: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
};

// ─── Star Rating renderer ─────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3',
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-neutral-350 dark:text-neutral-700 fill-none'
          )}
        />
      ))}
      <span className="text-neutral-500 dark:text-neutral-400 ml-1.5 text-xs font-semibold">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: TemplateListItem;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const {
    slug,
    title,
    description,
    thumbnailUrl,
    category,
    rating,
    usageCount,
    estimatedWords,
    _count,
  } = template;

  return (
    <Link
      href={`/templates/${slug}`}
      id={`template-card-${slug}`}
      className="bg-white/70 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-850 group flex flex-col overflow-hidden rounded-[2rem] shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-indigo-500/50"
    >
      {/* Thumbnail with aspect-ratio lock */}
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${title} template preview`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Gradient fallback when no thumbnail is available */
          <div className="via-background flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/20">
            <BookOpen className="size-12 text-indigo-400/50" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Category badge */}
        <span
          className={cn(
            'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset',
            CATEGORY_COLORS[category]
          )}
        >
          {CATEGORY_LABELS[category]}
        </span>

        {/* Title */}
        <h3 className="text-neutral-900 dark:text-white line-clamp-1 leading-snug font-bold text-base transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {title}
        </h3>

        {/* Description — clamped to exactly 2 lines */}
        <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        {/* Footer metrics */}
        <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <StarRating rating={rating} />

          <div className="text-neutral-500 dark:text-neutral-450 flex items-center gap-3 text-xs font-mono">
            {estimatedWords && (
              <span className="flex items-center gap-1">
                <Zap className="size-3 text-indigo-600 dark:text-indigo-400" />~{estimatedWords.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3 text-indigo-600 dark:text-indigo-400" />
              {usageCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3 text-indigo-600 dark:text-indigo-400" />
              {_count.reviews}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
