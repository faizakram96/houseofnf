import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAccountDocument extends Document {
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  role: 'admin' | 'staff' | 'customer';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAccountSchema = new Schema<IUserAccountDocument>(
  {
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'DELETED'],
      default: 'ACTIVE',
      index: true,
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
      index: true,
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.UserAccount ||
  mongoose.model<IUserAccountDocument>('UserAccount', UserAccountSchema);
