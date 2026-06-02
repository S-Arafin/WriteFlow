import {
  BarChart3,
  Users,
  FilePenLine,
  MessageSquare,
  Settings,
  Home,
  ShieldCheck,
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
    { name: 'Manage Templates', href: '/admin/templates', icon: FilePenLine },
    { name: 'Manage Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Site Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Dynamic Background Gradients */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[35%] w-[35%] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] h-[30%] w-[30%] rounded-full bg-teal-600/5 blur-[120px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-900 bg-slate-950/60 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center justify-between border-b border-slate-900 px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white transition-colors hover:text-violet-400"
          >
            WriteFlow{' '}
            <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="mb-3 px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Admin Console
          </div>

          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-slate-800/50 hover:bg-slate-900/50 hover:text-slate-100"
              >
                <Icon className="h-4 w-4 text-violet-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="mb-3 px-3 pt-6 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            User Area
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-slate-800/50 hover:bg-slate-900/50 hover:text-slate-100"
          >
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>Writer Dashboard</span>
          </Link>
        </nav>

        <div className="flex flex-col gap-2 border-t border-slate-900 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Wrapper */}
      <div className="z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950/40 px-6 backdrop-blur">
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Title */}
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-white"
            >
              WriteFlow <span className="text-violet-400">ADMIN</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-medium text-slate-500">
              Secure Administrative Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserDropdown user={session.user} />
          </div>
        </header>

        {/* Dynamic Mobile Subnav */}
        <nav className="sticky top-16 z-20 flex scrollbar-none items-center justify-around gap-2 overflow-x-auto border-b border-slate-900 bg-slate-950/80 px-2 py-2.5 text-xs whitespace-nowrap text-slate-400 md:hidden">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 transition-colors hover:bg-slate-900/60 hover:text-white"
            >
              {item.name.replace('Manage ', '')}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full border border-teal-900/30 px-3 py-1 transition-colors hover:bg-teal-950/30 hover:text-teal-400"
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
