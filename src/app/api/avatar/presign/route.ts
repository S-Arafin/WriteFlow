import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fallback to our visual mock CDN upload flow:
  const randomId = Math.random().toString(36).substring(7);
  const mockUploadUrl = `${req.nextUrl.origin}/api/avatar/mock-upload`;

  // Array of beautiful premium avatar choices to assign randomly on upload
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
  ];
  const mockPublicUrl = avatars[Math.floor(Math.random() * avatars.length)];

  return NextResponse.json({
    uploadUrl: mockUploadUrl,
    publicUrl: mockPublicUrl,
    fields: {
      key: `avatars/${session.user.id}/${randomId}.png`,
      'Content-Type': 'image/png',
    },
  });
}
