'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { pendingPhone, pendingDevOtp, verifyOtp, sendOtp } = useAuth();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Timer Countdown (30 Seconds)
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!pendingPhone) {
      router.push('/login');
    }
  }, [pendingPhone, router]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits are entered
    if (index === 5 && cleanValue) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        submitOtp(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (fullOtp: string) => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp(pendingPhone, fullOtp);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForm = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    submitOtp(fullOtp);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setTimer(30);
    setCanResend(false);
    try {
      await sendOtp(pendingPhone);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200/80 p-8 sm:p-10 shadow-xl rounded-none relative text-left">
        {/* Top Circular Phone Illustration */}
        <div className="pt-2 pb-4 text-center">
          <div className="w-24 h-24 rounded-full bg-[#e8f6fc] flex items-center justify-center mx-auto relative shadow-sm">
            {/* Sparkle icons around badge */}
            <Sparkles className="w-4 h-4 text-amber-400 absolute top-2 right-3" />
            <Sparkles className="w-3 h-3 text-amber-400 absolute bottom-3 left-2" />

            {/* Phone Illustration Container */}
            <div className="w-10 h-14 bg-stone-800 rounded-md p-1 border border-stone-700 flex flex-col justify-between shadow-md relative">
              <div className="w-3 h-0.5 bg-stone-500 rounded-full mx-auto" />
              <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-stone-900 rounded">
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
              </div>
              <div className="w-2 h-2 rounded-full bg-stone-400 mx-auto" />

              {/* Red Checkmark Badge */}
              <div className="absolute -bottom-1 -right-2 w-6 h-6 bg-[#ff3f6c] rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Heading Title & Phone Number Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#424553]">Verify with OTP</h1>
          <p className="text-sm text-stone-500 font-normal">
            Sent to {pendingPhone ? pendingPhone.replace('+91', '') : '9039549989'}
          </p>
        </div>

        {/* Dev OTP Helper Badge */}
        {pendingDevOtp && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 text-center rounded-none font-mono">
            <span className="font-semibold block text-[10px] uppercase tracking-wider text-amber-700">
              Demo Mode Helper
            </span>
            Use Test OTP: <strong>{pendingDevOtp}</strong>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* 6-Digit OTP Boxes */}
        <form onSubmit={handleVerifyForm} className="space-y-6">
          <div className="flex justify-start items-center gap-2 sm:gap-3 pt-2">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 sm:w-11 sm:h-13 text-center font-bold text-xl text-stone-900 bg-white border border-stone-300 focus:border-[#ff3f6c] focus:outline-none transition-colors"
                required
              />
            ))}
          </div>

          {/* Resend Timer Text */}
          <div className="text-xs text-stone-500 font-medium">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#ff3f6c] hover:underline font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP Now</span>
              </button>
            ) : (
              <span>
                Resend OTP in: <strong className="font-bold text-stone-900">{formatTimer(timer)}</strong>
              </span>
            )}
          </div>

          {/* Secondary Links */}
          <div className="space-y-2 pt-1 border-t border-stone-200/60">
            <div className="text-xs text-stone-600">
              Log in using{' '}
              <button
                type="button"
                onClick={() => alert('Password login is available for customer accounts with registered credentials.')}
                className="font-bold text-[#ff3f6c] hover:underline cursor-pointer"
              >
                Password
              </button>
            </div>

            <div className="text-xs text-stone-600">
              Having trouble logging in?{' '}
              <button
                type="button"
                onClick={() => alert('For support, email thehouseofnf@gmail.com or call +91 96642 09989.')}
                className="font-bold text-[#ff3f6c] hover:underline cursor-pointer"
              >
                Get help
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
