'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Product, Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminDashboardPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([fetch('/api/products'), fetch('/api/orders')]);
      const pJson = await pRes.json();
      const oJson = await oRes.json();

      if (pJson.success) setProducts(pJson.data);
      if (oJson.success) setOrders(oJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed/reset the database with House of NF luxury products and categories. Proceed?')) return;
    setSeeding(true);
    setSeedStatus('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSeedStatus(json.message);
        await loadDashboardData();
      }
    } catch (e: any) {
      setSeedStatus('Failed: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.flags.isActive).length;
  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => v.stock <= 5)
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.grandTotal || 0), 0);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-widest text-stone-400 animate-pulse">
        Loading Admin Analytics...
      </div>
    );
  }

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-8">
      {/* Top Banner Action Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border ${cardBg}`}>
        <div>
          <h2 className={`font-serif text-xl font-bold ${textTitle}`}>Atelier Business Overview</h2>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Real-time management of products, inventory stock, and direct WhatsApp customer orders.
          </p>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-5 py-3 flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Seeding MongoDB...' : 'Seed / Reset Demo Data'}
        </button>
      </div>

      {seedStatus && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs p-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{seedStatus}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 border flex flex-col justify-between ${cardBg}`}>
          <div className={`flex items-center justify-between ${textSub}`}>
            <span className="text-[10px] uppercase tracking-widest font-semibold">Total Products</span>
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div className="mt-4">
            <span className={`font-serif text-3xl font-bold ${textTitle}`}>{totalProducts}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-1">{activeProducts} Active on Website</span>
          </div>
        </div>

        <div className={`p-6 border flex flex-col justify-between ${cardBg}`}>
          <div className={`flex items-center justify-between ${textSub}`}>
            <span className="text-[10px] uppercase tracking-widest font-semibold">Customer Orders</span>
            <ClipboardList className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div className="mt-4">
            <span className={`font-serif text-3xl font-bold ${textTitle}`}>{totalOrders}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 block mt-1">{pendingOrders} Pending Actions</span>
          </div>
        </div>

        <div className={`p-6 border flex flex-col justify-between ${cardBg}`}>
          <div className={`flex items-center justify-between ${textSub}`}>
            <span className="text-[10px] uppercase tracking-widest font-semibold">Low Stock Items</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className={`font-serif text-3xl font-bold ${textTitle}`}>{lowStockProducts.length}</span>
            <span className={`text-xs block mt-1 ${textSub}`}>Requires Stock Refill</span>
          </div>
        </div>

        <div className={`p-6 border flex flex-col justify-between ${cardBg}`}>
          <div className={`flex items-center justify-between ${textSub}`}>
            <span className="text-[10px] uppercase tracking-widest font-semibold">Total Revenue Potential</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl font-bold text-[#C5A059]">{formatPrice(totalRevenue)}</span>
            <span className={`text-xs block mt-1 ${textSub}`}>Gross Order Value</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Low Stock Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Cols) */}
        <div className={`lg:col-span-2 p-6 border ${cardBg}`}>
          <div className={`flex items-center justify-between pb-4 border-b ${borderLine} mb-4`}>
            <h3 className={`font-serif text-base font-bold uppercase tracking-wider ${textTitle}`}>Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-[#C5A059] hover:underline font-semibold flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className={`py-8 text-center text-xs ${textSub}`}>No orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className={`border-b ${borderLine} ${textSub} uppercase tracking-widest`}>
                    <th className="py-2.5">Order Ref</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderLine}`}>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id || order.orderNumber}>
                      <td className="py-3 font-mono font-semibold text-[#C5A059]">{order.orderNumber}</td>
                      <td className="py-3">
                        <strong className={`block ${textTitle}`}>{order.customer.name}</strong>
                        <span className={textSub}>{order.customer.phone}</span>
                      </td>
                      <td className={`py-3 font-semibold ${textTitle}`}>{formatPrice(order.pricing.grandTotal)}</td>
                      <td className="py-3">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className={`p-6 border ${cardBg}`}>
          <div className={`flex items-center justify-between pb-4 border-b ${borderLine} mb-4`}>
            <h3 className={`font-serif text-base font-bold uppercase tracking-wider ${textTitle}`}>Inventory Alerts</h3>
            <Link href="/admin/inventory" className="text-xs text-[#C5A059] hover:underline font-semibold">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className={`text-xs py-4 text-center ${textSub}`}>All variants are well-stocked.</p>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id || product._id}
                  className={`p-3 border flex items-center gap-3 ${
                    isWhite ? 'bg-stone-50 border-stone-200' : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <img src={product.images[0]?.url} alt="" className="w-10 h-12 object-cover bg-stone-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-serif text-xs font-semibold truncate ${textTitle}`}>{product.name}</h4>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">SKU: {product.sku}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
