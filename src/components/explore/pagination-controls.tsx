'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  total: number;
  limit: number;
  currentPage: number;
}

export function PaginationControls({
  total,
  limit,
  currentPage,
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`/explore?${params.toString()}`, { scroll: true });
    },
    [router, searchParams]
  );

  // Don't render controls when there's only one page
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Build a compact page window: always show first, last, and up to 3 around current
  const getPageWindow = (): (number | 'ellipsis')[] => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | 'ellipsis')[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] - 1 === 2) range.unshift(2);
    else if (range[0] - 1 > 1) rangeWithDots.push(1, 'ellipsis');
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (totalPages - range[range.length - 1] === 2) {
      range.push(totalPages - 1);
    } else if (totalPages - range[range.length - 1] > 1) {
      rangeWithDots.push('ellipsis');
    }

    rangeWithDots.push(totalPages);
    return rangeWithDots;
  };

  const pages = totalPages > 1 ? getPageWindow() : [1];

  return (
    <nav
      aria-label="Template pagination"
      className="mt-12 flex items-center justify-between"
    >
      {/* Results summary */}
      <p className="text-muted-foreground hidden text-sm sm:block">
        Showing{' '}
        <span className="text-foreground font-medium">
          {Math.min((currentPage - 1) * limit + 1, total)}–
          {Math.min(currentPage * limit, total)}
        </span>{' '}
        of <span className="text-foreground font-medium">{total}</span>{' '}
        templates
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          id="pagination-prev"
          onClick={() => goToPage(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
          className={cn(
            'flex size-9 items-center justify-center rounded-lg border transition-colors',
            isFirstPage
              ? 'border-border text-muted-foreground/40 cursor-not-allowed opacity-50'
              : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
          )}
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="text-muted-foreground flex size-9 items-center justify-center text-sm"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              id={`pagination-page-${p}`}
              onClick={() => goToPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                p === currentPage
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          id="pagination-next"
          onClick={() => goToPage(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
          className={cn(
            'flex size-9 items-center justify-center rounded-lg border transition-colors',
            isLastPage
              ? 'border-border text-muted-foreground/40 cursor-not-allowed opacity-50'
              : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer'
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
