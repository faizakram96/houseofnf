import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import { updateOrderPaymentDetails, getOrderById } from '@/services/dbService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { amount, reason } = body;

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    if (order.payment.status !== 'Paid' && order.payment.status !== 'Initiated') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot issue refund for order with payment status "${order.payment.status}". Only Paid orders can be refunded.`,
        },
        { status: 400 }
      );
    }

    const paymentId = order.payment.paymentId;
    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Order does not have a valid Razorpay Payment ID.' },
        { status: 400 }
      );
    }

    const refundAmount = amount ? Number(amount) : order.pricing.grandTotal;
    const amountInPaise = Math.round(refundAmount * 100);

    // 1. Execute Official Razorpay Refund API Call
    const razorpay = getRazorpayInstance();
    const refundRes: any = await razorpay.payments.refund(paymentId, {
      amount: amountInPaise,
      notes: {
        reason: reason || 'Admin initiated refund',
        orderNumber: order.orderNumber,
      },
    });

    // 2. Update Database Record upon Successful Refund Execution
    await connectToDatabase();
    const updatedOrder = await updateOrderPaymentDetails(id, {
      status: 'Refunded',
      refundStatus: 'Processed',
      refundId: refundRes.id,
      refundAmount: refundAmount,
      orderStatus: 'Cancelled',
    });

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${refundAmount} issued successfully!`,
      refund: refundRes,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Razorpay refund exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process refund.' },
      { status: 500 }
    );
  }
}
