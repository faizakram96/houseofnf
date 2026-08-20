import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthIdentityDocument extends Document {
  userId: any;
  provider: 'PHONE' | 'GOOGLE' | 'APPLE';
  providerUserId: string;
  identifierEmail?: string;
  identifierPhone?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthIdentitySchema = new Schema<IAuthIdentityDocument>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'UserAccount', required: true, index: true },
    provider: { type: String, enum: ['PHONE', 'GOOGLE', 'APPLE'], required: true },
    providerUserId: { type: String, required: true },
    identifierEmail: { type: String, sparse: true, index: true, lowercase: true, trim: true },
    identifierPhone: { type: String, sparse: true, index: true, trim: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound Unique Index: Prevents duplicate providerUserIds per auth provider
AuthIdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AuthIdentity) {
  delete (mongoose.models as any).AuthIdentity;
}

export default mongoose.models.AuthIdentity ||
  mongoose.model<IAuthIdentityDocument>('AuthIdentity', AuthIdentitySchema);
