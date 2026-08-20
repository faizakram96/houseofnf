import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import UserAccountModel from '@/models/UserAccount';
import AuthIdentityModel from '@/models/AuthIdentity';
import UserProfileModel from '@/models/UserProfile';
import PhoneVerificationModel from '@/models/PhoneVerification';
import UserAddressModel from '@/models/UserAddress';

const AUTH_SECRET = process.env.AUTH_SECRET || 'house_of_nf_super_secret_jwt_key_2026';

// Memory Fallback Store when MongoDB is not connected
const memVerifications: Array<{
  phoneNumber: string;
  otpHash: string;
  attemptCount: number;
  maxAttempts: number;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
}> = [];

const memAccounts: Array<{
  id: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  role: 'admin' | 'staff' | 'customer';
  lastLoginAt?: Date;
  createdAt: Date;
}> = [];

const memIdentities: Array<{
  id: string;
  userId: string;
  provider: 'PHONE' | 'GOOGLE' | 'APPLE';
  providerUserId: string;
  identifierEmail?: string;
  identifierPhone?: string;
  isVerified: boolean;
}> = [];

const memProfiles: Array<{
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}> = [];

// Helper to hash OTP securely using HMAC-SHA256
function hashOtp(phone: string, otp: string): string {
  return crypto.createHmac('sha256', AUTH_SECRET).update(`${phone}:${otp}`).digest('hex');
}

// Normalize phone format to E.164 (e.g. +919664209989)
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

/**
 * 1. SEND OTP ENGINE
 */
