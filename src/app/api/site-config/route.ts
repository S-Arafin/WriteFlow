import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 'singleton' },
    });
    return NextResponse.json({
      maintenanceMode: config?.maintenanceMode ?? false,
      aiEnabled: config?.aiEnabled ?? true,
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return NextResponse.json({ maintenanceMode: false, aiEnabled: true });
  }
}
