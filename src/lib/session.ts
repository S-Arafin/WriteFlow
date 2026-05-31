import { getServerSession } from 'next-auth';

import { authOptions } from './auth';
import prisma from './prisma';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getFreshUser() {
  const userSession = await getCurrentUser();
  if (!userSession?.id) return null;
  return await prisma.user.findUnique({
    where: { id: userSession.id },
  });
}