export async function sendPhoneOtp(rawPhone: string) {
  const phone = normalizePhone(rawPhone);

  const conn = await connectToDatabase();
  const isDbConnected = conn && mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const recentOtp = await PhoneVerificationModel.findOne({
        phoneNumber: phone,
        isVerified: false,
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
      });

      if (recentOtp) {
        throw new Error('Please wait 60 seconds before requesting a new OTP.');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = hashOtp(phone, otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await PhoneVerificationModel.create({
        phoneNumber: phone,
        otpHash,
        purpose: 'LOGIN',
        expiresAt,
      });

      return {
        success: true,
        message: `OTP sent to ${phone}`,
        expiresAt: expiresAt.toISOString(),
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      };
    } catch (err: any) {
      console.warn('DB OTP Send Warning, falling back to memory:', err.message);
    }
  }

  // Memory Fallback Strategy
  const recent = memVerifications.find(
    (v) => v.phoneNumber === phone && !v.isVerified && v.createdAt.getTime() >= Date.now() - 60 * 1000
  );
  if (recent) {
    throw new Error('Please wait 60 seconds before requesting a new OTP.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = hashOtp(phone, otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  memVerifications.push({
    phoneNumber: phone,
    otpHash,
    attemptCount: 0,
    maxAttempts: 3,
    isVerified: false,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    success: true,
    message: `OTP sent to ${phone}`,
    expiresAt: expiresAt.toISOString(),
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  };
}

/**
 * 2. VERIFY OTP & ACCOUNT RESOLUTION
 */
export async function verifyPhoneOtp(rawPhone: string, inputOtp: string) {
  const phone = normalizePhone(rawPhone);
  const conn = await connectToDatabase();
  const isDbConnected = conn && mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const record = await PhoneVerificationModel.findOne({
        phoneNumber: phone,
        isVerified: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!record) {
        throw new Error('Invalid or expired OTP. Please request a new code.');
      }

      if (record.attemptCount >= record.maxAttempts) {
        throw new Error('Maximum OTP verification attempts exceeded. Request a new OTP.');
      }

      const computedHash = hashOtp(phone, inputOtp);
      if (computedHash !== record.otpHash) {
        record.attemptCount += 1;
        await record.save();
        throw new Error(`Incorrect OTP. ${record.maxAttempts - record.attemptCount} attempts remaining.`);
      }

      record.isVerified = true;
      await record.save();

      let identity = await AuthIdentityModel.findOne({
        provider: 'PHONE',
        providerUserId: phone,
      });

      let userAccount: any = null;

      if (identity) {
        userAccount = await UserAccountModel.findById(identity.userId);
      } else {
        let existingProfile = await UserProfileModel.findOne({ phone });

        if (existingProfile) {
          userAccount = await UserAccountModel.findById(existingProfile.userId);
        } else {
          userAccount = await UserAccountModel.create({
            status: 'ACTIVE',
            isPhoneVerified: true,
            role: 'customer',
            lastLoginAt: new Date(),
          });

          await UserProfileModel.create({
            userId: userAccount._id,
            phone,
          });
        }

        identity = await AuthIdentityModel.create({
          userId: userAccount._id,
          provider: 'PHONE',
          providerUserId: phone,
          identifierPhone: phone,
          isVerified: true,
        });
      }

      if (userAccount) {
        userAccount.isPhoneVerified = true;
        userAccount.lastLoginAt = new Date();
        await userAccount.save();
      }

      const profile = await UserProfileModel.findOne({ userId: userAccount._id });
      const allIdentities = await AuthIdentityModel.find({ userId: userAccount._id });

      return {
        success: true,
        userAccount: {
          id: userAccount._id.toString(),
          status: userAccount.status,
          isPhoneVerified: userAccount.isPhoneVerified,
          isEmailVerified: userAccount.isEmailVerified,
          role: userAccount.role,
          lastLoginAt: userAccount.lastLoginAt?.toISOString(),
        },
        userProfile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone,
              avatarUrl: profile.avatarUrl,
            }
          : null,
        linkedIdentities: allIdentities.map((idDoc) => ({
          provider: idDoc.provider,
          providerUserId: idDoc.providerUserId,
          identifierEmail: idDoc.identifierEmail,
          identifierPhone: idDoc.identifierPhone,
        })),
      };
    } catch (err: any) {
      if (!err.message.includes('Mongoose') && !err.message.includes('buffering')) {
        throw err;
      }
      console.warn('DB OTP Verify Warning, falling back to memory:', err.message);
    }
  }

  // Memory Fallback OTP Verify
  const memRecord = memVerifications
    .filter((v) => v.phoneNumber === phone && !v.isVerified && v.expiresAt.getTime() > Date.now())
    .pop();

  if (!memRecord) {
    throw new Error('Invalid or expired OTP. Please request a new code.');
  }

  if (memRecord.attemptCount >= memRecord.maxAttempts) {
    throw new Error('Maximum OTP verification attempts exceeded. Request a new OTP.');
  }

  const computedHash = hashOtp(phone, inputOtp);
  if (computedHash !== memRecord.otpHash) {
    memRecord.attemptCount += 1;
    throw new Error(`Incorrect OTP. ${memRecord.maxAttempts - memRecord.attemptCount} attempts remaining.`);
  }

  memRecord.isVerified = true;

  let memIdentity = memIdentities.find((i) => i.provider === 'PHONE' && i.providerUserId === phone);
  let memAccount: any = null;

  if (memIdentity) {
    memAccount = memAccounts.find((a) => a.id === memIdentity.userId);
  } else {
    let existingProf = memProfiles.find((p) => p.phone === phone);
    if (existingProf) {
      memAccount = memAccounts.find((a) => a.id === existingProf.userId);
    } else {
      memAccount = {
        id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        status: 'ACTIVE' as const,
        isPhoneVerified: true,
        isEmailVerified: false,
        role: 'customer' as const,
        lastLoginAt: new Date(),
        createdAt: new Date(),
      };
      memAccounts.push(memAccount);

      memProfiles.push({
        userId: memAccount.id,
        phone,
      });
    }

    memIdentity = {
      id: `auth_${Date.now()}`,
      userId: memAccount.id,
      provider: 'PHONE',
      providerUserId: phone,
      identifierPhone: phone,
      isVerified: true,
    };
    memIdentities.push(memIdentity);
  }

  if (memAccount) {
    memAccount.isPhoneVerified = true;
    memAccount.lastLoginAt = new Date();
  }

  const profile = memProfiles.find((p) => p.userId === memAccount.id);
  const userIds = memIdentities.filter((i) => i.userId === memAccount.id);

  return {
    success: true,
    userAccount: {
      id: memAccount.id,
      status: memAccount.status,
      isPhoneVerified: memAccount.isPhoneVerified,
      isEmailVerified: memAccount.isEmailVerified,
      role: memAccount.role,
      lastLoginAt: memAccount.lastLoginAt?.toISOString(),
    },
    userProfile: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        }
      : null,
    linkedIdentities: userIds.map((idDoc) => ({
      provider: idDoc.provider,
      providerUserId: idDoc.providerUserId,
      identifierEmail: idDoc.identifierEmail,
      identifierPhone: idDoc.identifierPhone,
    })),
  };
}

