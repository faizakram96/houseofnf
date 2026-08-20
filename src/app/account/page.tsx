'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, ShoppingBag, Heart, LogOut, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { Order, User } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function UserAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.replace('/');
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hnf_admin_user');
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-xs uppercase tracking-widest text-stone-500 animate-pulse">
          Loading Customer Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white border border-stone-200 p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center font-bold text-xl font-serif">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-0.5">
                CUSTOMER DASHBOARD
              </span>
              <h1 className="font-serif text-2xl font-bold text-stone-900">{user.name}</h1>
              <p className="text-xs text-stone-500">{user.email} {user.phone && `• ${user.phone}`}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-600 border border-stone-300 text-xs uppercase tracking-widest font-semibold px-5 py-2.5 flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Orders Column (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-stone-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C5A059]" /> My Orders ({orders.length})
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500">
                <p className="mb-4">You haven't placed any orders yet.</p>
                <Link
                  href="/shop"
                  className="bg-[#141312] text-[#F3EBDD] text-xs uppercase tracking-widest px-6 py-3 font-semibold hover:bg-[#C5A059] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id || order.orderNumber} className="border border-stone-200 p-5 bg-stone-50/50 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-200">
                      <div>
                        <span className="font-mono font-bold text-[#C5A059] block">{order.orderNumber}</span>
                        <span className="text-stone-400 text-[10px]">{new Date(order.createdAt || '').toLocaleDateString()}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-1 font-semibold text-[10px] uppercase">
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-800">{item.productName} ({item.size})</span>
                          <span className="text-stone-600">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-stone-900">
                      <span>Total Amount:</span>
                      <span className="text-[#C5A059]">{formatPrice(order.pricing.grandTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Account Shortcuts & Info */}
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-stone-900 uppercase pb-3 border-b border-stone-200">
                Account Shortcuts
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-3 bg-stone-50 hover:bg-[#F3EBDD] text-stone-800 font-semibold border border-stone-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" /> Saved Wishlist Items
                  </span>
                  <span>→</span>
                </Link>

                <Link
                  href="/shop"
                  className="flex items-center justify-between p-3 bg-stone-50 hover:bg-[#F3EBDD] text-stone-800 font-semibold border border-stone-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" /> Shop New Arrivals
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {user.role === 'admin' && (
              <div className="bg-[#141312] text-white p-6 shadow-sm space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block">
                  ADMINISTRATOR ACCESS
                </span>
                <h4 className="font-serif text-lg font-bold">Admin Portal Ready</h4>
                <p className="text-xs text-stone-400 font-light">You have full administrator privileges to manage products, orders, and settings.</p>
                <Link
                  href="/admin"
                  className="block bg-[#C5A059] text-stone-950 text-xs uppercase tracking-widest font-bold text-center py-3 hover:bg-[#B38E46] transition-colors"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
