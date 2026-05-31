import { TemplateCategory } from '@prisma/client';
import { BookOpen, Star, TrendingUp, Zap } from 'lucide-react';
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
  BLOG: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  SOCIAL: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  EMAIL: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  AD_COPY: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
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
              : 'text-muted-foreground/40 fill-none'
          )}
        />
      ))}
      <span className="text-muted-foreground ml-1 text-xs">
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
      className="bg-card border-border group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Thumbnail with aspect-ratio lock */}
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={`${title} template preview`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Gradient fallback when no thumbnail is available */
          <div className="via-background flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/20">
            <BookOpen className="size-12 text-indigo-400/50" />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Category badge */}
        <span
          className={cn(
            'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            CATEGORY_COLORS[category]
          )}
        >
          {CATEGORY_LABELS[category]}
        </span>

        {/* Title */}
        <h3 className="text-foreground line-clamp-1 leading-snug font-semibold transition-colors group-hover:text-indigo-400">
          {title}
        </h3>

        {/* Description — clamped to exactly 2 lines */}
        <p className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        {/* Footer metrics */}
        <div className="border-border flex items-center justify-between border-t pt-3">
          <StarRating rating={rating} />

          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            {estimatedWords && (
              <span className="flex items-center gap-1">
                <Zap className="size-3" />~{estimatedWords.toLocaleString()}{' '}
                words
              </span>
            )}
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              {usageCount.toLocaleString()} uses
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" />
              {_count.reviews} reviews
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
