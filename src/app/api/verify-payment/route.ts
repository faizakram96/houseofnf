import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature are required.',
        },
        { status: 400 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Signature mismatch. Payment verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment signature verified successfully.',
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Razorpay verify-payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
