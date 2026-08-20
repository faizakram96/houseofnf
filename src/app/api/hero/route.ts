import { NextRequest, NextResponse } from 'next/server';
import { getHeroBanner, updateHeroBanner } from '@/services/dbService';

export async function GET() {
  try {
    const hero = await getHeroBanner();
    return NextResponse.json({ success: true, data: hero });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateHeroBanner(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