/**
 * 3. GOOGLE OAUTH & ACCOUNT LINKING ENGINE
 */
export async function verifyOrLinkGoogleAuth(googlePayload: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified: boolean;
}) {
  const { sub, email, name, picture, emailVerified } = googlePayload;
  const normalizedEmail = email.toLowerCase().trim();

  const conn = await connectToDatabase();
  const isDbConnected = conn && mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let googleIdentity = await AuthIdentityModel.findOne({
        provider: 'GOOGLE',
        providerUserId: sub,
      });

      let userAccount: any = null;

      if (googleIdentity) {
        userAccount = await UserAccountModel.findById(googleIdentity.userId);
      } else {
        let existingProfile = await UserProfileModel.findOne({ email: normalizedEmail });
        let existingEmailIdentity = await AuthIdentityModel.findOne({ identifierEmail: normalizedEmail });

        const targetUserId = existingProfile?.userId || existingEmailIdentity?.userId;

        if (targetUserId) {
          userAccount = await UserAccountModel.findById(targetUserId);
        } else {
          userAccount = await UserAccountModel.create({
            status: 'ACTIVE',
            isEmailVerified: emailVerified,
            role: 'customer',
            lastLoginAt: new Date(),
          });

          const nameParts = (name || '').split(' ');
          await UserProfileModel.create({
            userId: userAccount._id,
            firstName: nameParts[0] || 'Customer',
            lastName: nameParts.slice(1).join(' ') || '',
            email: normalizedEmail,
            avatarUrl: picture || '',
          });
        }

        googleIdentity = await AuthIdentityModel.create({
          userId: userAccount._id,
          provider: 'GOOGLE',
          providerUserId: sub,
          identifierEmail: normalizedEmail,
          isVerified: emailVerified,
        });
      }

      if (userAccount) {
        userAccount.isEmailVerified = userAccount.isEmailVerified || emailVerified;
        userAccount.lastLoginAt = new Date();
        await userAccount.save();
      }

      const profile = await UserProfileModel.findOne({ userId: userAccount._id });
      const allIdentities = await AuthIdentityModel.find({ userId: userAccount._id });

      return {
        success: true,
        userAccount: {
          id: userAccount._id.toString(),
          status: userAccount.status,
          isPhoneVerified: userAccount.isPhoneVerified,
          isEmailVerified: userAccount.isEmailVerified,
          role: userAccount.role,
          lastLoginAt: userAccount.lastLoginAt?.toISOString(),
        },
        userProfile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone,
              avatarUrl: profile.avatarUrl,
            }
          : null,
        linkedIdentities: allIdentities.map((idDoc) => ({
          provider: idDoc.provider,
          providerUserId: idDoc.providerUserId,
          identifierEmail: idDoc.identifierEmail,
          identifierPhone: idDoc.identifierPhone,
        })),
      };
    } catch (err: any) {
      console.warn('DB Google Auth Warning, falling back to memory:', err.message);
    }
  }

  // Memory Fallback Google Auth
  let memIdentity = memIdentities.find((i) => i.provider === 'GOOGLE' && i.providerUserId === sub);
  let memAccount: any = null;

  if (memIdentity) {
    memAccount = memAccounts.find((a) => a.id === memIdentity.userId);
  } else {
    let existingProf = memProfiles.find((p) => p.email === normalizedEmail);
    let existingId = memIdentities.find((i) => i.identifierEmail === normalizedEmail);
    const targetUserId = existingProf?.userId || existingId?.userId;

    if (targetUserId) {
      memAccount = memAccounts.find((a) => a.id === targetUserId);
    } else {
      memAccount = {
        id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        status: 'ACTIVE' as const,
        isPhoneVerified: false,
        isEmailVerified: emailVerified,
        role: 'customer' as const,
        lastLoginAt: new Date(),
        createdAt: new Date(),
      };
      memAccounts.push(memAccount);

      const nameParts = (name || '').split(' ');
      memProfiles.push({
        userId: memAccount.id,
        firstName: nameParts[0] || 'Customer',
        lastName: nameParts.slice(1).join(' ') || '',
        email: normalizedEmail,
        avatarUrl: picture || '',
      });
    }

    memIdentity = {
      id: `auth_${Date.now()}`,
      userId: memAccount.id,
      provider: 'GOOGLE',
      providerUserId: sub,
      identifierEmail: normalizedEmail,
      isVerified: emailVerified,
    };
    memIdentities.push(memIdentity);
  }

  if (memAccount) {
    memAccount.isEmailVerified = memAccount.isEmailVerified || emailVerified;
    memAccount.lastLoginAt = new Date();
  }

  const profile = memProfiles.find((p) => p.userId === memAccount.id);
  const userIds = memIdentities.filter((i) => i.userId === memAccount.id);

  return {
    success: true,
    userAccount: {
      id: memAccount.id,
      status: memAccount.status,
      isPhoneVerified: memAccount.isPhoneVerified,
      isEmailVerified: memAccount.isEmailVerified,
      role: memAccount.role,
      lastLoginAt: memAccount.lastLoginAt?.toISOString(),
    },
    userProfile: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        }
      : null,
    linkedIdentities: userIds.map((idDoc) => ({
      provider: idDoc.provider,
      providerUserId: idDoc.providerUserId,
      identifierEmail: idDoc.identifierEmail,
      identifierPhone: idDoc.identifierPhone,
    })),
  };
}

