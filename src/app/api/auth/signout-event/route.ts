import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/user';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user's last sign out time and set isActive to false
    await User.findOneAndUpdate(
      { email },
      { 
        lastSignOutAt: new Date(),
        isActive: false
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in sign-out event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 