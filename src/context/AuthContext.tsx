'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAccount, UserProfileType, AuthIdentity } from '@/types';
import { initRecaptcha, sendFirebasePhoneOtp, signInWithGoogleRealPopup, isFirebaseConfigured } from '@/lib/firebase';
import { ConfirmationResult } from 'firebase/auth';

interface AuthContextType {
  userAccount: UserAccount | null;
  userProfile: UserProfileType | null;
  linkedIdentities: AuthIdentity[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (payload?: { sub: string; email: string; name?: string; picture?: string }) => Promise<boolean>;
  updateProfile: (updates: { firstName: string; lastName?: string; email?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  pendingPhone: string;
  setPendingPhone: (phone: string) => void;
  pendingDevOtp: string;
  setPendingDevOtp: (otp: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl') || '';

  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [linkedIdentities, setLinkedIdentities] = useState<AuthIdentity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Temporary Flow State
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingDevOtp, setPendingDevOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      if (json.success && json.authenticated && json.data) {
        setUserAccount(json.data.account);
        setUserProfile(json.data.profile);
        setLinkedIdentities(json.data.linkedIdentities || []);
      } else {
        setUserAccount(null);
        setUserProfile(null);
        setLinkedIdentities([]);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const sendOtp = async (phone: string) => {
    setPendingPhone(phone);

    // 1. Try Firebase Real SMS (10,000 Free SMS/Month) if configured
    if (isFirebaseConfigured) {
      try {
        const verifier = initRecaptcha('recaptcha-container');
        const confirmResult = await sendFirebasePhoneOtp(phone, verifier);
        if (confirmResult) {
          setConfirmationResult(confirmResult);
          return {
            success: true,
            message: `Real SMS OTP dispatched by Google Firebase to +91${phone.replace(/\D/g, '').slice(-10)}`,
          };
        }
      } catch (firebaseErr: any) {
        console.warn('Firebase SMS Error, falling back to backend OTP engine:', firebaseErr.message);
      }
    }

    // 2. Backend OTP Engine Dispatch
    const res = await fetch('/api/auth/phone/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send OTP');

    if (json.devOtp) setPendingDevOtp(json.devOtp);
    return json;
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    // 1. Verify via Firebase Confirmation Result if active
    if (confirmationResult) {
      try {
        const userCredential = await confirmationResult.confirm(otp);
        const fbUser = userCredential.user;

        // Sync verified Firebase user with backend MongoDB
        const res = await fetch('/api/auth/phone/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp: 'FIREBASE_VERIFIED', firebaseUid: fbUser.uid }),
        });
        const json = await res.json();
        if (json.success) {
          setUserAccount(json.userAccount);
          setUserProfile(json.userProfile);
          setLinkedIdentities(json.linkedIdentities || []);

          if (!json.userProfile || !json.userProfile.firstName) {
            router.push('/login/complete-profile');
          } else {
            router.push(redirectParam || '/');
          }
          return true;
        }
      } catch (fbVerifyErr: any) {
        console.warn('Firebase confirm code error, trying backend OTP verify:', fbVerifyErr.message);
      }
    }

    // 2. Standard Backend Verify Engine
    const res = await fetch('/api/auth/phone/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'OTP Verification Failed');

    setUserAccount(json.userAccount);
    setUserProfile(json.userProfile);
    setLinkedIdentities(json.linkedIdentities || []);

    if (!json.userProfile || !json.userProfile.firstName) {
      router.push('/login/complete-profile');
    } else {
      router.push(redirectParam || '/');
    }
    return true;
  };

  const loginWithGoogle = async (payload?: { sub: string; email: string; name?: string; picture?: string }): Promise<boolean> => {
    let authPayload = payload;

    // Try real Google OAuth popup if Firebase is configured
    if (!authPayload && isFirebaseConfigured) {
      const googleRealUser = await signInWithGoogleRealPopup();
      if (googleRealUser) {
        authPayload = googleRealUser;
      }
    }

    if (!authPayload) {
      authPayload = {
        sub: `google_${Date.now()}_demo`,
        email: `customer_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`,
        name: 'Curated Customer',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      };
    }

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...authPayload,
        emailVerified: true,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Google Login Failed');

    setUserAccount(json.userAccount);
    setUserProfile(json.userProfile);
    setLinkedIdentities(json.linkedIdentities || []);

    router.push(redirectParam || '/');
    return true;
  };

  const updateProfile = async (updates: { firstName: string; lastName?: string; email?: string }): Promise<boolean> => {
    if (!userAccount) return false;

    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userAccount.id, ...updates }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update profile');

    setUserProfile(json.data);

    const destination = redirectParam || '/';
    router.push(destination);
    return true;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUserAccount(null);
    setUserProfile(null);
    setLinkedIdentities([]);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        userAccount,
        userProfile,
        linkedIdentities,
        isAuthenticated: !!userAccount,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        updateProfile,
        logout,
        pendingPhone,
        setPendingPhone,
        pendingDevOtp,
        setPendingDevOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
