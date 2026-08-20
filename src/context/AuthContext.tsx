'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAccount, UserProfileType, AuthIdentity } from '@/types';

interface AuthContextType {
  userAccount: UserAccount | null;
  userProfile: UserProfileType | null;
  linkedIdentities: AuthIdentity[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (payload: { sub: string; email: string; name?: string; picture?: string }) => Promise<boolean>;
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
    const res = await fetch('/api/auth/phone/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send OTP');

    setPendingPhone(phone);
    if (json.devOtp) setPendingDevOtp(json.devOtp);
    return json;
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
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

    // Check if new user profile needs completion
    if (!json.userProfile || !json.userProfile.firstName) {
      router.push('/login/complete-profile');
    } else {
      const destination = redirectParam || '/';
      router.push(destination);
    }
    return true;
  };

  const loginWithGoogle = async (payload: { sub: string; email: string; name?: string; picture?: string }): Promise<boolean> => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        emailVerified: true,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Google Login Failed');

    setUserAccount(json.userAccount);
    setUserProfile(json.userProfile);
    setLinkedIdentities(json.linkedIdentities || []);

    const destination = redirectParam || '/';
    router.push(destination);
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
