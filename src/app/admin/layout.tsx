import {
  BarChart3,
  Users,
  FilePenLine,
  MessageSquare,
  Settings,
  Home,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Admin Console - WriteFlow AI',
  description: 'WriteFlow AI Administrator Control Panel.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const adminMenuItems = [
    { name: 'Analytics Overview', href: '/admin', icon: BarChart3 },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Blogs', href: '/admin/blogs', icon: BookOpen },
    { name: 'Manage Templates', href: '/admin/templates', icon: FilePenLine },
    { name: 'Manage Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans text-neutral-900 transition-colors duration-300 dark:bg-black dark:text-neutral-100">
      {/* Dynamic Background Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[35%] w-[35%] rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/5" />
        <div className="absolute top-[40%] right-[-5%] h-[30%] w-[30%] rounded-full bg-violet-600/5 blur-[120px] dark:bg-violet-600/5" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white/60 backdrop-blur-xl md:flex dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-900">
          <Link
            href="/"
            className="font-mono text-xl font-bold tracking-tight text-neutral-900 uppercase transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
          >
            WriteFlow{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="dark:text-neutral-550 mb-3 px-3 font-mono text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
            Admin Console
          </div>

          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="dark:hover:border-neutral-850 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-200 hover:bg-neutral-100/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-100"
              >
                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="dark:text-neutral-550 mb-3 px-3 pt-6 font-mono text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
            User Area
          </div>

          <Link
            href="/dashboard"
            className="dark:hover:border-neutral-850 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-neutral-600 transition-all hover:border-neutral-200 hover:bg-neutral-100/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-100"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Writer Dashboard</span>
          </Link>
        </nav>

        <div className="flex flex-col gap-2 border-t border-neutral-200 p-4 dark:border-neutral-900">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/40 px-6 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/40">
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Title */}
            <Link
              href="/"
              className="font-mono text-lg font-bold tracking-tight text-neutral-900 uppercase dark:text-white"
            >
              WriteFlow{' '}
              <span className="text-indigo-600 dark:text-indigo-400">
                ADMIN
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <span className="dark:text-neutral-550 font-mono text-xs font-semibold text-neutral-400 uppercase">
              Secure Administrative Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserDropdown user={session.user} />
          </div>
        </header>

        {/* Dynamic Mobile Subnav */}
        <nav className="dark:bg-neutral-955/80 sticky top-16 z-20 flex scrollbar-none items-center justify-around gap-2 overflow-x-auto border-b border-neutral-200 bg-white/80 px-2 py-2.5 text-xs whitespace-nowrap text-neutral-500 transition-colors md:hidden dark:border-neutral-900 dark:text-neutral-400">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
            >
              {item.name.replace('Manage ', '')}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full border border-emerald-500/20 px-3 py-1 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-950/40 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
          >
            Writer Area
          </Link>
        </nav>

        {/* Content Page Grid */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
