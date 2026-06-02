'use server';

import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ─── Slug Generator ──────────────────────────────────────────────────────────

async function generateUniqueSlug(
  title: string,
  currentId?: string
): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let slug = baseSlug;
  let counter = 1;
  for (;;) {
    const existing = await prisma.template.findFirst({
      where: {
        slug,
        id: currentId ? { not: currentId } : undefined,
      },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ─── Zod Template Schema ──────────────────────────────────────────────────────

const templateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  sampleOutput: z.string().optional().nullable(),
  category: z.enum(['BLOG', 'SOCIAL', 'EMAIL', 'AD_COPY']),
  tone: z.string().optional().nullable(),
  estimatedWords: z.number().int().positive().optional().nullable(),
  aiModel: z.string().default('gemini-2.5-flash'),
  isPublished: z.boolean().default(false),
  thumbnailUrl: z.string().optional().nullable(),
});

// ─── Admin Role Management Actions ────────────────────────────────────────────

export async function changeUserRole(
  targetUserId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  if (session.user.id === targetUserId) {
    return {
      success: false,
      error: 'Security constraint: You cannot change your own role.',
    };
  }

  try {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Change user role error:', error);
    return { success: false, error: 'Failed to change user role' };
  }
}

export async function toggleBan(
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  if (session.user.id === targetUserId) {
    return {
      success: false,
      error: 'Security constraint: You cannot ban yourself.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { isBanned: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: !user.isBanned },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Toggle ban error:', error);
    return { success: false, error: 'Failed to toggle ban status' };
  }
}

// ─── Admin Template CRUD Actions ──────────────────────────────────────────────

export async function upsertTemplate(
  data: z.infer<typeof templateSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  const result = templateSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Invalid data',
    };
  }

  const { id, ...fields } = result.data;

  try {
    if (id) {
      const existing = await prisma.template.findUnique({ where: { id } });
      if (!existing) return { success: false, error: 'Template not found' };

      const slug =
        existing.title === fields.title
          ? existing.slug
          : await generateUniqueSlug(fields.title, id);

      await prisma.template.update({
        where: { id },
        data: {
          ...fields,
          slug,
        },
      });
    } else {
      const slug = await generateUniqueSlug(fields.title);
      await prisma.template.create({
        data: {
          ...fields,
          slug,
        },
      });
    }

    revalidatePath('/explore');
    return { success: true };
  } catch (error) {
    console.error('Upsert template error:', error);
    return { success: false, error: 'Failed to save template' };
  }
}

export async function deleteTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  try {
    await prisma.template.delete({ where: { id } });
    revalidatePath('/explore');
    return { success: true };
  } catch (error) {
    console.error('Delete template error:', error);
    return { success: false, error: 'Failed to delete template' };
  }
}

// ─── Admin Review Management Actions ──────────────────────────────────────────

export async function approveReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId },
        data: { status: 'APPROVED' },
      });

      const approvedReviews = await tx.review.findMany({
        where: {
          templateId: review.templateId,
          status: 'APPROVED',
        },
        select: { rating: true },
      });

      const averageRating =
        approvedReviews.length > 0
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
            approvedReviews.length
          : 0.0;

      await tx.template.update({
        where: { id: review.templateId },
        data: { rating: Number(averageRating.toFixed(2)) },
      });

      return { templateId: review.templateId };
    });

    revalidatePath('/explore');
    revalidatePath(`/templates/${result.templateId}`);
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error) {
    console.error('Approve review error:', error);
    return { success: false, error: 'Failed to approve review' };
  }
}

export async function rejectReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId },
        data: { status: 'REJECTED' },
      });

      const approvedReviews = await tx.review.findMany({
        where: {
          templateId: review.templateId,
          status: 'APPROVED',
        },
        select: { rating: true },
      });

      const averageRating =
        approvedReviews.length > 0
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
            approvedReviews.length
          : 0.0;

      await tx.template.update({
        where: { id: review.templateId },
        data: { rating: Number(averageRating.toFixed(2)) },
      });

      return { templateId: review.templateId };
    });

    revalidatePath('/explore');
    revalidatePath(`/templates/${result.templateId}`);
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error) {
    console.error('Reject review error:', error);
    return { success: false, error: 'Failed to reject review' };
  }
}

// ─── Global Site Settings Action ──────────────────────────────────────────────

export async function updateSiteSettings(
  maintenanceMode: boolean,
  aiEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  try {
    await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      update: { maintenanceMode, aiEnabled },
      create: { id: 'singleton', maintenanceMode, aiEnabled },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update site settings error:', error);
    return { success: false, error: 'Failed to update site settings' };
  }
}
