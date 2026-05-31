import { Rocket, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import { authOptions } from '@/lib/auth';

export default async function DashboardPlaceholderPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white transition-colors hover:text-indigo-400"
            >
              WriteFlow <span className="text-indigo-500">AI</span>
            </Link>
            <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400">
              WORK IN PROGRESS
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserDropdown user={session.user} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center backdrop-blur sm:p-12">
          <div className="mx-auto flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            <Rocket className="h-6 w-6" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Welcome, {session.user.name || 'Writer'}!
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-400">
              Your authentication session is active and role-secured at the Edge
              boundary.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-6 text-left font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2 text-[10px] text-neutral-500">
              <span>ACTIVE SESSION SECURITY DATA</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Shield className="h-3.5 w-3.5" /> SECURE JWT
              </span>
            </div>
            <div className="space-y-2 text-neutral-400">
              <p>
                <span className="text-indigo-400">User Email:</span>{' '}
                {session.user.email}
              </p>
              <p>
                <span className="text-indigo-400">User ID:</span>{' '}
                {session.user.id}
              </p>
              <p>
                <span className="text-indigo-400">Access Role:</span>{' '}
                <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                  {session.user.role}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="mx-auto max-w-sm text-xs leading-relaxed text-neutral-400">
              The full Workspace Dashboard, folder trees, document editors, and
              AI copywriting templates will be constructed in **Phase 4:
              Dashboard, Document Management & AI Templates**.
            </div>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="inline-flex cursor-pointer items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <span>Back to Homepage</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
