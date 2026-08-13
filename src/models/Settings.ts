import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsDocument extends Document {
  whatsappNumber: string;
  instagramUrl: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  freeShippingThreshold: number;
  currencySymbol: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    whatsappNumber: { type: String, default: '919876543210' },
    instagramUrl: { type: String, default: 'https://www.instagram.com/houseofnf.in' },
    storeEmail: { type: String, default: 'contact@houseofnf.com' },
    storePhone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Luxury Boutique Street, New Delhi, India' },
    freeShippingThreshold: { type: Number, default: 2999 },
    currencySymbol: { type: String, default: '₹' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema);
