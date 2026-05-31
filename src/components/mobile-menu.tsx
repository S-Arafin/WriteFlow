'use client';

import {
  Menu,
  Home,
  BookOpen,
  User,
  Mail,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Blog', href: '/blog', icon: BookOpen },
    { label: 'About', href: '/about', icon: User },
    { label: 'Contact', href: '/contact', icon: Mail },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground cursor-pointer md:hidden"
          />
        }
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] border-neutral-900 bg-neutral-950 text-neutral-200"
      >
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl font-bold tracking-tight text-white">
            WriteFlow <span className="text-indigo-500">AI</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white ${isActive ? 'border border-indigo-500/10 bg-indigo-600/10 text-indigo-400' : 'text-neutral-400'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="my-4 border-t border-neutral-900 pt-4" />

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-900 hover:text-white ${pathname === '/dashboard' ? 'border border-indigo-500/10 bg-indigo-600/10 text-indigo-400' : 'text-neutral-400'}`}
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex w-full cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-400 transition-colors hover:bg-neutral-900 hover:text-rose-300"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-3 px-3 pt-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
