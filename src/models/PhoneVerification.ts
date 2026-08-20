import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoneVerificationDocument extends Document {
  phoneNumber: string;
  otpHash: string;
  purpose: 'LOGIN' | 'LINK_ACCOUNT' | 'UPDATE_PHONE';
  attemptCount: number;
  maxAttempts: number;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const PhoneVerificationSchema = new Schema<IPhoneVerificationDocument>(
  {
    phoneNumber: { type: String, required: true, index: true, trim: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ['LOGIN', 'LINK_ACCOUNT', 'UPDATE_PHONE'], default: 'LOGIN' },
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    isVerified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, expires: 0 }, // MongoDB TTL Index: Auto-purges expired OTPs
  },
  { timestamps: true }
);

PhoneVerificationSchema.index({ phoneNumber: 1, isVerified: 1, expiresAt: 1 });

export default mongoose.models.PhoneVerification ||
  mongoose.model<IPhoneVerificationDocument>('PhoneVerification', PhoneVerificationSchema);
