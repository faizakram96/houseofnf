'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, CheckCircle2, KeyRound, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

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

  // --- LOGIN SUBMIT ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your Admin Email/ID and Password.');
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
          role: 'admin',
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMsg(json.message || 'Admin authentication verified!');
        localStorage.setItem('hnf_admin_user', JSON.stringify(json.user));

        setTimeout(() => {
          router.push('/admin');
        }, 600);
      } else {
        setError(json.error || 'Invalid Admin credentials or insufficient privileges.');
      }
    } catch (err: any) {
      setError('Admin portal connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: SEND OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered Admin Email or Phone.');
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
        setSuccessMsg(json.message || 'OTP sent to admin channel!');
        if (json.otp) {
          setOtp(json.otp);
          setDemoOtpNotice(`Generated Admin OTP: ${json.otp}`);
        }
        setMode('otp_step2');
      } else {
        setError(json.error || 'Admin account not found.');
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
      setError('Please enter the 6-digit Admin OTP code.');
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
        setError(json.error || 'Invalid Admin OTP code.');
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
        setSuccessMsg('Admin password updated! Logging you in...');
        setPassword(newPassword.trim());

        setTimeout(async () => {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: newPassword.trim(), role: 'admin' }),
          });
          const loginJson = await loginRes.json();
          if (loginJson.success) {
            localStorage.setItem('hnf_admin_user', JSON.stringify(loginJson.user));
            router.push('/admin');
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
      {/* Ambient Dark Gold Background Overlay */}
      <div className="fixed inset-0 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#1C1A18] border border-stone-800 p-8 sm:p-10 shadow-2xl space-y-6 z-10">
        {/* Admin Brand Header */}
        <div className="text-center pb-4 border-b border-stone-800 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RESTRICTED MANAGEMENT PORTAL</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-semibold text-white uppercase block pt-1">
            HOUSE OF NF
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase block font-semibold">
            ADMINISTRATION SUITE
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-950/80 border border-red-800/90 text-red-200 text-xs p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Admin Security Alert</span>
              <p className="text-[11px] text-red-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-700/90 text-emerald-200 text-xs p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Authorized</span>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">{successMsg}</p>
            </div>
          </div>
        )}

        {/* --- MAIN ADMIN LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                Admin User ID / Email
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
                  placeholder="admin@houseofnf.com"
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
                  className="w-4 h-4 accent-[#C5A059] cursor-pointer"
                />
                <span>Keep session active</span>
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
                Reset Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all duration-300 flex items-center justify-center gap-2 mt-6 shadow-xl"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  AUTHORIZE ADMIN ACCESS <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 1 --- */}
        {mode === 'otp_step1' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Admin Recovery</h3>
              <p className="text-xs text-stone-400 mt-1">Enter your registered Admin Email or Phone to receive OTP authorization.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                Admin User ID / Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                placeholder="admin@houseofnf.com"
                className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Send Recovery OTP'}
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
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin Login
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD STEP 2 --- */}
        {mode === 'otp_step2' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center py-2">
              <KeyRound className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Verify Admin Code</h3>
              {demoOtpNotice && (
                <div className="bg-[#C5A059]/20 border border-[#C5A059]/50 text-[#C5A059] text-xs p-2.5 mt-2 font-mono font-bold">
                  {demoOtpNotice}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                Enter 6-Digit Admin OTP
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
              {loading ? 'Verifying OTP...' : 'Verify Admin OTP'}
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

        {/* --- FORGOT PASSWORD STEP 3 --- */}
        {mode === 'otp_step3' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center py-2">
              <UserCheck className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-white">Reset Admin Password</h3>
              <p className="text-xs text-stone-400 mt-1">Set a new password for the Admin account.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-300 block mb-1">
                New Admin Password (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New admin password"
                  className="w-full bg-stone-900 border border-stone-800 text-xs text-white p-3.5 pl-9 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
