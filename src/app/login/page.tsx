'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Phone, ArrowRight, ShieldAlert, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Role Tab: 'admin' | 'customer'
  const [roleTab, setRoleTab] = useState<'admin' | 'customer'>('admin');

  // Mode: 'login' | 'otp_step1' | 'otp_step2' | 'otp_step3'
  const [mode, setMode] = useState<'login' | 'otp_step1' | 'otp_step2' | 'otp_step3'>('login');

  // Form States
  const [identifier, setIdentifier] = useState('admin@houseofnf.com');
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

  const handleRoleSwitch = (tab: 'admin' | 'customer') => {
    setRoleTab(tab);
    setError('');
    setSuccessMsg('');
    if (tab === 'admin') {
      setIdentifier('admin@houseofnf.com');
    } else {
      setIdentifier('user@example.com');
    }
  };

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
          role: roleTab,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMsg(json.message || 'Authentication successful!');
        localStorage.setItem('hnf_admin_user', JSON.stringify(json.user));

        setTimeout(() => {
          router.push(json.redirectUrl || (roleTab === 'admin' ? '/admin' : '/account'));
        }, 600);
      } else {
        setError(json.error || 'Invalid email or password');
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
        setSuccessMsg(json.message || 'OTP sent successfully!');
        if (json.otp) {
          setOtp(json.otp);
          setDemoOtpNotice(`Generated Demo OTP: ${json.otp}`);
        }
        setMode('otp_step2');
      } else {
        setError(json.error || 'Account not found.');
      }
    } catch (err: any) {
      setError('Failed to send OTP.');
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
      setError('Failed to verify OTP.');
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
        setSuccessMsg('Password successfully reset! Logging you in...');
        setPassword(newPassword.trim());

        // Perform auto-login
        setTimeout(async () => {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: newPassword.trim(), role: roleTab }),
          });
          const loginJson = await loginRes.json();
          if (loginJson.success) {
            localStorage.setItem('hnf_admin_user', JSON.stringify(loginJson.user));
            router.push(loginJson.redirectUrl || '/admin');
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
    <div className="min-h-screen bg-[#141312] text-[#F3EBDD] flex items-center justify-center p-4">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#1C1A18] border border-stone-800 p-8 sm:p-10 shadow-2xl space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center pb-4 border-b border-stone-800">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-semibold text-white uppercase block">
              HOUSE OF NF
            </span>
            <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase block font-semibold mt-1">
              ATELIER PORTAL LOGIN
            </span>
          </Link>
        </div>

        {/* Dual Role Selector Tabs (Admin vs User Login) */}
        {mode === 'login' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-900 border border-stone-800 rounded-none">
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                roleTab === 'admin'
                  ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('customer')}
              className={`py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                roleTab === 'customer'
                  ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              User Login
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="bg-red-950/80 border border-red-800/90 text-red-200 text-xs p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authentication Alert</span>
              <p className="text-[11px] text-red-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-700/90 text-emerald-200 text-xs p-3.5 flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Success</span>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* --- MODE 1: MAIN LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="admin@houseofnf.com or Mobile Number"
                  className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 pl-9 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 pl-9 pr-10 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox & Forgot Password Link */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-400 hover:text-stone-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded-none cursor-pointer"
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
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all duration-300 flex items-center justify-center gap-2 mt-6 shadow-xl"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  LOGIN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 1: ENTER MOBILE / EMAIL & SEND OTP --- */}
        {mode === 'otp_step1' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Forgot Password</h3>
              <p className="text-xs text-stone-400 mt-1">Enter your registered Email or Mobile Number to receive an OTP.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
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
                placeholder="admin@houseofnf.com or Mobile Number"
                className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setMode('login');
              }}
              className="w-full text-xs text-stone-400 hover:text-white pt-2 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 2: ENTER & VERIFY OTP --- */}
        {mode === 'otp_step2' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Verify OTP Code</h3>
              {demoOtpNotice && (
                <div className="bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#C5A059] text-xs p-2.5 mt-2 font-mono font-bold">
                  {demoOtpNotice}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
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
                className="w-full bg-stone-900 border border-stone-800 text-xs text-[#C5A059] font-mono tracking-widest text-center py-3.5 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setMode('otp_step1')}
              className="w-full text-xs text-stone-400 hover:text-white pt-2 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 3: CREATE NEW PASSWORD & LOGIN --- */}
        {mode === 'otp_step3' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center py-2">
              <UserCheck className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Set New Password</h3>
              <p className="text-xs text-stone-400 mt-1">Create a secure new password for your account.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 pl-9 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
