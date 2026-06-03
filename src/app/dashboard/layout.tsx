import {
  FileText,
  User as UserIcon,
  BarChart3,
  ShieldCheck,
  Home,
  FilePenLine,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard - WriteFlow AI',
  description: 'Manage your documents, profile, and track your AI usage.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'ADMIN';

  const menuItems = [
    { name: 'My Documents', href: '/dashboard', icon: FileText },
    { name: 'My Profile', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Usage History', href: '/dashboard/usage', icon: BarChart3 },
    { name: 'Billing & Plans', href: '/dashboard/billing', icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-black font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[35%] w-[35%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] h-[30%] w-[30%] rounded-full bg-violet-600/5 dark:bg-violet-600/5 blur-[120px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-900 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-900 px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            WriteFlow{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              AI
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="mb-3 px-3 text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-mono">
            Workspace
          </div>

          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
          >
            <FilePenLine className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Templates Explore</span>
          </Link>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
              >
                <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="mb-3 px-3 pt-6 text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase font-mono">
                Admin Panel
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-all hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Analytics Dashboard</span>
              </Link>
            </>
          )}
        </nav>

        <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-900 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:text-neutral-550 dark:hover:text-neutral-350 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/40 px-6 backdrop-blur">
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Title */}
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
            >
              WriteFlow <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </Link>
          </div>
          <div className="hidden md:block">
            {/* Context breadcrumb or page status */}
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Secure Writer Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserDropdown user={session.user} />
          </div>
        </header>

        {/* Dynamic Mobile Subnav */}
        <nav className="sticky top-16 z-20 flex scrollbar-none items-center justify-around gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 px-2 py-2.5 text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400 md:hidden">
          <Link
            href="/explore"
            className="rounded-full px-3 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-white"
          >
            Templates
          </Link>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-white"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Content Page Grid */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
