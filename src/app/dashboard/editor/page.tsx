import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface EditorPageProps {
  searchParams: Promise<{ templateId?: string }>;
}

export default async function NewEditorPage({ searchParams }: EditorPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Verify the user exists (handles reseeded databases gracefully)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    redirect('/login');
  }

  const resolvedParams = await searchParams;
  const templateId = resolvedParams.templateId;

  let title = 'Untitled Document';
  let content = 'Start typing your masterwork...';
  let matchedTemplateId: string | null = null;

  if (templateId) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });
    if (template) {
      title = `${template.title} Draft`;
      content =
        template.sampleOutput ||
        `Drafting from template: ${template.title}\n\n`;
      matchedTemplateId = template.id;

      // Increment usage count of template
      await prisma.template.update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  // Create the new document inside Neon DB
  const document = await prisma.document.create({
    data: {
      title,
      content,
      wordCount: content.trim().split(/\s+/).filter(Boolean).length,
      authorId: session.user.id,
      templateId: matchedTemplateId,
      status: 'DRAFT',
    },
  });

  // Redirect to the newly created document editor
  redirect(`/dashboard/editor/${document.id}`);
}
