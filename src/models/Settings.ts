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
    whatsappNumber: { type: String, default: '919664209989' },
    instagramUrl: { type: String, default: 'https://www.instagram.com/houseofnf.in' },
    storeEmail: { type: String, default: 'thehouseofnf@gmail.com' },
    storePhone: { type: String, default: '+91 96642 09989' },
    address: { type: String, default: 'Luxury Boutique Street, New Delhi, India' },
    freeShippingThreshold: { type: Number, default: 2999 },
    currencySymbol: { type: String, default: '₹' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettingsDocument>('Settings', SettingsSchema);
