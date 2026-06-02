import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-64 rounded bg-neutral-800" />
        <div className="mt-2 h-4 w-96 rounded bg-neutral-900" />
      </div>

      {/* Grid stats skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-neutral-900 bg-neutral-950/20 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-neutral-900" />
              <div className="h-8 w-8 rounded bg-neutral-800" />
            </div>
            <div className="mt-4 h-8 w-16 rounded bg-neutral-800" />
          </div>
        ))}
      </div>

      {/* Heavy analytical charts block skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="border border-neutral-900 bg-neutral-950/20 p-6 rounded-xl lg:col-span-2">
          <div className="mb-6 h-6 w-48 rounded bg-neutral-800" />
          <div className="h-[280px] w-full rounded bg-neutral-900/40 animate-pulse" />
        </div>
        <div className="border border-neutral-900 bg-neutral-950/20 p-6 rounded-xl">
          <div className="mb-6 h-6 w-32 rounded bg-neutral-800" />
          <div className="mx-auto h-[200px] w-[200px] rounded-full border-8 border-neutral-900 bg-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}
