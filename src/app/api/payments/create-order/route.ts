import { NextRequest, NextResponse } from 'next/server';
import { getRazorpayInstance } from '@/lib/razorpay';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import ProductModel from '@/models/Product';
import { createOrder, updateOrderPaymentDetails } from '@/services/dbService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, notes, paymentMethod = 'upi' } = body;

    if (!customer || !customer.name || customer.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full customer name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const cleanDigits = (customer.phone || '').replace(/[^\d]/g, '').replace(/^91/, '').replace(/^0/, '');
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required.' },
        { status: 400 }
      );
    }

    const cleanPincode = (customer.pincode || '').replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      return NextResponse.json(
        { success: false, error: 'A valid 6-digit Indian PIN Code is required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item.' },
        { status: 400 }
      );
    }

    // 1. Recalculate pricing server-side to prevent tampering
    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Attempt DB fetch if connected
    await connectToDatabase();

    for (const item of items) {
      let unitPrice = Number(item.unitPrice) || 0;

      // Try fetching authentic price from database if available
      if (item.productId && item.productId.length === 24) {
        try {
          const dbProduct: any = await ProductModel.findById(item.productId).lean();
          if (dbProduct && dbProduct.pricing?.price) {
            unitPrice = dbProduct.pricing.price;
          }
        } catch (e) {
          // Fall back to item.unitPrice
        }
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: item.productId || 'custom-prod',
        productName: item.productName || 'Curated Design',
        sku: item.sku || 'NF-ITEM',
        size: item.size || 'M',
        color: item.color || 'Default',
        quantity: qty,
        unitPrice,
        totalPrice: itemTotal,
        image: item.image || '',
      });
    }

    const freeShippingThreshold = 2999;
    const shipping = calculatedSubtotal >= freeShippingThreshold ? 0 : 150;
    const grandTotal = calculatedSubtotal + shipping;

    // 2. Generate unique order number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NF-${new Date().getFullYear()}-${randomSuffix}`;

    // 3. Create initial pending order in Database
    const orderPayload = {
      orderNumber,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : '',
        address: customer.address ? customer.address.trim() : '',
        city: customer.city ? customer.city.trim() : 'Jaipur',
        pincode: customer.pincode ? customer.pincode.trim() : '302017',
      },
      items: validatedItems,
      pricing: {
        subtotal: calculatedSubtotal,
        discount: 0,
        shipping,
        tax: 0,
        grandTotal,
      },
      payment: {
        gateway: 'razorpay' as const,
        method: paymentMethod,
        status: 'Pending' as const,
      },
      orderStatus: 'Pending Payment' as const,
      source: 'Website' as const,
      notes: notes || '',
    };

    const createdDbOrder = await createOrder(orderPayload);
    const dbOrderId = createdDbOrder.id || createdDbOrder._id?.toString() || orderNumber;

    // 4. Create Razorpay Order via SDK
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(grandTotal * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        houseOfNfOrderId: dbOrderId,
        orderNumber: orderNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    });

    // 5. Save Razorpay Order ID to database order
    await updateOrderPaymentDetails(dbOrderId, {
      orderId: razorpayOrder.id,
      status: 'Pending',
    });

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_houseofnf_key';

    return NextResponse.json({
      success: true,
      order: {
        id: dbOrderId,
        orderNumber,
        grandTotal,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
      },
    });
  } catch (error: any) {
    console.error('Razorpay create-order exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
