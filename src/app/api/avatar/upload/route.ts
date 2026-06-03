import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!imgbbKey || imgbbKey === 'placeholder') {
      // Fallback in case no key is configured yet: assign a beautiful premium mock choice
      const avatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
      ];
      const mockUrl = avatars[Math.floor(Math.random() * avatars.length)];
      return NextResponse.json({ url: mockUrl });
    }

    // Build the Imgbb Multipart payload
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Imgbb API error]:', errorText);
      return NextResponse.json(
        { error: 'Imgbb upload rejected.' },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: { url: string };
    };

    if (!data.success || !data.data?.url) {
      return NextResponse.json(
        { error: 'Failed to fetch image URL from Imgbb.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error('[Avatar Upload error]:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload.' },
      { status: 500 }
    );
  }
}
