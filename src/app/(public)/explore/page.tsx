import { TemplateCategory } from '@prisma/client';
import { LayoutGrid, SearchX } from 'lucide-react';
import { type Metadata } from 'next';
import { Suspense } from 'react';

import { FilterSidebar } from '@/components/explore/filter-sidebar';
import { PaginationControls } from '@/components/explore/pagination-controls';
import { TemplateCard } from '@/components/explore/template-card';
import { getTemplates, type TemplateSortKey } from '@/lib/data/templates';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Explore Templates — WriteFlow AI',
  description:
    'Browse hundreds of professionally crafted AI content templates for blog posts, social media, email campaigns, and ad copy. Filter by category, rating, and AI model.',
};

export const revalidate = 3650; // ~1-hour ISR cache

// ─── Search Params Parsing ────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set<string>(Object.values(TemplateCategory));
const VALID_SORTS = new Set<TemplateSortKey>([
  'rating',
  'usageCount',
  'createdAt',
]);
const LIMIT = 12;

interface ExplorePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─── Page (RSC) ───────────────────────────────────────────────────────────────

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  // Next.js 15 searchParams is a Promise — await it
  const params = await searchParams;

  const raw = (key: string): string => {
    const val = params[key];
    if (Array.isArray(val)) {
      return val[0] ?? '';
    }
    return val ?? '';
  };

  const q = raw('q').trim() || undefined;

  const categoryRaw = raw('category').toUpperCase();
  const category = VALID_CATEGORIES.has(categoryRaw)
    ? (categoryRaw as TemplateCategory)
    : undefined;

  const minRatingRaw = parseFloat(raw('minRating'));
  const minRating = isNaN(minRatingRaw) ? undefined : minRatingRaw;

  const sortRaw = raw('sort') as TemplateSortKey;
  const sort = VALID_SORTS.has(sortRaw) ? sortRaw : 'rating';

  const pageRaw = parseInt(raw('page'), 10);
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  // ── Data fetch ──────────────────────────────────────────────────────────────
  const { templates, total } = await getTemplates({
    q,
    category,
    minRating,
    sort,
    page,
    limit: LIMIT,
  });

  // ── Derived display state ───────────────────────────────────────────────────
  const hasActiveFilters = !!(q ?? category ?? minRating);

  return (
    <div className="container mx-auto px-4 py-12 font-sans">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-5 text-indigo-650 dark:text-indigo-400" />
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
            Explore Templates
          </h1>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm leading-relaxed font-medium">
          Discover professionally crafted AI prompts for every content format. Filter by category, sort by usage or rating, and launch your next piece in seconds.
        </p>
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* FilterSidebar */}
        <Suspense
          fallback={
            <aside className="bg-neutral-100 dark:bg-neutral-900 hidden h-96 w-64 animate-pulse rounded-[2rem] lg:block" />
          }
        >
          <FilterSidebar />
        </Suspense>

        {/* ── Results Column ──────────────────────────────────────────────── */}
        <section className="min-w-0 flex-1">
          {/* Results count */}
          <div className="text-neutral-500 dark:text-neutral-400 mb-6 flex items-center justify-between text-xs font-mono font-semibold uppercase tracking-wider">
            <span>
              {total === 0 ? (
                'No templates found'
              ) : (
                <>
                  <span className="text-neutral-800 dark:text-white font-bold">{total}</span>{' '}
                  template{total !== 1 ? 's' : ''} found
                </>
              )}
            </span>
          </div>

          {/* ── Empty State ─────────────────────────────────────────────── */}
          {templates.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center rounded-[2rem] border border-neutral-250 bg-white/50 dark:border-neutral-850 dark:bg-neutral-900/10 shadow-sm">
              <SearchX className="text-neutral-400 dark:text-neutral-600 size-14" />
              <div>
                <p className="text-neutral-900 dark:text-white font-bold text-lg">
                  No templates match your filters
                </p>
                <p className="text-neutral-550 dark:text-neutral-450 mt-1 text-sm">
                  {hasActiveFilters
                    ? 'Try broadening your search or clearing some filters.'
                    : 'No published templates are available yet. Check back soon.'}
                </p>
              </div>
            </div>
          )}

          {/* ── Card Grid ───────────────────────────────────────────────── */}
          {templates.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>

              {/* ── Pagination ────────────────────────────────────────── */}
              <Suspense fallback={null}>
                <PaginationControls
                  total={total}
                  limit={LIMIT}
                  currentPage={page}
                />
              </Suspense>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
