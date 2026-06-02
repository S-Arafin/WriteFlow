import React from 'react';

export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header Skeleton */}
      <div className="mb-10 max-w-xl">
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-neutral-800" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-neutral-900" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-lg bg-neutral-900" />
      </div>

      {/* Main Layout Skeleton */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Skeleton */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="h-[450px] w-full animate-pulse border border-neutral-900 bg-neutral-950/40 rounded-xl" />
        </aside>

        {/* Card Grid Skeleton */}
        <section className="flex-1">
          <div className="mb-6 h-5 w-32 animate-pulse rounded-lg bg-neutral-800" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[280px] flex-col justify-between border border-neutral-900 bg-neutral-950/20 p-6 rounded-xl animate-pulse"
              >
                <div>
                  <div className="mb-3 flex justify-between">
                    <div className="h-4 w-16 rounded bg-neutral-800" />
                    <div className="h-4 w-12 rounded bg-neutral-800" />
                  </div>
                  <div className="mb-2 h-6 w-3/4 rounded bg-neutral-800" />
                  <div className="h-4 w-full rounded bg-neutral-900" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-neutral-900" />
                </div>
                <div className="flex items-center justify-between border-t border-neutral-900 pt-4">
                  <div className="h-4 w-20 rounded bg-neutral-800" />
                  <div className="h-4 w-16 rounded bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
