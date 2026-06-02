import {
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  FilePenLine,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { deleteDocument } from '@/actions/documents';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'My Documents - WriteFlow AI',
  description: 'Manage and search your created documents and drafts.',
};

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const status = resolvedParams.status || 'ALL';
  const page = parseInt(resolvedParams.page || '1', 10);
  const itemsPerPage = 8;

  // 1. Construct Where Query
  const whereClause: import('@prisma/client').Prisma.DocumentWhereInput = {
    authorId: session.user.id,
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (status !== 'ALL') {
    whereClause.status = status as import('@prisma/client').DocumentStatus;
  }

  // 2. Fetch data in parallel
  const [documents, totalCount] = await Promise.all([
    prisma.document.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      include: {
        template: {
          select: { title: true, category: true },
        },
      },
    }),
    prisma.document.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 3. Delete Handler (Inline Server Action to allow deletion)
  async function handleDelete(formData: FormData) {
    'use server';
    const id = formData.get('documentId') as string;
    if (id) {
      await deleteDocument(id);
      revalidatePath('/dashboard');
    }
  }

  const statuses = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

  return (
    <div className="space-y-8 font-sans">
      {/* Upper header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            My Documents
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage, edit, and keep track of your content drafts.
          </p>
        </div>
        <Link
          href="/dashboard/editor"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/10 transition-all hover:from-teal-400 hover:to-emerald-400 hover:shadow-teal-500/20 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Document</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-900 bg-slate-900/20 p-4 backdrop-blur-xl lg:flex-row lg:items-center">
        {/* Search */}
        <form method="GET" className="relative max-w-lg flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search documents by title or keywords..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 pr-4 pl-10 text-sm text-slate-200 transition-colors placeholder:text-slate-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 focus:outline-none"
          />
          {status !== 'ALL' && (
            <input type="hidden" name="status" value={status} />
          )}
        </form>

        {/* Status Filters */}
        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 whitespace-nowrap lg:pb-0">
          {statuses.map((s) => {
            const isActive = status === s;
            const searchParamsString = new URLSearchParams({
              ...(q ? { q } : {}),
              status: s,
              page: '1',
            }).toString();

            return (
              <Link
                key={s}
                href={`/dashboard?${searchParamsString}`}
                className={`rounded-xl border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                  isActive
                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                    : 'border-slate-800 bg-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 py-16 text-center backdrop-blur-sm">
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-slate-500">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">
              No documents found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
              {q || status !== 'ALL'
                ? 'Try clearing your active filters or keywords and search again.'
                : 'Create your very first draft using our premium AI templates.'}
            </p>
          </div>
          {q || status !== 'ALL' ? (
            <Link
              href="/dashboard"
              className="inline-flex text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline"
            >
              Clear all filters
            </Link>
          ) : (
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <FilePenLine className="h-3.5 w-3.5 text-teal-400" />
              <span>Explore AI Templates</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-900 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <th className="px-6 py-4">Title & Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Words</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-sm">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="group transition-colors hover:bg-slate-900/10"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/editor/${doc.id}`}
                        className="block max-w-xs truncate text-base font-semibold text-slate-200 transition-colors hover:text-teal-400 sm:max-w-md"
                      >
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {doc.template ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-900/30 bg-violet-950/20 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                            <FilePenLine className="h-2.5 w-2.5" />
                            {doc.template.title}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">
                            Custom Editor Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                        doc.status === 'PUBLISHED'
                          ? 'border-emerald-900/30 bg-emerald-950/30 text-emerald-400'
                          : doc.status === 'ARCHIVED'
                            ? 'border-slate-800 bg-slate-900 text-slate-400'
                            : 'border-teal-900/30 bg-teal-950/30 text-teal-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {doc.wordCount.toLocaleString()} words
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                      <span>
                        {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <Link
                        href={`/dashboard/editor/${doc.id}`}
                        className="inline-flex rounded-lg border border-slate-800/80 bg-slate-900 p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        title="Edit Document"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      {/* Delete Form with dialog check */}
                      <form
                        action={handleDelete}
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              'Are you absolutely sure you want to delete this document? This action is permanent and cannot be undone.'
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="documentId" value={doc.id} />
                        <button
                          type="submit"
                          className="inline-flex rounded-lg border border-red-950/30 bg-red-950/10 p-2 text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
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
            {totalCount} total documents)
          </p>

          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={`/dashboard?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  status,
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
                href={`/dashboard?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  status,
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
