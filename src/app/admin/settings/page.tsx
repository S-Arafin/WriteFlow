import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import React from 'react';

import { SettingsForm } from '@/components/admin/settings-form';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Site Settings - WriteFlow ADMIN',
  description:
    'Adjust global site parameters, maintenance mode, and AI features accessibility.',
};

export default async function ManageSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch singleton config, default to mock values if missing
  let config = await prisma.siteConfig.findUnique({
    where: { id: 'singleton' },
  });

  if (!config) {
    config = {
      id: 'singleton',
      maintenanceMode: false,
      aiEnabled: true,
      updatedAt: new Date(),
    };
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Govern system-wide parameters, toggling site maintenance status and AI
          features.
        </p>
      </div>

      <SettingsForm initialConfig={config} />
    </div>
  );
}
