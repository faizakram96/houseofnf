import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfileDocument extends Document {
  userId: any;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'UserAccount', required: true, unique: true, index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, sparse: true, index: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, index: true, trim: true },
    avatarUrl: { type: String, default: '' },
    gender: { type: String, default: '' },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.UserProfile) {
  delete (mongoose.models as any).UserProfile;
}

export default mongoose.models.UserProfile ||
  mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);
