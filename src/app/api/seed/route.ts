import { NextResponse } from 'next/server';
import { seedDatabase } from '@/services/dbService';

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
