import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfileInDbOrMem } from '@/services/authService';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('hnf_session_user_id')?.value;
    const body = await request.json();
    const userId = body.userId || sessionCookie;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { firstName, lastName, email, phone, gender, dateOfBirth } = body;

    if (!firstName || firstName.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'First Name is required.' }, { status: 400 });
    }

    const updatedData = await updateUserProfileInDbOrMem(userId, {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error updating profile' }, { status: 500 });
  }
}
