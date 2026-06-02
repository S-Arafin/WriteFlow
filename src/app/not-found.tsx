import { AlertCircle, Home, Compass } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
      {/* Blurred decorative glowing backdrop shapes */}
      <div className="absolute -z-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -z-10 h-80 w-80 translate-x-16 translate-y-16 rounded-full bg-indigo-600/5 blur-3xl" />

      {/* Main glassmorphic layout card */}
      <div className="w-full max-w-lg border border-neutral-900 bg-neutral-950/40 p-10 backdrop-blur-md rounded-3xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h1 className="text-7xl font-extrabold tracking-tighter text-white">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Page Not Found
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          Sorry, we couldn&apos;t find the page you are looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Buttons / Actions */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-white hover:bg-neutral-100 text-black px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 px-6 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <Compass className="h-4 w-4" />
            Explore Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
