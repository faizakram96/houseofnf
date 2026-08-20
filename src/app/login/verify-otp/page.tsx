'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
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
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(pendingPhone, fullOtp);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-md w-full space-y-8 bg-white border border-stone-200/80 p-8 sm:p-10 shadow-xl rounded-none relative overflow-hidden">
        {/* Brand Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C5A059]" />

        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
            VERIFICATION CODE
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">Verify Mobile Number</h1>
          <p className="text-xs text-stone-500 font-light">
            Enter the 6-digit code sent to <strong className="font-mono text-stone-900">{pendingPhone}</strong>
          </p>
        </div>

        {/* Dev OTP Helper Badge */}
        {pendingDevOtp && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 text-center rounded-none font-mono">
            <span className="font-semibold block text-[10px] uppercase tracking-wider text-amber-700">Demo Mode Helper</span>
            Use Test OTP: <strong>{pendingDevOtp}</strong>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* OTP Input Boxes */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center items-center gap-2 sm:gap-3">
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
                className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3.5 px-4 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend & Change Phone Footer */}
        <div className="pt-4 border-t border-stone-200/60 text-center space-y-4">
          <div className="text-xs text-stone-500">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#C5A059] hover:underline font-bold uppercase tracking-wider text-[11px] inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP Code</span>
              </button>
            ) : (
              <span>Resend OTP in <strong className="font-mono text-stone-900">{timer}s</strong></span>
            )}
          </div>

          <div>
            <Link
              href="/login"
              className="text-[11px] text-stone-400 hover:text-stone-700 uppercase tracking-widest underline"
            >
              Change Mobile Number
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
