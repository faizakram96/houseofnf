import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { updateOrderPaymentDetails, getOrderById } from '@/services/dbService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      paymentMethod,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification tokens.' },
        { status: 400 }
      );
    }

    // 1. Perform Server-Side HMAC SHA256 Signature Verification
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Mark as Failed if signature does not match secret
      if (dbOrderId) {
        await updateOrderPaymentDetails(dbOrderId, {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          status: 'Failed',
          errorDescription: 'Invalid Razorpay HMAC signature.',
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed. Invalid signature token.',
        },
        { status: 400 }
      );
    }

    // 2. Signature Verified Successfully -> Mark Order Paid & Confirmed in Database
    const updatedOrder = await updateOrderPaymentDetails(dbOrderId, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      method: paymentMethod || 'upi',
      status: 'Paid',
      paidAt: new Date().toISOString(),
      orderStatus: 'Confirmed',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Razorpay verification exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
