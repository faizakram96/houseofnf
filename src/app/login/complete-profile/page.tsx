'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { userProfile, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('First Name is required.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile details.');
      setLoading(false);
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
            CREATE YOUR ACCOUNT
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">Complete Profile</h1>
          <p className="text-xs text-stone-500 font-light">Tell us a bit more about yourself to personalize your experience</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-700 block">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Faiz"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-700 block">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Akram"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-stone-700 block">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. faiz@example.com"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:bg-white focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-stone-400">Used for order confirmations & express dispatch updates</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3.5 px-4 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <span>Complete Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
