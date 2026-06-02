'use client';

import { RotateCcw, AlertOctagon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary] Caught exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md border border-neutral-900 bg-neutral-950/40 p-8 backdrop-blur-md rounded-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <AlertOctagon className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white">
          Dashboard Failure
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          We encountered an issue loading your dashboard documents or assets.
        </p>

        {error.digest && (
          <div className="mt-4 border border-neutral-900 bg-neutral-900/30 px-3 py-1.5 text-xs text-neutral-500 font-mono rounded-lg">
            Reference ID: {error.digest}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-white hover:bg-neutral-100 text-black px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Load
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
