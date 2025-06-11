import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    await connectDB();
    const { shortId } = await params;
    
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || request.headers.get('user-agent') || 'unknown';

    const url = await Url.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: new Date(),
            ip,
            userAgent
          }
        }
      },
      { new: true }
    );

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    return NextResponse.redirect(url.redirectUrl);
  } catch (error) {
    console.error('Error redirecting URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
