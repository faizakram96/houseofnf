import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAddressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserAddressSchema = new Schema<IUserAddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    postalCode: { type: String, required: true, trim: true },
    addressType: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.UserAddress ||
  mongoose.model<IUserAddressDocument>('UserAddress', UserAddressSchema);
