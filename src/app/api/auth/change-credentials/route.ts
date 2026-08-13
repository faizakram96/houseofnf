import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { verifyPassword, hashPassword, generateAdminToken, verifyAdminSession, sanitizeInput } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // 1. Verify Active Admin Session
    const session = verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newEmail, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required to authorize changes.' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    let user: any = null;

    if (conn) {
      user = await UserModel.findOne({ email: session.email }).lean();
      if (!user) {
        user = await UserModel.findById(session.userId).lean();
      }
    }

    // Default admin user fallback if database is in seed mode
    if (!user) {
      user = {
        _id: 'usr-admin-default',
        name: 'House of NF Admin',
        email: session.email || 'admin@houseofnf.com',
        passwordHash: await hashPassword('admin123'),
        role: 'admin',
      };
    }

    // 2. Verify Current Password using Bcrypt
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, error: 'Current password confirmation failed.' }, { status: 400 });
    }

    // 3. Prepare Updated Credentials
    const updatedFields: any = {};

    if (newEmail && newEmail.trim() !== '') {
      const sanitizedEmail = sanitizeInput(newEmail.toLowerCase());
      // Check if email is taken by another user
      if (conn) {
        const existing = await UserModel.findOne({ email: sanitizedEmail });
        if (existing && existing._id.toString() !== user._id?.toString()) {
          return NextResponse.json({ success: false, error: 'This email ID is already in use.' }, { status: 400 });
        }
      }
      updatedFields.email = sanitizedEmail;
    }

    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: 'New password must be at least 6 characters long.' }, { status: 400 });
      }
      // Hash new password using Bcrypt 12 salt rounds
      updatedFields.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updatedFields).length === 0) {
      return NextResponse.json({ success: false, error: 'No new email or password provided to update.' }, { status: 400 });
    }

    // 4. Save to MongoDB
    if (conn && user._id !== 'usr-admin-default') {
      await UserModel.findByIdAndUpdate(user._id, updatedFields);
    }

    const finalEmail = updatedFields.email || user.email;

    // 5. Generate Fresh Signed JWT Token & Update Cookie
    const newToken = generateAdminToken({
      userId: user._id?.toString() || 'usr-admin-default',
      email: finalEmail,
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin credentials successfully updated!',
      user: {
        email: finalEmail,
        name: user.name,
      },
    });

    response.cookies.set('hnf_admin_jwt', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
