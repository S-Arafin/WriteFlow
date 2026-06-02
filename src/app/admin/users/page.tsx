import { UserRole } from '@prisma/client';
import {
  Search,
  ShieldAlert,
  UserCheck,
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
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review accounts, adjust subscription tiers, toggle access bans.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-900 bg-slate-900/20 p-4 backdrop-blur-xl lg:flex-row lg:items-center">
        <form method="GET" className="relative max-w-lg flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search users by name or email address..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 pr-4 pl-10 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 focus:outline-none"
          />
        </form>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 py-16 text-center backdrop-blur-sm">
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-slate-500">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">No users found</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
              Try typing a different keyword or searching a full email address.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-900 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role Status</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Ban Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-sm">
              {users.map((u) => {
                const isSelf = u.id === session.user.id;
                return (
                  <tr
                    key={u.id}
                    className="group transition-colors hover:bg-slate-900/10"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900 text-slate-400">
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
                          <p className="block max-w-[180px] truncate font-semibold text-slate-200 sm:max-w-xs">
                            {u.name || (
                              <span className="text-slate-600 italic">
                                No name provided
                              </span>
                            )}
                            {isSelf && (
                              <span className="ml-1.5 inline-flex rounded border border-violet-900/55 bg-violet-950/40 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider text-violet-400 uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500 sm:max-w-xs">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'border-violet-900/30 bg-violet-950/30 text-violet-400'
                            : 'border-teal-900/30 bg-teal-950/30 text-teal-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-400 uppercase">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-900/30 bg-red-950/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          <Ban className="h-3 w-3" />
                          BANNED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-900/30 bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle className="h-3 w-3" />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="text-xs text-slate-600 italic">
                          Self operations locked
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-3.5">
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
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                                u.role === 'ADMIN'
                                  ? 'border-teal-950/30 bg-teal-950/10 text-teal-400 hover:bg-teal-950/30'
                                  : 'border-violet-950/30 bg-violet-950/10 text-violet-400 hover:bg-violet-950/30'
                              }`}
                            >
                              <Shield className="h-3.5 w-3.5" />
                              <span>
                                {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                              </span>
                            </button>
                          </form>

                          {/* Toggle Ban Trigger */}
                          <form
                            action={handleBanToggle}
                            className="inline-flex"
                            onSubmit={(e) => {
                              if (
                                !confirm(
                                  `Are you absolutely sure you want to ${u.isBanned ? 'UNBAN' : 'BAN'} this user's account?`
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="userId" value={u.id} />
                            <button
                              type="submit"
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                                u.isBanned
                                  ? 'border-emerald-950/30 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/30'
                                  : 'border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/30'
                              }`}
                            >
                              {u.isBanned ? (
                                <UserCheck className="h-3.5 w-3.5" />
                              ) : (
                                <ShieldAlert className="h-3.5 w-3.5" />
                              )}
                              <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                            </button>
                          </form>
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
        <div className="flex items-center justify-between border-t border-slate-900 pt-6">
          <p className="text-xs text-slate-500">
            Showing Page{' '}
            <span className="font-semibold text-slate-300">{page}</span> of{' '}
            <span className="font-semibold text-slate-300">{totalPages}</span> (
            {totalCount} total accounts)
          </p>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={`/admin/users?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  page: (page - 1).toString(),
                }).toString()}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
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
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-700"
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
