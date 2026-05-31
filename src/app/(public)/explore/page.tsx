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

  const raw = (key: string) =>
    Array.isArray(params[key]) ? params[key][0] : (params[key] ?? '');

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
    <div className="container mx-auto px-4 py-12">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <LayoutGrid className="size-5 text-indigo-400" />
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Explore Templates
          </h1>
        </div>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Discover professionally crafted AI prompts for every content format.
          Filter by category, sort by usage or rating, and launch your next
          piece in seconds.
        </p>
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/*
         * FilterSidebar is a Client Component (uses useSearchParams + useRouter).
         * Wrap in Suspense so the RSC page shell can stream independently.
         */}
        <Suspense
          fallback={
            <aside className="bg-muted hidden h-96 w-64 animate-pulse rounded-xl lg:block" />
          }
        >
          <FilterSidebar />
        </Suspense>

        {/* ── Results Column ──────────────────────────────────────────────── */}
        <section className="min-w-0 flex-1">
          {/* Results count */}
          <div className="text-muted-foreground mb-6 flex items-center justify-between text-sm">
            <span>
              {total === 0 ? (
                'No templates found'
              ) : (
                <>
                  <span className="text-foreground font-semibold">{total}</span>{' '}
                  template{total !== 1 ? 's' : ''} found
                </>
              )}
            </span>
          </div>

          {/* ── Empty State ─────────────────────────────────────────────── */}
          {templates.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <SearchX className="text-muted-foreground/40 size-14" />
              <div>
                <p className="text-foreground font-semibold">
                  No templates match your filters
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
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
