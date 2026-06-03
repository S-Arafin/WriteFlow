import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { BlogCreateForm } from '@/components/blog/create-form';
import { authOptions } from '@/lib/auth';

export const metadata = {
  title: 'Create Blog Post — WriteFlow AI',
  description: 'Compose and publish a new blog post on WriteFlow Insights.',
};

export default async function CreateBlogPostPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/blog/create');
  }

  return (
    <div className="bg-background text-foreground min-h-screen py-16 transition-colors duration-300">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            Compose New Article
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Publish your insights, workflows, or product strategy to the
            WriteFlow blog.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm backdrop-blur-md sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/40">
          <BlogCreateForm />
        </div>
      </div>
    </div>
  );
}
