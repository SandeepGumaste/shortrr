import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';
import { urlDeletionLimiter } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ shortId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    const { success, limit, reset, remaining } = await urlDeletionLimiter.limit(ip);

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

    const { shortId } = await context.params;
    await connectDB();

    const url = await Url.findOne({ shortId });

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the URL
    if (url.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this URL' },
        { status: 403 }
      );
    }

    await Url.deleteOne({ shortId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 