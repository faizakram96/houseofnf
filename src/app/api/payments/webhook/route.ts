import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing Razorpay webhook signature header.' },
        { status: 400 }
      );
    }

    // 1. Verify Webhook HMAC Signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Webhook signature mismatch ignored.');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const contains = payload.payload;

    await connectToDatabase();

    // 2. Idempotent Processing based on Webhook Events
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = contains?.payment?.entity;
      const orderEntity = contains?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const method = paymentEntity?.method || 'upi';

      if (razorpayOrderId) {
        // Find existing order by Razorpay Order ID
        const existingOrder = await OrderModel.findOne({ 'payment.orderId': razorpayOrderId });

        if (existingOrder) {
          // Idempotency check: Only update if not already marked as Paid
          if (existingOrder.payment.status !== 'Paid') {
            existingOrder.payment.status = 'Paid';
            existingOrder.payment.paymentId = paymentId || existingOrder.payment.paymentId;
            existingOrder.payment.method = method;
            existingOrder.payment.paidAt = new Date();
            existingOrder.orderStatus = 'Confirmed';
            await existingOrder.save();
          }
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = contains?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || 'Payment failed at gateway';

      if (razorpayOrderId) {
        const existingOrder = await OrderModel.findOne({ 'payment.orderId': razorpayOrderId });

        if (existingOrder && existingOrder.payment.status !== 'Paid') {
          existingOrder.payment.status = 'Failed';
          existingOrder.payment.errorDescription = errorDesc;
          await existingOrder.save();
        }
      }
    }

    return NextResponse.json({ success: true, received: true, event });
  } catch (error: any) {
    console.error('Razorpay webhook processing exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
