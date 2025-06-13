import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/user';
import { userValidationSchema } from '@/lib/validations';
import { encrypt } from '@/lib/encryption';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    const data = await req.json();
    
    // Validate input data
    const validationResult = userValidationSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    const { email, googleId, name, image, accessToken, refreshToken } = validationResult.data;

    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    // Check if user exists and is blocked
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (error) {
      console.error('Error checking existing user:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
    
    if (existingUser?.isBlocked) {
      console.log('Blocked user attempted login:', { email });
      return NextResponse.json(
        { isBlocked: true },
        { status: 403 }
      );
    }

    // Encrypt sensitive data before storing
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    // Update or create user with encrypted tokens
    const updateData = {
      googleId,
      email,
      name,
      profilePicture: image,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      lastLoginAt: new Date(),
      isActive: true,
      lastUserAgent: userAgent,
      lastLoginIP: ip,
      $inc: { loginAttempts: 1 }
    };
    
    console.log('Attempting to update/create user:', { email });
    const dbUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { upsert: true, new: true }
    );
    
    if (!dbUser) {
      console.error('Failed to create/update user in database');
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    // Add role to user if not present
    if (!dbUser.role) {
      await User.findByIdAndUpdate(dbUser._id, { role: 'user' });
    }

    // Reset login attempts on successful login
    await User.findByIdAndUpdate(dbUser._id, { 
      loginAttempts: 0,
      lastFailedLogin: null
    });

    // Return minimal user data
    return NextResponse.json({
      isBlocked: false,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isActive: dbUser.isActive
      }
    });
  } catch (error) {
    console.error('Error in authentication:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}