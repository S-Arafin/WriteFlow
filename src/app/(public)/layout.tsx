import Link from 'next/link';
import { getServerSession } from 'next-auth';
import React from 'react';

import { Footer } from '@/components/footer';
import { MobileMenu } from '@/components/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import { authOptions } from '@/lib/auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Header */}
      <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-foreground text-xl font-bold tracking-tight transition-colors hover:text-indigo-400"
            >
              WriteFlow <span className="text-indigo-500">AI</span>
            </Link>
            <nav className="text-muted-foreground hidden space-x-6 text-sm font-medium md:flex">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors sm:inline-block"
                >
                  Dashboard
                </Link>
                <UserDropdown user={session.user} />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-indigo-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 sm:inline-block"
                >
                  Get Started
                </Link>
              </div>
            )}
            <MobileMenu isAuthenticated={!!session} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
