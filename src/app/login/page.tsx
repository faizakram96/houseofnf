'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  // Mode: 'login' | 'otp_step1' | 'otp_step2' | 'otp_step3'
  const [mode, setMode] = useState<'login' | 'otp_step1' | 'otp_step2' | 'otp_step3'>('login');

  // Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Reset States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- LOGIN SUBMIT ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your Email or Mobile Number and Password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          rememberMe,
          role: 'customer',
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMsg('Signed in successfully! Directing to your account...');
        localStorage.setItem('hnf_customer_user', JSON.stringify(json.user));

        setTimeout(() => {
          router.push('/account');
        }, 600);
      } else {
        setError(json.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: SEND OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered Email or Mobile Number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', identifier: identifier.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || 'OTP code dispatched!');
        if (json.otp) {
          setOtp(json.otp);
          setDemoOtpNotice(`Verification OTP: ${json.otp}`);
        }
        setMode('otp_step2');
      } else {
        setError(json.error || 'Account not found.');
      }
    } catch (err: any) {
      setError('Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', identifier: identifier.trim(), otp: otp.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setMode('otp_step3');
      } else {
        setError(json.error || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setError('Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: RESET PASSWORD & LOGIN ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Password updated! Signing you in...');
        setPassword(newPassword.trim());

        setTimeout(async () => {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: newPassword.trim(), role: 'customer' }),
          });
          const loginJson = await loginRes.json();
          if (loginJson.success) {
            localStorage.setItem('hnf_customer_user', JSON.stringify(loginJson.user));
            router.push('/account');
          } else {
            setMode('login');
          }
        }, 800);
      } else {
        setError(json.error || 'Password reset failed.');
      }
    } catch (err: any) {
      setError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex items-center justify-center p-4 py-16">
      <div className="relative w-full max-w-md bg-white border border-stone-200 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-stone-200">
          <Link href="/" className="inline-block group">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.18em] font-semibold text-stone-950 uppercase block group-hover:text-[#C5A059] transition-colors">
              HOUSE OF NF
            </span>
            <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase block font-semibold mt-1">
              PATRON ACCOUNT SIGN IN
            </span>
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authentication Notice</span>
              <p className="text-[11px] text-red-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Success</span>
              <p className="text-[11px] text-emerald-700 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* --- MAIN CUSTOMER LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter email or mobile number"
                  className="w-full bg-stone-50 border border-stone-300 text-xs text-stone-900 p-3.5 pl-9 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-stone-300 text-xs text-stone-900 p-3.5 pl-9 pr-10 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox & Forgot Password Link */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-stone-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('otp_step1');
                }}
                className="text-[#C5A059] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all duration-300 flex items-center justify-center gap-2 mt-6 shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  SIGN IN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-500">
              <span>New to House of NF? </span>
              <Link href="/shop" className="text-[#C5A059] font-bold hover:underline">
                Explore Atelier Collection
              </Link>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 1 --- */}
        {mode === 'otp_step1' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Reset Password</h3>
              <p className="text-xs text-stone-500 mt-1">Enter your registered Email or Mobile Number to receive an OTP.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                Email or Mobile Number
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter email or mobile number"
                className="w-full bg-stone-50 border border-stone-300 text-xs text-stone-900 p-3.5 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? 'Sending Code...' : 'Send OTP Code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setMode('login');
              }}
              className="w-full text-xs text-stone-500 hover:text-stone-900 pt-2 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 2 --- */}
        {mode === 'otp_step2' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Verify Security Code</h3>
              {demoOtpNotice && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-2.5 mt-2 font-mono font-bold">
                  {demoOtpNotice}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. 849201"
                className="w-full bg-stone-50 border border-stone-300 text-xs text-[#C5A059] font-mono tracking-widest text-center py-3.5 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setMode('otp_step1')}
              className="w-full text-xs text-stone-500 hover:text-stone-900 pt-2 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 3 --- */}
        {mode === 'otp_step3' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center py-2">
              <UserCheck className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-stone-900">Set New Password</h3>
              <p className="text-xs text-stone-500 mt-1">Create a secure new password for your account.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-stone-50 border border-stone-300 text-xs text-stone-900 p-3.5 pl-9 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
