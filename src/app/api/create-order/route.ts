import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount) || 499900; // Amount in paise (minimum 100 paise)
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    if (amount < 100) {
      return NextResponse.json(
        { success: false, error: 'Amount must be at least 100 paise (₹1).' },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt,
      notes: body.notes || {},
    });

    const key_id =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_TRx1C45SujawMV';

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order.' },
      { status: 500 }
    );
  }
}
