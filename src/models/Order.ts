import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDocument extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    pincode?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
  }>;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    grandTotal: number;
  };
  payment: {
    method: 'WhatsApp' | 'Instagram' | 'COD' | 'Online';
    status: 'Pending' | 'Initiated' | 'Paid' | 'Failed' | 'Refunded';
    transactionId?: string;
  };
  orderStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Ready to Ship'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
    | 'Returned';
  source: 'Website' | 'WhatsApp' | 'Instagram' | 'Admin';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true, index: true },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    items: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, default: 'Default' },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        image: { type: String },
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['WhatsApp', 'Instagram', 'COD', 'Online'],
        default: 'WhatsApp',
      },
      status: {
        type: String,
        enum: ['Pending', 'Initiated', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
      },
      transactionId: { type: String },
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Ready to Ship',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Pending',
      index: true,
    },
    source: {
      type: String,
      enum: ['Website', 'WhatsApp', 'Instagram', 'Admin'],
      default: 'Website',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema);
