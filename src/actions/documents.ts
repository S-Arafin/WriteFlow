'use server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Updates a document's content or title.
 * Enforces ownership checks and computes dynamic word counts on saves.
 */
export async function updateDocument(
  id: string,
  input: UpdateDocumentInput
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        success: false,
        error: 'You must be signed in to perform this action.',
      };
    }

    // 1. Confirm document exists and user is owner
    const document = await prisma.document.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!document) {
      return { success: false, error: 'Document not found.' };
    }

    if (document.authorId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to edit this document.',
      };
    }

    // 2. Prepare update data
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
      updateData.title = input.title.trim() || 'Untitled Document';
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
      // Compute word count dynamically using regex split
      const cleanText = input.content.replace(/<[^>]*>/g, ' '); // Strip HTML tags first
      const words = cleanText.trim().split(/\s+/).filter(Boolean);
      updateData.wordCount = words.length;
    }

    // 3. Update in database
    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        wordCount: true,
        updatedAt: true,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('[updateDocument] Unexpected error:', error);
    return {
      success: false,
      error: 'An internal error occurred while saving.',
    };
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const { revalidatePath } = await import('next/cache');
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        success: false,
        error: 'You must be signed in to perform this action.',
      };
    }

    const document = await prisma.document.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!document) {
      return { success: false, error: 'Document not found.' };
    }

    if (document.authorId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to delete this document.',
      };
    }

    await prisma.document.delete({
      where: { id },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[deleteDocument] Unexpected error:', error);
    return {
      success: false,
      error: 'An internal error occurred while deleting.',
    };
  }
}
