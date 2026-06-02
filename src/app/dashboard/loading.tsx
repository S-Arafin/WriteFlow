import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Header section skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="h-8 w-48 rounded bg-neutral-800" />
          <div className="mt-2 h-4 w-64 rounded bg-neutral-900" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-neutral-800" />
      </div>

      {/* Grid statistics skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
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

      {/* Table listing skeleton */}
      <div className="border border-neutral-900 bg-neutral-950/20 rounded-xl overflow-hidden">
        <div className="border-b border-neutral-900 bg-neutral-900/40 p-4">
          <div className="h-6 w-32 rounded bg-neutral-800" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-900/60 last:border-0">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-neutral-800" />
                <div className="h-4 w-32 rounded bg-neutral-900" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-5 w-16 rounded bg-neutral-900" />
                <div className="h-8 w-16 rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
