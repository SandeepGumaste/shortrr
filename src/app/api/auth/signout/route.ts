import { auth, signOut } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  await signOut({ redirectTo: '/' });
  return NextResponse.json({ success: true });
}

export async function GET() {
  await signOut({ redirectTo: '/' });
  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL!));
}
