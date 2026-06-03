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
      console.warn(
        '[Avatar Upload]: IMGBB_API_KEY is not set or is set to placeholder.'
      );
      return NextResponse.json(
        {
          error:
            'Imgbb API key is not configured in your .env file. Please set IMGBB_API_KEY.',
        },
        { status: 400 }
      );
    }

    // Convert file to base64 for highly reliable transmission to Imgbb
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Build the Imgbb payload using urlencoded form data as specified in Imgbb API docs
    const uploadFormData = new URLSearchParams();
    uploadFormData.append('image', base64Image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: uploadFormData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Imgbb API error]:', errorText);
      return NextResponse.json(
        { error: 'Imgbb upload rejected. Check API key validity.' },
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
