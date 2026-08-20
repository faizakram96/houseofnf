'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ShieldCheck, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, loginWithGoogle } = useAuth();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(cleanDigits);
      router.push('/login/verify-otp');
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // Simulate Google OAuth popup response
      const mockSub = `google_${Date.now()}_demo`;
      const mockEmail = `customer_${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;

      await loginWithGoogle({
        sub: mockSub,
        email: mockEmail,
        name: 'Curated Customer',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      });
    } catch (err: any) {
      setError(err.message || 'Google Login failed');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-md w-full space-y-8 bg-white border border-stone-200/80 p-8 sm:p-10 shadow-xl rounded-none relative overflow-hidden">
        {/* Brand Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C5A059]" />

        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
            HOUSE OF NF • ATELIER
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">Welcome Back</h1>
          <p className="text-xs text-stone-500 font-light">Login or create your luxury shopping account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Phone Login Form */}
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-700 block">
              Mobile Number
            </label>
            <div className="flex items-center border border-stone-300 focus-within:border-[#C5A059] transition-colors bg-stone-50">
              <div className="px-3.5 py-3 border-r border-stone-300 bg-stone-100/60 text-xs font-semibold text-stone-700 flex items-center gap-1">
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full text-xs p-3 bg-transparent text-stone-900 focus:outline-none placeholder:text-stone-400 font-mono tracking-wider"
                maxLength={10}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3.5 px-4 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Sending OTP...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-stone-200" />
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
            OR
          </span>
          <div className="flex-grow border-t border-stone-200" />
        </div>

        {/* Google OAuth Option */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold uppercase tracking-wider py-3 px-4 transition-colors flex items-center justify-center gap-3 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Terms & Guarantees */}
        <div className="pt-4 border-t border-stone-200/60 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 font-light">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 100% Encrypted Authentication</span>
          </div>

          <p className="text-[10px] text-stone-400 leading-relaxed">
            By continuing, you agree to House of NF's{' '}
            <Link href="/terms" className="underline hover:text-stone-700">
              Terms of Use
            </Link>{' '}
            &{' '}
            <Link href="/privacy" className="underline hover:text-stone-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
