import { NextRequest, NextResponse } from 'next/server';
import { getFullCustomerProfile } from '@/services/authService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('hnf_session_user_id')?.value;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || sessionCookie;

    if (!userId) {
      return NextResponse.json({ success: false, authenticated: false, message: 'No active session' });
    }

    const data = await getFullCustomerProfile(userId);
    if (!data) {
      return NextResponse.json({ success: false, authenticated: false, message: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, authenticated: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
