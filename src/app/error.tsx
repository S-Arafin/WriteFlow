'use client';

import { RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to your analytics or reporting services
    console.error('[Global Error Boundary] Caught exception:', error);
  }, [error]);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Visual background elements */}
      <div className="absolute -z-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -z-10 h-64 w-64 translate-x-12 translate-y-12 rounded-full bg-pink-500/5 blur-3xl" />

      {/* Main glassmorphic wrapper */}
      <div className="w-full max-w-md border border-neutral-900 bg-neutral-950/40 p-8 backdrop-blur-md rounded-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 animate-pulse">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">
          Application Error
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          An unexpected error occurred in our system. We have logged this event and are investigating.
        </p>

        {error.digest && (
          <div className="mt-4 border border-neutral-900 bg-neutral-900/30 px-3 py-1.5 text-xs text-neutral-500 font-mono rounded-lg">
            ID: {error.digest}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-white hover:bg-neutral-100 text-black px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 px-5 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
