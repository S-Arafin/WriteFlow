'use client';

import { LogOut, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: 'USER' | 'ADMIN';
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return 'WF';
    const parts = name.split(' ');
    return parts
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-indigo-500/20 bg-indigo-600/10 text-xs font-semibold text-indigo-400 transition-all hover:border-indigo-500 hover:text-white" />
        }
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            fill
            sizes="32px"
            className="object-cover"
          />
        ) : (
          getInitials(user.name)
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-neutral-800 bg-neutral-900 p-1 text-neutral-200"
      >
        <div className="flex flex-col space-y-1 px-3 py-2.5 font-normal">
          <p className="text-sm leading-none font-semibold text-white">
            {user.name || 'User'}
          </p>
          <p className="mt-0.5 truncate text-xs leading-none text-neutral-400">
            {user.email}
          </p>
          {user.role && (
            <span className="mt-1 inline-flex self-start rounded border border-indigo-500/30 bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-300 uppercase">
              {user.role}
            </span>
          )}
        </div>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          render={
            <Link href="/dashboard" className="flex w-full items-center" />
          }
          className="cursor-pointer transition-colors hover:bg-neutral-800 focus:bg-neutral-800 focus:text-white"
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-neutral-400" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/' })}
          className="cursor-pointer text-rose-400 transition-colors hover:bg-neutral-800 focus:bg-neutral-800 focus:text-rose-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
