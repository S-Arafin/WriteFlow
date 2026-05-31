'use server';

import { ReviewStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ─── Validation Schema ────────────────────────────────────────────────────────

const reviewSchema = z.object({
  templateId: z.string().uuid('Invalid template reference'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  body: z
    .string()
    .max(2000, 'Review body cannot exceed 2000 characters')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof reviewSchema>;

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function createReview(
  input: CreateReviewInput
): Promise<ActionResult> {
  // 1. Authentication gate
  // session.user.id is non-optional per our NextAuth type declaration
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      error: 'You must be signed in to leave a review.',
    };
  }

  // 2. Input validation
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { templateId, rating, body } = parsed.data;
  const authorId = session.user.id;

  try {
    // 3. Confirm the template exists and is published
    const template = await prisma.template.findUnique({
      where: { id: templateId, isPublished: true },
      select: { id: true },
    });

    if (!template) {
      return { success: false, error: 'Template not found.' };
    }

    // 4. Create review — the @@unique([authorId, templateId]) constraint on the
    //    Review model enforces the one-review-per-user rule at the database level.
    //    We catch the P2002 unique violation code and return a clear message.
    await prisma.review.create({
      data: {
        rating,
        body: body?.trim() || null,
        status: ReviewStatus.PENDING,
        authorId,
        templateId,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    // Prisma unique constraint violation → duplicate review
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return {
        success: false,
        error: 'You have already submitted a review for this template.',
      };
    }

    console.error('[createReview] Unexpected error:', err);
    return {
      success: false,
      error: 'An internal error occurred. Please try again.',
    };
  }
}

// ─── Rating Recalculation (called server-side after review approval) ───────────

/**
 * Recomputes and persists the template's average rating from all
 * currently APPROVED reviews. Call this from the admin approval flow.
 */
export async function recalculateTemplateRating(
  templateId: string
): Promise<void> {
  const aggregate = await prisma.review.aggregate({
    where: { templateId, status: ReviewStatus.APPROVED },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.template.update({
    where: { id: templateId },
    data: {
      rating: aggregate._avg.rating ?? 0,
    },
  });
}
