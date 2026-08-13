'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Phone, Mail, MessageCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminOrdersPage() {
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

  return (
    <div className="space-y-6">
      <div className="bg-[#141312] p-6 border border-stone-800 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-white">Orders Management</h1>
          <p className="text-xs text-stone-400 font-light mt-1">
            Track customer orders placed from Website, WhatsApp & Instagram dispatches.
          </p>
        </div>
      </div>

      {/* Filter Status Bar */}
      <div className="bg-[#141312] border border-stone-800 p-4 flex flex-wrap gap-2 text-xs">
        {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`uppercase tracking-wider px-3.5 py-1.5 font-semibold transition-colors ${
              filterStatus === status
                ? 'bg-[#C5A059] text-stone-950'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#141312] border border-stone-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
            Loading Customer Orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">No orders found for this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-widest bg-stone-900/60">
                  <th className="p-4">Order Ref & Date</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Ordered Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id || order.orderNumber} className="hover:bg-stone-900/40">
                    <td className="p-4">
                      <strong className="font-mono text-sm text-[#C5A059] block">{order.orderNumber}</strong>
                      <span className="text-[10px] text-stone-500">{new Date(order.createdAt || '').toLocaleDateString()}</span>
                    </td>
                    <td className="p-4">
                      <strong className="text-stone-200 block">{order.customer.name}</strong>
                      <span className="text-stone-400 block font-mono">{order.customer.phone}</span>
                      {order.customer.city && <span className="text-stone-500 text-[10px]">{order.customer.city}</span>}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-stone-300">
                            <strong>{item.productName}</strong> ({item.size} x {item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-stone-200">{formatPrice(order.pricing.grandTotal)}</td>
                    <td className="p-4">
                      <span className="bg-stone-900 text-stone-300 border border-stone-800 px-2 py-0.5 font-semibold text-[10px]">
                        {order.source || 'Website'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id || order._id || '', e.target.value as OrderStatus)}
                        className="bg-stone-900 border border-stone-800 text-xs text-[#C5A059] font-semibold py-1 px-2 focus:outline-none"
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
