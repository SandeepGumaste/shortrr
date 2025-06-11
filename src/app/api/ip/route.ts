import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  return NextResponse.json({ ip });
}
