import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear HTTPOnly Session Cookie
  response.cookies.set('hnf_session_user_id', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
