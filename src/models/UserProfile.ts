import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
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
    userId: { type: Schema.Types.ObjectId, ref: 'UserAccount', required: true, unique: true, index: true },
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

export default mongoose.models.UserProfile ||
  mongoose.model<IUserProfileDocument>('UserProfile', UserProfileSchema);
