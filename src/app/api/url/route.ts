import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';
import { generateShortId, getShortUrlFromId } from '@/lib/url-utils';
import { urlCreationLimiter } from '@/lib/rate-limit';
import { headers } from 'next/headers';

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
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
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

    const { redirectUrl } = await req.json();

    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'Please provide a redirect URL' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const shortId = generateShortId();
    await Url.create({
      shortId,
      redirectUrl,
      createdBy: session.user.email!,
      visitHistory: []
    });

    return NextResponse.json({
      shortUrl: getShortUrlFromId(shortId),
      shortId
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
