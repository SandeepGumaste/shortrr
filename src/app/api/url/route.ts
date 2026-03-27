import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';
import { generateShortId, getShortUrlFromId } from '@/lib/url-utils';
import { urlCreationLimiter } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-utils';
import { headers } from 'next/headers';
import { z } from 'zod';

const createShortUrlSchema = z.object({
  redirectUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .refine((value) => {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }, 'Only HTTP/HTTPS URLs are allowed'),
});

const MAX_SHORT_ID_RETRIES = 5;

const isDuplicateKeyError = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const { success, limit, reset, remaining } = await urlCreationLimiter.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }

    const rawBody: unknown = await req.json();
    const parsedBody = createShortUrlSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    const { redirectUrl } = parsedBody.data;

    await connectDB();

    let createdUrl: { shortId: string } | null = null;
    for (let attempt = 0; attempt < MAX_SHORT_ID_RETRIES; attempt++) {
      const shortId = generateShortId();
      try {
        createdUrl = await Url.create({
          shortId,
          redirectUrl,
          createdBy: session.user.email!,
          visitHistory: []
        });
        break;
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          continue;
        }
        throw error;
      }
    }

    if (!createdUrl) {
      return NextResponse.json(
        { error: 'Failed to generate a unique short URL. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      shortUrl: getShortUrlFromId(createdUrl.shortId),
      shortId: createdUrl.shortId
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
