import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check and store unique subscriber in database
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!existing) {
      await prisma.newsletterSubscriber.create({
        data: { email },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Newsletter Subscription Error]:', error);
    return NextResponse.json(
      { error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
