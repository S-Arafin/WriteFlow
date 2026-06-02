import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { TemplateCrud } from '@/components/admin/template-crud';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Manage Templates - WriteFlow ADMIN',
  description: 'Manage the core platform templates directory.',
};

export default async function ManageTemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all templates sorted by updated date
  const templates = await prisma.template.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Manage Templates
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure workspace AI instructions, model parameters, and tones.
        </p>
      </div>

      <TemplateCrud initialTemplates={templates} />
    </div>
  );
}
