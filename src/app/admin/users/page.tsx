import { UserRole } from '@prisma/client';
import {
  Search,
  Shield,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { changeUserRole, toggleBan } from '@/actions/admin';
import { ToggleBanButton } from '@/components/admin/toggle-ban-button';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Manage Users - WriteFlow ADMIN',
  description:
    'Manage users roles, membership tiers, and accounts restrictions.',
};

interface ManageUsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function ManageUsersPage({
  searchParams,
}: ManageUsersPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const page = parseInt(resolvedParams.page || '1', 10);
  const itemsPerPage = 8;

  // 1. Where Clause
  const whereClause: import('@prisma/client').Prisma.UserWhereInput = {};
  if (q) {
    whereClause.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }

  // 2. Fetch Users
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 3. Mutation Wrappers (Inline Server Actions)
  async function handleRoleChange(formData: FormData) {
    'use server';
    const targetUserId = formData.get('userId');
    const newRole = formData.get('role');
    if (typeof targetUserId === 'string' && typeof newRole === 'string') {
      await changeUserRole(targetUserId, newRole as UserRole);
      revalidatePath('/admin/users');
    }
  }

  async function handleBanToggle(formData: FormData) {
    'use server';
    const targetUserId = formData.get('userId');
    if (typeof targetUserId === 'string') {
      await toggleBan(targetUserId);
      revalidatePath('/admin/users');
    }
  }

  return (
    <div className="space-y-8 font-sans transition-colors duration-300">
      <div>
        <h1 className="font-mono text-3xl font-extrabold tracking-tight text-neutral-900 uppercase dark:text-white">
          Manage Users
        </h1>
        <p className="text-neutral-555 mt-1 text-sm font-medium dark:text-neutral-400">
          Review accounts, adjust subscription tiers, toggle access bans.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="dark:border-neutral-850 flex flex-col items-stretch justify-between gap-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center dark:bg-neutral-900/20">
        <form method="GET" className="relative max-w-lg flex-1">
          <Search className="dark:text-neutral-550 absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search users by name or email address..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pr-4 pl-10 text-sm text-neutral-800 transition-colors placeholder:text-neutral-400 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-200 dark:placeholder:text-neutral-500"
          />
        </form>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="dark:border-neutral-850 space-y-6 rounded-[2rem] border border-neutral-200 bg-white/50 py-16 text-center shadow-sm backdrop-blur-sm dark:bg-neutral-900/10">
          <div className="dark:border-neutral-850 text-neutral-450 dark:text-neutral-550 inline-flex rounded-2xl border border-neutral-200 bg-neutral-100 p-4 shadow-sm dark:bg-neutral-900/50">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-mono text-xl font-bold text-neutral-900 uppercase dark:text-white">
              No users found
            </h3>
            <p className="text-neutral-550 dark:text-neutral-450 mx-auto mt-1 max-w-sm text-sm leading-relaxed">
              Try typing a different keyword or searching a full email address.
            </p>
          </div>
        </div>
      ) : (
        <div className="dark:border-neutral-850 overflow-hidden overflow-x-auto rounded-[2rem] border border-neutral-200 bg-white/50 shadow-sm backdrop-blur-xl dark:bg-neutral-950/40">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="dark:border-neutral-850/80 border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:bg-neutral-900/20 dark:text-neutral-400">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role Status</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Ban Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="dark:divide-neutral-850 divide-y divide-neutral-200 text-sm">
              {users.map((u) => {
                const isSelf = u.id === session.user.id;
                return (
                  <tr
                    key={u.id}
                    className="group transition-colors hover:bg-neutral-100/30 dark:hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                          {u.avatarUrl ? (
                            <Image
                              src={u.avatarUrl}
                              alt={u.name || 'User'}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="block max-w-[180px] truncate font-bold text-neutral-800 sm:max-w-xs dark:text-neutral-200">
                            {u.name || (
                              <span className="text-neutral-400 italic dark:text-neutral-600">
                                No name provided
                              </span>
                            )}
                            {isSelf && (
                              <span className="ml-1.5 inline-flex rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[8px] font-extrabold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                You
                              </span>
                            )}
                          </p>
                          <p className="dark:text-neutral-450 mt-0.5 max-w-[180px] truncate font-mono text-xs text-neutral-500 sm:max-w-xs">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                          u.role === 'ADMIN'
                            ? 'border-indigo-150 bg-indigo-50 text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-950/30 dark:text-indigo-400'
                            : 'border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-900/20 dark:bg-teal-950/30 dark:text-teal-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-750 font-mono text-xs font-bold uppercase dark:text-neutral-300">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <span className="dark:text-rose-450 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-rose-600 uppercase dark:border-rose-900/20 dark:bg-rose-950/30">
                          <Ban className="h-3 w-3" />
                          BANNED
                        </span>
                      ) : (
                        <span className="border-emerald-250 inline-flex items-center gap-1 rounded-md border bg-emerald-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-emerald-600 uppercase dark:border-emerald-900/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="text-neutral-450 dark:text-neutral-550 font-mono text-xs italic">
                          Self Locked
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          {/* Change Role Trigger */}
                          <form
                            action={handleRoleChange}
                            className="inline-flex"
                          >
                            <input type="hidden" name="userId" value={u.id} />
                            <input
                              type="hidden"
                              name="role"
                              value={u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                            />
                            <button
                              type="submit"
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors duration-150 hover:scale-[1.02] active:scale-95 ${
                                u.role === 'ADMIN'
                                  ? 'border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 dark:border-teal-900/30 dark:bg-teal-950/10 dark:text-teal-400 dark:hover:bg-teal-950/30'
                                  : 'border-indigo-150 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-950/10 dark:text-indigo-400 dark:hover:bg-indigo-950/30'
                              }`}
                            >
                              <Shield className="h-3.5 w-3.5" />
                              <span>
                                {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                              </span>
                            </button>
                          </form>

                          {/* Toggle Ban Trigger using client component */}
                          <ToggleBanButton
                            userId={u.id}
                            isBanned={u.isBanned}
                            onToggleBan={handleBanToggle}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 pt-6 dark:border-neutral-900">
          <p className="text-neutral-550 text-xs dark:text-neutral-400">
            Showing Page{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {page}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {totalPages}
            </span>{' '}
            ({totalCount} total accounts)
          </p>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={`/admin/users?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  page: (page - 1).toString(),
                }).toString()}`}
                className="text-neutral-650 hover:border-neutral-350 dark:border-neutral-850 inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold transition-colors hover:text-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-neutral-100 bg-white/30 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
            )}

            {page < totalPages ? (
              <Link
                href={`/admin/users?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  page: (page + 1).toString(),
                }).toString()}`}
                className="text-neutral-650 hover:border-neutral-350 dark:border-neutral-850 inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold transition-colors hover:text-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-neutral-100 bg-white/30 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 dark:border-neutral-900 dark:bg-neutral-950 dark:text-neutral-700"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
