import {
  FileText,
  Search,
  Plus,
  Edit3,
  Calendar,
  FilePenLine,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { deleteDocument } from '@/actions/documents';
import { DeleteDocumentButton } from '@/components/dashboard/delete-document-button';
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

  // 2. Fetch data in parallel (plus all docs to calculate aggregate stats)
  const [documents, totalCount, allUserDocs] = await Promise.all([
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
    prisma.document.findMany({
      where: { authorId: session.user.id },
      select: { wordCount: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const totalUserDocs = allUserDocs.length;
  const totalUserWords = allUserDocs.reduce((sum, doc) => sum + doc.wordCount, 0);

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
      {/* ── UPPER HEADER: CHECK BOX STYLE ───────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase font-mono">
            Check Box
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            WriteFlow secure document control console.
          </p>
        </div>

        {/* Filter Pills / Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/40 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Filter Status:</span>
            <span className="font-bold text-neutral-900 dark:text-white ml-1">
              {status}
            </span>
          </div>

          <Link
            href="/dashboard/editor"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-400 hover:bg-lime-300 dark:bg-lime-300 dark:hover:bg-lime-200 text-neutral-950 shadow-md shadow-lime-400/20 hover:scale-105 active:scale-95 transition-all"
            title="Create New Document"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* ── BENTO TELEMETRY BLOCKS: INSPIRED BY MOCKUP IMAGE 1 ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Customer Style (Drafting Statistics) */}
        <div className="p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900/30 shadow-sm flex flex-col justify-between overflow-hidden relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Drafts Active
            </span>
            <div className="flex items-center gap-1 text-lime-600 dark:text-lime-400">
              <span className="text-[10px] font-bold">▲ 2,4%</span>
            </div>
          </div>

          {/* SVG Line Spark */}
          <div className="absolute bottom-6 left-6 right-6 h-12 pointer-events-none opacity-80">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M0,80 Q20,30 40,65 T80,15 T100,50"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
              <path
                d="M0,80 Q20,30 40,65 T80,15 T100,50 Q100,20 100,100 L0,100 Z"
                fill="url(#grad2)"
                className="opacity-10"
              />
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="mt-8 z-10 flex items-baseline justify-between">
            <div>
              <div className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                {totalUserDocs}
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                Workspace drafts.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                100% Secure
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Product Style (Word Output Dot Matrix Grid) */}
        <div className="p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Words Volume
            </span>
            <div className="flex items-center gap-1 text-lime-600 dark:text-lime-400">
              <span className="text-[10px] font-bold">▲ 3.2%</span>
            </div>
          </div>

          {/* Dot matrix pattern grid */}
          <div className="mt-6 flex flex-wrap gap-1.5 justify-start pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i < Math.min(Math.floor(totalUserWords / 200) + 2, 24)
                    ? 'bg-lime-400'
                    : 'bg-neutral-200 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>

          <div className="mt-8 flex items-baseline justify-between">
            <div>
              <div className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                {totalUserWords.toLocaleString()}
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                Generated words total.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: Custom Vertical Bar Graph Vibe */}
        <div className="p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
              Workspace Mix
            </span>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 font-mono">
              [ Resources ]
            </span>
          </div>

          {/* Custom SVG vertical rounded capsules chart */}
          <div className="mt-4 flex items-end justify-between h-14 px-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-4 rounded-full bg-lime-400 h-10" />
              <span className="text-[8px] font-mono text-neutral-500">Dft</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-4 rounded-full bg-indigo-500 h-12" />
              <span className="text-[8px] font-mono text-neutral-500">Pub</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-4 rounded-full bg-orange-400 h-6" />
              <span className="text-[8px] font-mono text-neutral-500">Arc</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Draft
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Pub
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              Arc
            </span>
          </div>
        </div>

      </div>

      {/* ── ACTIVE CONTROLS & SEARCH ────────────────────────────────────────── */}
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-3xl border border-neutral-200 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/20 p-4 backdrop-blur-xl lg:flex-row lg:items-center shadow-sm">
        {/* Search Input */}
        <form method="GET" className="relative max-w-lg flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search documents by title or keywords..."
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/50 py-2.5 pr-4 pl-11 text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none"
          />
          {status !== 'ALL' && (
            <input type="hidden" name="status" value={status} />
          )}
        </form>

        {/* Status Tab Links */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 whitespace-nowrap lg:pb-0 scrollbar-none">
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
                className={`rounded-xl border px-4 py-2 text-[10px] font-bold tracking-wider uppercase transition-all ${
                  isActive
                    ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-500 hover:border-neutral-300 dark:text-neutral-450 dark:hover:border-neutral-700 dark:hover:text-neutral-200'
                }`}
              >
                {s}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── BENTO CONTAINER FOR DOCUMENTS LIST ──────────────────────────────── */}
      {documents.length === 0 ? (
        <div className="space-y-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white/50 dark:bg-neutral-900/10 py-20 text-center backdrop-blur-sm shadow-sm">
          <div className="inline-flex rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50 p-4 text-neutral-450 dark:text-neutral-550 shadow-sm">
            <FileText className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              No documents found
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-550 dark:text-neutral-450">
              {q || status !== 'ALL'
                ? 'Try clearing your active filters or keywords and search again.'
                : 'Create your very first draft using our premium AI templates.'}
            </p>
          </div>
          {q || status !== 'ALL' ? (
            <Link
              href="/dashboard"
              className="inline-flex text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear all filters
            </Link>
          ) : (
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <Compass className="h-4 w-4" />
              <span>Explore AI Templates</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-neutral-200 dark:border-neutral-850 bg-white/50 dark:bg-neutral-950/40 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-850/80 text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase bg-neutral-50/50 dark:bg-neutral-900/20">
                <th className="px-6 py-4">Title & Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Words</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-850 text-sm">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="group transition-colors hover:bg-neutral-100/30 dark:hover:bg-neutral-900/20"
                >
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/editor/${doc.id}`}
                        className="block max-w-xs truncate text-[15px] font-bold text-neutral-900 dark:text-neutral-200 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 sm:max-w-md"
                      >
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {doc.template ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-950/30 dark:text-indigo-400">
                            <FilePenLine className="h-2.5 w-2.5" />
                            {doc.template.title}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                            Custom Editor Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                        doc.status === 'PUBLISHED'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : doc.status === 'ARCHIVED'
                            ? 'border-neutral-200 bg-neutral-100 text-neutral-550 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
                            : 'border-indigo-150 bg-indigo-50 text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {doc.wordCount.toLocaleString()} words
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
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
                        className="inline-flex rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 hover:border-neutral-350 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 dark:hover:text-white"
                        title="Edit Document"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      {/* Delete Form with dialog check using client component */}
                      <DeleteDocumentButton
                        documentId={doc.id}
                        onDelete={handleDelete}
                      />
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
        <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 pt-6">
          <p className="text-xs text-neutral-550 dark:text-neutral-400">
            Showing Page{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-350">{page}</span> of{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-350">{totalPages}</span> (
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
                className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-350 hover:text-neutral-800 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
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
                href={`/dashboard?${new URLSearchParams({
                  ...(q ? { q } : {}),
                  status,
                  page: (page + 1).toString(),
                }).toString()}`}
                className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-350 hover:text-neutral-800 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200"
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
