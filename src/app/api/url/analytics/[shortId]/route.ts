import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';

interface Visit {
  timestamp: Date;
  ip: string;
  userAgent: string;
}

export async function GET(
  request: NextRequest,
  context: { params: { shortId: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const shortId = context.params.shortId;
    await connectDB();

    const url = await Url.findOne({ shortId });

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      );
    }

    // Only allow access if the user is the creator
    if (url.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized to view these analytics' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      shortId: url.shortId,
      redirectUrl: url.redirectUrl,
      createdBy: url.createdBy,
      createdAt: url.createdAt,
      visitHistory: url.visitHistory.map((visit: Visit) => ({
        timestamp: visit.timestamp,
        ip: visit.ip,
        userAgent: visit.userAgent
      }))
    });
  } catch (error) {
    console.error('Error fetching URL analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
