'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Phone, Mail, MessageCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminOrdersPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => ((o.id || o._id) === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus);

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-[#C5A059] focus:border-[#C5A059]';

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 border flex items-center justify-between transition-colors duration-300 ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-lg sm:text-xl font-bold ${textTitle}`}>Orders Management</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Track customer orders placed from Website, WhatsApp & Instagram dispatches.
          </p>
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className={`p-3 sm:p-4 border flex flex-wrap gap-1.5 sm:gap-2 text-xs transition-colors duration-300 ${cardBg}`}>
        {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`uppercase tracking-wider px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold transition-colors ${
              filterStatus === status
                ? 'bg-[#C5A059] text-stone-950 shadow-sm font-bold'
                : isWhite
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={`border overflow-hidden transition-colors duration-300 ${cardBg}`}>
        {loading ? (
          <div className={`py-20 text-center text-xs uppercase tracking-widest animate-pulse ${textSub}`}>
            Loading Customer Orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`py-16 text-center text-xs ${textSub}`}>No orders found for this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead>
                <tr className={`border-b ${borderLine} ${textSub} uppercase tracking-widest ${isWhite ? 'bg-stone-50' : 'bg-stone-900/60'}`}>
                  <th className="p-3 sm:p-4">Order Ref & Date</th>
                  <th className="p-3 sm:p-4">Customer Details</th>
                  <th className="p-3 sm:p-4">Ordered Items</th>
                  <th className="p-3 sm:p-4">Total</th>
                  <th className="p-3 sm:p-4">Channel</th>
                  <th className="p-3 sm:p-4">Update Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isWhite ? 'divide-stone-200' : 'divide-stone-800/60'}`}>
                {filteredOrders.map((order) => (
                  <tr key={order.id || order.orderNumber} className={isWhite ? 'hover:bg-stone-50/80' : 'hover:bg-stone-900/40'}>
                    <td className="p-3 sm:p-4">
                      <strong className="font-mono text-xs sm:text-sm text-[#C5A059] block font-bold">{order.orderNumber}</strong>
                      <span className={`text-[10px] ${textSub}`}>{new Date(order.createdAt || '').toLocaleDateString()}</span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <strong className={`block ${textTitle}`}>{order.customer.name}</strong>
                      <span className={`block font-mono text-[11px] ${textSub}`}>{order.customer.phone}</span>
                      {order.customer.city && <span className={`text-[10px] ${textSub}`}>{order.customer.city}</span>}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className={isWhite ? 'text-stone-800' : 'text-stone-300'}>
                            <strong>{item.productName}</strong> ({item.size} x {item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className={`p-3 sm:p-4 font-bold ${textTitle}`}>{formatPrice(order.pricing.grandTotal)}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-0.5 font-semibold text-[10px] border ${
                        isWhite
                          ? 'bg-stone-100 text-stone-800 border-stone-300'
                          : 'bg-stone-900 text-stone-300 border-stone-800'
                      }`}>
                        {order.source || 'Website'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id || order._id || '', e.target.value as OrderStatus)}
                        className={`text-xs font-semibold py-1 px-2 focus:outline-none transition-colors border ${
                          isWhite
                            ? 'bg-white border-stone-300 text-stone-900'
                            : 'bg-stone-900 border-stone-800 text-[#C5A059]'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready to Ship">Ready to Ship</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
