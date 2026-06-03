'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const blogPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(30, 'Category cannot exceed 30 characters'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt cannot exceed 300 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters'),
});

export type CreateBlogPostInput = z.infer<typeof blogPostSchema>;

export interface BlogActionResult {
  success: boolean;
  slug?: string;
  error?: string;
}

export async function createBlogPost(
  input: CreateBlogPostInput
): Promise<BlogActionResult> {
  // 1. Session & authentication validation
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'You must be signed in to publish a blog post.',
    };
  }

  // 2. Input validation
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid form input.',
    };
  }

  const { title, category, excerpt, content } = parsed.data;
  const authorId = session.user.id;

  try {
    // 3. Generate a unique URL slug
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')         // replace spaces with hyphens
      .replace(/-+/g, '-')          // replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens

    if (!slug) {
      slug = 'untitled-post';
    }

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingPost) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 4. Calculate reading time
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 225));
    const readTime = `${minutes} min read`;

    // 5. Format current date (e.g., "June 3, 2026")
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 6. Persist blog post
    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        category,
        excerpt,
        content,
        readTime,
        date: formattedDate,
        authorId,
      },
    });

    // 7. Revalidate the blog list route
    revalidatePath('/blog');

    return {
      success: true,
      slug: post.slug,
    };
  } catch (error) {
    console.error('[createBlogPost] Unexpected error:', error);
    return {
      success: false,
      error: 'An internal error occurred while creating the blog post.',
    };
  }
}
