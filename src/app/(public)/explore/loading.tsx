/**
 * Skeleton loader for the /explore page.
 * Renders 12 placeholder cards with animate-pulse to indicate
 * that data is being fetched. Matches the exact layout grid
 * of the real TemplateCard grid so the transition is seamless.
 */
export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header skeleton */}
      <div className="mb-10 space-y-3">
        <div className="bg-muted h-9 w-64 animate-pulse rounded-lg" />
        <div className="bg-muted h-4 w-96 animate-pulse rounded" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
          <div className="bg-muted h-10 animate-pulse rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="bg-muted h-8 animate-pulse rounded-md"
                  />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Cards grid skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border-border overflow-hidden rounded-xl border"
              >
                {/* Thumbnail */}
                <div className="bg-muted aspect-video w-full animate-pulse" />
                {/* Card body */}
                <div className="space-y-3 p-5">
                  {/* Category badge */}
                  <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
                  {/* Title */}
                  <div className="bg-muted h-5 w-4/5 animate-pulse rounded" />
                  {/* Description lines */}
                  <div className="space-y-1.5">
                    <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
                    <div className="bg-muted h-3.5 w-3/4 animate-pulse rounded" />
                  </div>
                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
