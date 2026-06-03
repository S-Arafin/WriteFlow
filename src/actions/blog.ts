'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
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
  content: z.string().min(50, 'Content must be at least 50 characters'),
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
  if (!session) {
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
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

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

export async function deleteBlogPost(
  postId: string
): Promise<BlogActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      error: 'You must be signed in to perform this action.',
    };
  }

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, error: 'Blog post not found.' };
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = post.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        error: 'You do not have permission to delete this post.',
      };
    }

    await prisma.blogPost.delete({
      where: { id: postId },
    });

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error) {
    console.error('[deleteBlogPost] Error:', error);
    return { success: false, error: 'Failed to delete blog post.' };
  }
}

const blogPostUpdateSchema = z.object({
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
  content: z.string().min(50, 'Content must be at least 50 characters'),
});

export async function updateBlogPost(
  postId: string,
  input: CreateBlogPostInput
): Promise<BlogActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      error: 'You must be signed in to edit a blog post.',
    };
  }

  const parsed = blogPostUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid form input.',
    };
  }

  const { title, category, excerpt, content } = parsed.data;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { authorId: true, slug: true },
    });

    if (!post) {
      return { success: false, error: 'Blog post not found.' };
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = post.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        error: 'You do not have permission to edit this post.',
      };
    }

    // Calculate reading time
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 225));
    const readTime = `${minutes} min read`;

    // Perform update
    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title,
        category,
        excerpt,
        content,
        readTime,
      },
    });

    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedPost.slug}`);
    revalidatePath('/admin/blogs');

    return {
      success: true,
      slug: updatedPost.slug,
    };
  } catch (error) {
    console.error('[updateBlogPost] Error:', error);
    return { success: false, error: 'Failed to update blog post.' };
  }
}

export async function voteBlogPost(
  postId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
): Promise<{
  success: boolean;
  upvotes: number;
  downvotes: number;
  userVote: string | null;
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      error: 'You must be signed in to vote.',
    };
  }

  const userId = session.user.id;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return {
        success: false,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        error: 'Post not found.',
      };
    }

    // Use transaction to ensure counts match exactly
    return await prisma.$transaction(async (tx) => {
      const existingVote = await tx.blogVote.findUnique({
        where: {
          userId_blogPostId: {
            userId,
            blogPostId: postId,
          },
        },
      });

      let newUserVote: string | null = voteType;

      if (existingVote) {
        if (existingVote.type === voteType) {
          // Cancel vote (toggle off)
          await tx.blogVote.delete({
            where: { id: existingVote.id },
          });
          newUserVote = null;
        } else {
          // Switch vote type
          await tx.blogVote.update({
            where: { id: existingVote.id },
            data: { type: voteType },
          });
        }
      } else {
        // Create new vote
        await tx.blogVote.create({
          data: {
            userId,
            blogPostId: postId,
            type: voteType,
          },
        });
      }

      // Count all upvotes and downvotes
      const upvotesCount = await tx.blogVote.count({
        where: { blogPostId: postId, type: 'UPVOTE' },
      });

      const downvotesCount = await tx.blogVote.count({
        where: { blogPostId: postId, type: 'DOWNVOTE' },
      });

      // Update post counts
      await tx.blogPost.update({
        where: { id: postId },
        data: {
          upvotesCount,
          downvotesCount,
        },
      });

      return {
        success: true,
        upvotes: upvotesCount,
        downvotes: downvotesCount,
        userVote: newUserVote,
      };
    });
  } catch (error) {
    console.error('[voteBlogPost] Error:', error);
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      error: 'Failed to process vote.',
    };
  }
}

export async function reportBlogPost(
  postId: string,
  reason: string
): Promise<{ success: boolean; reportsCount?: number; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'You must be signed in to report a post.' };
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: 'Please provide a valid reason (min 5 characters).',
    };
  }

  const userId = session.user.id;

  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return { success: false, error: 'Post not found.' };
    }

    return await prisma.$transaction(async (tx) => {
      // Check if user has already reported this post
      const existingReport = await tx.blogReport.findFirst({
        where: {
          userId,
          blogPostId: postId,
        },
      });

      if (existingReport) {
        return {
          success: false,
          error: 'You have already reported this post.',
        };
      }

      // Create new report
      await tx.blogReport.create({
        data: {
          userId,
          blogPostId: postId,
          reason,
        },
      });

      // Count all reports
      const reportsCount = await tx.blogReport.count({
        where: { blogPostId: postId },
      });

      // Update post count
      await tx.blogPost.update({
        where: { id: postId },
        data: {
          reportsCount,
        },
      });

      return {
        success: true,
        reportsCount,
      };
    });
  } catch (error) {
    console.error('[reportBlogPost] Error:', error);
    return { success: false, error: 'Failed to report post.' };
  }
}
