'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  MapPin,
  Shield,
  LogOut,
  CheckCircle2,
  Phone,
  Mail,
  Edit2,
  Save,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';

  const { isAuthenticated, userAccount, userProfile, linkedIdentities, isLoading, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [isEditing, setIsEditing] = useState(false);

  // Form edit states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // Sample customer orders state
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  useEffect(() => {
    // Load customer order history
    if (userAccount) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [userAccount]);

  if (isLoading || !userAccount) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">Loading Account Details...</p>
        </div>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);

    try {
      await updateProfile({
        firstName,
        lastName,
        email,
      });
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const phoneIdentity = linkedIdentities.find((i) => i.provider === 'PHONE');
  const googleIdentity = linkedIdentities.find((i) => i.provider === 'GOOGLE');

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#141312] text-[#F3EBDD] font-serif text-2xl font-bold flex items-center justify-center border-2 border-[#C5A059]">
              {(userProfile?.firstName || 'C')[0]}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block">
                MY LUXURY ACCOUNT
              </span>
              <h1 className="font-serif text-2xl font-semibold text-stone-900">
                Hi, {userProfile?.firstName || 'Valued Customer'} {userProfile?.lastName || ''}
              </h1>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Member since {userAccount.createdAt ? new Date(userAccount.createdAt).toLocaleDateString() : '2026'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-4 py-2.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Account Body: Tabs Navigation & Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="bg-white border border-stone-200/80 p-4 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-colors text-left ${
                activeTab === 'profile'
                  ? 'bg-[#141312] text-[#F3EBDD] border-l-4 border-[#C5A059]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <UserIcon className="w-4 h-4 text-[#C5A059]" /> My Profile
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-colors text-left ${
                activeTab === 'orders'
                  ? 'bg-[#141312] text-[#F3EBDD] border-l-4 border-[#C5A059]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4 text-[#C5A059]" /> My Orders
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-colors text-left ${
                activeTab === 'addresses'
                  ? 'bg-[#141312] text-[#F3EBDD] border-l-4 border-[#C5A059]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#C5A059]" /> Saved Addresses
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition-colors text-left ${
                activeTab === 'security'
                  ? 'bg-[#141312] text-[#F3EBDD] border-l-4 border-[#C5A059]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-4 h-4 text-[#C5A059]" /> Linked Identies
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="lg:col-span-3">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <h2 className="font-serif text-xl font-semibold text-stone-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C5A059] hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-stone-500 hover:underline uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 text-center">
                    Profile details updated successfully.
                  </div>
                )}
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 text-center">
                    {saveError}
                  </div>
                )}

                {!isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">First Name</span>
                      <p className="text-sm font-semibold text-stone-900">{userProfile?.firstName || 'Not provided'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Last Name</span>
                      <p className="text-sm font-semibold text-stone-900">{userProfile?.lastName || 'Not provided'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Mobile Number</span>
                      <p className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                        <span>{userProfile?.phone || phoneIdentity?.identifierPhone || 'Not verified'}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Email Address</span>
                      <p className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                        <span>{userProfile?.email || googleIdentity?.identifierEmail || 'Not linked'}</span>
                        {googleIdentity && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-stone-600 font-semibold block">First Name *</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-stone-600 font-semibold block">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-stone-600 font-semibold block">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 focus:border-[#C5A059] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3 px-6 transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-stone-200 pb-4">
                  <h2 className="font-serif text-xl font-semibold text-stone-900">My Orders & Dispatch History</h2>
                  <p className="text-xs text-stone-500 font-light mt-0.5">Track express deliveries and inspect invoice breakdowns</p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                    <p className="text-sm font-semibold text-stone-700">No orders placed yet</p>
                    <p className="text-xs text-stone-500">Explore our Jaipur atelier collections and place your first order.</p>
                    <Link
                      href="/shop"
                      className="inline-block bg-[#141312] text-[#F3EBDD] font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#C5A059] hover:text-stone-950 transition-colors"
                    >
                      Explore Storefront
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order._id || order.id} className="border border-stone-200 p-4 sm:p-6 space-y-4 bg-stone-50/50">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 text-xs">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Order ID</span>
                            <span className="font-mono font-bold text-stone-900">{order.orderId || order._id}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Date</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">Total Amount</span>
                            <span className="font-bold text-stone-900">₹{order.totalAmount?.toLocaleString()}</span>
                          </div>

                          <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold">
                            {order.orderStatus || order.status || 'CONFIRMED'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-stone-200 overflow-hidden flex-shrink-0">
                                {item.image && <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />}
                              </div>
                              <div className="text-xs">
                                <p className="font-semibold text-stone-900">{item.productName}</p>
                                <p className="text-stone-500">Size: {item.size} • Qty: {item.quantity} • ₹{item.unitPrice?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-stone-900">Saved Delivery Addresses</h2>
                    <p className="text-xs text-stone-500 font-light mt-0.5">Manage shipping locations for instant 1-click checkout</p>
                  </div>
                </div>

                <div className="border border-stone-200 p-6 bg-stone-50/40 space-y-3 relative">
                  <span className="bg-[#C5A059] text-stone-950 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 font-semibold">
                    Primary Default Address
                  </span>
                  <p className="text-sm font-semibold text-stone-900">{userProfile?.firstName} {userProfile?.lastName}</p>
                  <p className="text-xs text-stone-600">
                    House of NF Flagship Atelier, Malviya Nagar<br />
                    Jaipur, Rajasthan - 302017, India
                  </p>
                  <p className="text-xs font-mono text-stone-700">Phone: {userProfile?.phone || phoneIdentity?.identifierPhone}</p>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & LINKED IDENTITIES */}
            {activeTab === 'security' && (
              <div className="bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-stone-200 pb-4">
                  <h2 className="font-serif text-xl font-semibold text-stone-900">Authentication & Linked Logins</h2>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Your single customer account links multiple login identities without account duplication
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Phone Identity Box */}
                  <div className="border border-stone-200 p-4 sm:p-5 flex items-center justify-between bg-stone-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-full">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-900">Mobile Phone OTP Authentication</p>
                        <p className="text-[11px] font-mono text-stone-500">
                          {phoneIdentity?.identifierPhone || userProfile?.phone || 'Not attached'}
                        </p>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  {/* Google Identity Box */}
                  <div className="border border-stone-200 p-4 sm:p-5 flex items-center justify-between bg-stone-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 text-blue-800 rounded-full">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-900">Google OAuth 2.0 Identity</p>
                        <p className="text-[11px] font-mono text-stone-500">
                          {googleIdentity?.identifierEmail || userProfile?.email || 'Not connected'}
                        </p>
                      </div>
                    </div>

                    {googleIdentity ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Linked
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                        Not Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
