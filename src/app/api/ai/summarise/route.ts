import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { openai } from '@/lib/ai/openai';
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const resultText = completion.choices[0]?.message?.content || '{}';
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);
  } catch (error) {
    console.error('Error generating review summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
