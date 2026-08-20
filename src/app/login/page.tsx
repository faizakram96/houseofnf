'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, loginWithGoogle } = useAuth();

  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(true);
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

    if (!agreed) {
      setError('You must agree to the Terms of Use & Privacy Policy to continue.');
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
      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200/80 p-8 sm:p-10 shadow-xl rounded-none relative">
        {/* Title */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold text-[#424553]">
            Login <span className="font-normal text-stone-500 text-lg">or</span> Signup
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          {/* Input Box (+91 | Mobile Number*) */}
          <div className="flex items-center border border-stone-300 bg-white p-3 focus-within:border-stone-800 transition-colors">
            <span className="text-stone-600 text-sm font-medium pr-3 border-r border-stone-300 flex-shrink-0">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Mobile Number*"
              className="w-full text-sm pl-3 bg-transparent text-stone-900 focus:outline-none placeholder:text-stone-400 font-medium"
              maxLength={10}
              required
            />
          </div>

          {/* Checkbox Terms & Conditions */}
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#ff3f6c] accent-[#ff3f6c] border-stone-300 rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms-checkbox" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
              By continuing, I agree to the{' '}
              <Link href="/terms" className="font-bold text-[#ff3f6c] hover:underline">
                Terms of Use
              </Link>{' '}
              &{' '}
              <Link href="/privacy" className="font-bold text-[#ff3f6c] hover:underline">
                Privacy Policy
              </Link>{' '}
              and I am above 18 years old.
            </label>
          </div>

          {/* CONTINUE CTA Button */}
          <button
            type="submit"
            disabled={loading || phone.length < 10 || !agreed}
            className={`w-full font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition-all text-white ${
              phone.length === 10 && agreed
                ? 'bg-[#ff3f6c] hover:bg-[#e0355c] cursor-pointer shadow-md'
                : 'bg-[#94969f] cursor-not-allowed opacity-90'
            }`}
          >
            {loading ? 'SENDING OTP...' : 'CONTINUE'}
          </button>
        </form>

        {/* Help Link */}
        <div className="text-xs text-stone-600 text-left pt-1">
          Have trouble logging in?{' '}
          <button
            type="button"
            onClick={() => alert('For support, email thehouseofnf@gmail.com or call +91 96642 09989.')}
            className="font-bold text-[#ff3f6c] hover:underline cursor-pointer"
          >
            Get help
          </button>
        </div>

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
      </div>
    </div>
  );
}
