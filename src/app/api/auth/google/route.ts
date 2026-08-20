import { NextRequest, NextResponse } from 'next/server';
import { verifyOrLinkGoogleAuth } from '@/services/authService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sub, email, name, picture, emailVerified } = body;

    if (!sub || !email) {
      return NextResponse.json(
        { success: false, error: 'Valid Google sub ID and verified email address are required.' },
        { status: 400 }
      );
    }

    const result = await verifyOrLinkGoogleAuth({
      sub,
      email,
      name,
      picture,
      emailVerified: typeof emailVerified === 'boolean' ? emailVerified : true,
    });

    const response = NextResponse.json(result);

    response.cookies.set('hnf_session_user_id', result.userAccount.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 Days
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Google Auth failed' }, { status: 400 });
  }
}
