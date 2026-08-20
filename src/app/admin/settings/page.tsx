'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, MessageCircle, Mail, KeyRound, ShieldAlert, Lock, UserCheck } from 'lucide-react';
import { SiteSettings } from '@/types';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminSettingsPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [settings, setSettings] = useState<SiteSettings>({
    whatsappNumber: '919664209989',
    instagramUrl: 'https://www.instagram.com/houseofnf.in',
    storeEmail: 'thehouseofnf@gmail.com',
    storePhone: '+91 96642 09989',
    address: 'Flagship Atelier: Malviya Nagar, Jaipur - 302017, India',
    freeShippingThreshold: 2999,
    currencySymbol: '₹',
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Admin Change Password & Email Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credSaving, setCredSaving] = useState(false);
  const [credStatusMsg, setCredStatusMsg] = useState('');
  const [credError, setCredError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) setSettings(json.data);

        const storedUser = localStorage.getItem('hnf_admin_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setNewEmail(parsed.email || 'admin@houseofnf.com');
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg('Store configuration successfully updated!');
      }
    } catch (e: any) {
      setStatusMsg('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredStatusMsg('');

    if (!currentPassword) {
      setCredError('Please enter your current password to authorize credential changes.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredError('New password and confirmation password do not match.');
      return;
    }

    setCredSaving(true);

    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail,
          newPassword,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCredStatusMsg(json.message || 'Admin credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Update local stored email
        const storedUser = localStorage.getItem('hnf_admin_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.email = newEmail;
          localStorage.setItem('hnf_admin_user', JSON.stringify(parsed));
        }
      } else {
        setCredError(json.error || 'Failed to update credentials.');
      }
    } catch (err: any) {
      setCredError(err.message || 'An error occurred.');
    } finally {
      setCredSaving(false);
    }
  };

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-stone-200 focus:border-[#C5A059]';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className={`p-6 border flex items-center justify-between ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-xl font-bold ${textTitle}`}>Store & Security Settings</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Manage Admin ID/Password credentials, WhatsApp ordering dispatches, and store rules.
          </p>
        </div>
      </div>

      {/* 🔐 Admin Credentials Change Section */}
      <div className={`p-6 border space-y-6 ${cardBg}`}>
        <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderLine} flex items-center gap-2`}>
          <KeyRound className="w-4 h-4" /> Change Admin User ID & Password
        </h3>

        {credStatusMsg && (
          <div className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs p-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{credStatusMsg}</span>
          </div>
        )}

        {credError && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>{credError}</span>
          </div>
        )}

        <form onSubmit={handleChangeCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Current Password * (Verification)
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                New Admin Email / User ID
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@houseofnf.com"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                New Password (Optional if unchanged)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={credSaving}
            className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-6 py-3 flex items-center gap-2 shadow-lg transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            {credSaving ? 'Updating Credentials...' : 'Update Admin Credentials'}
          </button>
        </form>
      </div>

      {/* 📱 Store WhatsApp & Channel Configuration */}
      <div className={`p-6 border space-y-6 ${cardBg}`}>
        <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderLine} flex items-center gap-2`}>
          <MessageCircle className="w-4 h-4" /> WhatsApp & Social Integrations
        </h3>

        {statusMsg && (
          <div className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs p-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Official WhatsApp Number (Country Code + Number) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. 919664209989"
                className={`w-full text-xs font-mono p-3 focus:outline-none ${inputBg}`}
              />
              <span className={`text-[10px] mt-1 block ${textSub}`}>Used to generate all customer WhatsApp order messages.</span>
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Official Instagram Profile URL *
              </label>
              <input
                type="url"
                required
                value={settings.instagramUrl}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/houseofnf.in"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          {/* Instagram Business Meta Graph API Settings */}
          <div className="pt-4 border-t border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#C5A059] block">
                Instagram Business Meta Graph API Setup (Optional Live Sync)
              </span>
              <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-0.5 font-mono">
                META GRAPH API v19.0
              </span>
            </div>

            <p className={`text-xs font-light leading-relaxed ${textSub}`}>
              To automatically fetch and display live Instagram posts and Reels on your website using Meta Graph API, enter your Instagram Business App credentials below or in your <code className="text-amber-400 font-mono">.env.local</code> file:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                  Instagram Business User ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 17841400000000000"
                  className={`w-full text-xs font-mono p-3 focus:outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                  Meta Long-Lived Access Token
                </label>
                <input
                  type="password"
                  placeholder="EAA..."
                  className={`w-full text-xs font-mono p-3 focus:outline-none ${inputBg}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Free Shipping Threshold Amount (₹)
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#141312] dark:bg-stone-800 hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs uppercase tracking-widest px-8 py-3.5 flex items-center gap-2 shadow-lg transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Store Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
