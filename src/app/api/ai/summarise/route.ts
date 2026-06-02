import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { gemini } from '@/lib/ai/gemini';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get('templateId');

  if (!templateId) {
    return NextResponse.json(
      { error: 'Missing templateId parameter' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch approved reviews for the template
    const reviews = await prisma.review.findMany({
      where: {
        templateId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
        body: true,
      },
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        summary:
          '• No approved reviews available to summarize yet.\n• Encourage your users to leave feedback on the explore page.\n• Ratings and metrics will update as reviews are approved.',
        sentiment: 'NEUTRAL',
      });
    }

    // 2. Prepare text for OpenAI
    const reviewsText = reviews
      .map(
        (r, i) =>
          `[Review ${i + 1}] Rating: ${r.rating}/5. Content: "${r.body || 'No text content'}"`
      )
      .join('\n');

    const prompt = `You are a sentiment analyst. Below are reviews left by users for an AI copywriting template.
Analyze the sentiment of these reviews and provide a clean 3-bullet summary of the general user feedback (what they liked, what could be improved).
Each bullet point MUST start with a bullet character "• " and end with a newline.
Also output the general sentiment as either POSITIVE, MIXED, or NEGATIVE.

Reviews:
${reviewsText}

Return your response as a JSON object in this exact format:
{
  "summary": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
  "sentiment": "POSITIVE"
}`;

    const completion = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = completion.text || '{}';
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    const err = error as {
      status?: string;
      statusCode?: number;
      code?: number;
      message?: string;
    };
    console.error('Error generating review summary:', error);
    const status = typeof err.code === 'number' ? err.code : 500;
    const message = err.message || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
