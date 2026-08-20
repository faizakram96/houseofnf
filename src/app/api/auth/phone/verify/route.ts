import { NextRequest, NextResponse } from 'next/server';
import { verifyPhoneOtp } from '@/services/authService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const result = await verifyPhoneOtp(phone, otp);

    const response = NextResponse.json(result);

    // Set secure HTTPOnly Auth Cookie
    response.cookies.set('hnf_session_user_id', result.userAccount.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 Days
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'OTP verification failed' }, { status: 400 });
  }
}
