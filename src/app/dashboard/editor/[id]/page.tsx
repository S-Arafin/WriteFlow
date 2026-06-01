import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React, { Suspense } from 'react';

import { EditorClient } from '@/components/editor/editor-client';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserDropdown } from '@/components/user-dropdown';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

/**
 * React Server Component (RSC) that secures the document editor page.
 * Loads the active document from Prisma, validates ownership, and initializes
 * the rich-text Tiptap and sidebar AI chat system.
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  // Retrieve the document
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    notFound();
  }

  // Security gate: Ensure current authenticated user is the document author
  if (document.authorId !== session.user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold tracking-tight text-white">
              WriteFlow <span className="text-indigo-500">Editor</span>
            </span>
            <span className="hidden rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-0.5 text-xs font-medium text-neutral-400 sm:inline-block">
              {document.wordCount} words
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserDropdown user={session.user} />
          </div>
        </div>
      </header>

      {/* Editor Shell Grid */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          }
        >
          <EditorClient document={document} userPlan={session.user.plan} />
        </Suspense>
      </main>
    </div>
  );
}
