import { signIn } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await signIn('google', { redirectTo: '/' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google sign in error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google sign in' },
      { status: 500 }
    );
  }
}
