import React from 'react';

export default function TemplateDetailLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-8 h-4 w-24 rounded bg-neutral-800" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-neutral-900 bg-neutral-950/20 p-8 rounded-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-6 w-16 rounded bg-neutral-800" />
              <div className="h-6 w-20 rounded bg-neutral-800" />
            </div>
            <div className="mb-4 h-10 w-3/4 rounded bg-neutral-800" />
            <div className="h-4 w-full rounded bg-neutral-900" />
            <div className="mt-2 h-4 w-5/6 rounded bg-neutral-900" />
            <div className="mt-2 h-4 w-2/3 rounded bg-neutral-900" />
          </div>

          <div className="border border-neutral-900 bg-neutral-950/20 p-8 rounded-2xl">
            <div className="mb-4 h-6 w-32 rounded bg-neutral-800" />
            <div className="h-[200px] w-full rounded-xl bg-neutral-900/60" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-2xl">
            <div className="mb-6 h-10 w-full rounded-xl bg-neutral-800" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-16 rounded bg-neutral-900" />
                <div className="h-4 w-20 rounded bg-neutral-800" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 rounded bg-neutral-900" />
                <div className="h-4 w-16 rounded bg-neutral-800" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 rounded bg-neutral-900" />
                <div className="h-4 w-24 rounded bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
