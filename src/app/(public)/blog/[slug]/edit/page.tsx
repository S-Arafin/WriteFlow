import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { BlogEditForm } from '@/components/blog/edit-form';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Edit Blog Post — WriteFlow AI',
  description:
    'Update and modify your published blog post on WriteFlow Insights.',
};

interface EditBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/blog/${slug}/edit`);
  }

  // Fetch the blog post
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      category: true,
      excerpt: true,
      content: true,
      slug: true,
      authorId: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Authorize permissions: Only the author of the post OR an administrator can edit it
  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';

  if (!isAuthor && !isAdmin) {
    redirect(`/blog/${slug}`);
  }

  return (
    <div className="bg-background text-foreground min-h-screen py-16 transition-colors duration-300">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Edit Article
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Modify and save changes to your published blog post.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/40">
          <BlogEditForm
            postId={post.id}
            initialData={{
              title: post.title,
              category: post.category,
              excerpt: post.excerpt,
              content: post.content,
              slug: post.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}
