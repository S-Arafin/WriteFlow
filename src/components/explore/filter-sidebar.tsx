'use client';

import { TemplateCategory } from '@prisma/client';
import { SlidersHorizontal, Star, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

// ─── Static Metadata ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  BLOG: 'Blog & Articles',
  SOCIAL: 'Social Media',
  EMAIL: 'Email Campaigns',
  AD_COPY: 'Ad Copy',
};

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'usageCount', label: 'Most Used' },
  { value: 'createdAt', label: 'Newest First' },
] as const;

const RATING_OPTIONS = [
  { value: '0', label: 'All ratings' },
  { value: '3', label: '3★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '4.5', label: '4.5★ & above' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mirror URL params into controlled local state only for the search input
  // (needed to drive the debounce). Everything else reads directly from the URL.
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const activeCategory = searchParams.get('category') ?? '';
  const activeSort = searchParams.get('sort') ?? 'rating';
  const activeRating = searchParams.get('minRating') ?? '0';

  // Push updated search params without full reload
  const pushParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 whenever a filter changes
      params.delete('page');
      router.push(`/explore?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fire URL update only when the debounced value changes
  useEffect(() => {
    pushParam('q', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const clearAll = () => {
    setSearchInput('');
    router.push('/explore', { scroll: false });
  };

  const hasActiveFilters =
    !!activeCategory || activeRating !== '0' || !!searchInput;

  return (
    <aside className="w-full space-y-6 lg:w-64 lg:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-muted-foreground size-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            Filters
          </span>
        </div>
        {hasActiveFilters && (
          <button
            id="filter-clear-all"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            <X className="size-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label
          htmlFor="explore-search"
          className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Search
        </label>
        <input
          id="explore-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="e.g. product launch email…"
          className="border-border bg-background placeholder:text-muted-foreground focus:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm transition-shadow outline-none focus:ring-2"
        />
      </div>

      {/* Category */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Category
        </p>
        <div className="space-y-1">
          <button
            id="filter-category-all"
            onClick={() => pushParam('category', '')}
            className={cn(
              'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
              !activeCategory
                ? 'bg-indigo-600 text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((cat) => (
            <button
              key={cat}
              id={`filter-category-${cat.toLowerCase()}`}
              onClick={() => pushParam('category', cat)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Minimum Rating
        </p>
        <div className="space-y-1">
          {RATING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              id={`filter-rating-${value}`}
              onClick={() => pushParam('minRating', value === '0' ? '' : value)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeRating === value || (value === '0' && !activeRating)
                  ? 'bg-indigo-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {value !== '0' && <Star className="size-3.5 fill-current" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label
          htmlFor="explore-sort"
          className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Sort By
        </label>
        <select
          id="explore-sort"
          value={activeSort}
          onChange={(e) => pushParam('sort', e.target.value)}
          className="border-border bg-background text-foreground focus:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm transition-shadow outline-none focus:ring-2"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