/**
 * 4. GET FULL CUSTOMER PROFILE & LINKED IDENTITIES
 */
export async function getFullCustomerProfile(userId: string) {
  const conn = await connectToDatabase();
  const isDbConnected = conn && mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const userAccount = await UserAccountModel.findById(userId);
      if (userAccount) {
        const profile = await UserProfileModel.findOne({ userId });
        const identities = await AuthIdentityModel.find({ userId });
        const addresses = await UserAddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

        return {
          account: {
            id: userAccount._id.toString(),
            status: userAccount.status,
            isPhoneVerified: userAccount.isPhoneVerified,
            isEmailVerified: userAccount.isEmailVerified,
            role: userAccount.role,
            lastLoginAt: userAccount.lastLoginAt?.toISOString(),
            createdAt: userAccount.createdAt?.toISOString(),
          },
          profile: profile
            ? {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                phone: profile.phone,
                avatarUrl: profile.avatarUrl,
                gender: profile.gender,
                dateOfBirth: profile.dateOfBirth?.toISOString(),
              }
            : null,
          linkedIdentities: identities.map((idDoc) => ({
            provider: idDoc.provider,
            providerUserId: idDoc.providerUserId,
            identifierEmail: idDoc.identifierEmail,
            identifierPhone: idDoc.identifierPhone,
            isVerified: idDoc.isVerified,
          })),
          addresses: addresses.map((addr) => ({
            id: addr._id.toString(),
            fullName: addr.fullName,
            phoneNumber: addr.phoneNumber,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postalCode: addr.postalCode,
            addressType: addr.addressType,
            isDefault: addr.isDefault,
          })),
        };
      }
    } catch (err: any) {
      console.warn('DB Profile Fetch Warning:', err.message);
    }
  }

  // Memory Fallback Profile Fetch
  const memAccount = memAccounts.find((a) => a.id === userId);
  if (!memAccount) return null;

  const profile = memProfiles.find((p) => p.userId === userId);
  const identities = memIdentities.filter((i) => i.userId === userId);

  return {
    account: {
      id: memAccount.id,
      status: memAccount.status,
      isPhoneVerified: memAccount.isPhoneVerified,
      isEmailVerified: memAccount.isEmailVerified,
      role: memAccount.role,
      lastLoginAt: memAccount.lastLoginAt?.toISOString(),
      createdAt: memAccount.createdAt?.toISOString(),
    },
    profile: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        }
      : null,
    linkedIdentities: identities.map((idDoc) => ({
      provider: idDoc.provider,
      providerUserId: idDoc.providerUserId,
      identifierEmail: idDoc.identifierEmail,
      identifierPhone: idDoc.identifierPhone,
      isVerified: idDoc.isVerified,
    })),
    addresses: [],
  };
}
