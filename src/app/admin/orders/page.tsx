'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Phone, Mail, MessageCircle, CheckCircle, RefreshCw, CreditCard, RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminOrdersPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

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
        setActionMsg(`Order status updated to "${newStatus}"`);
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    const orderId = refundModalOrder.id || refundModalOrder._id;
    if (!orderId) return;

    setIsRefunding(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: refundModalOrder.pricing.grandTotal,
          reason: refundReason.trim() || 'Admin issued customer refund',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) =>
            (o.id || o._id) === orderId
              ? {
                  ...o,
                  orderStatus: 'Cancelled',
                  payment: {
                    ...o.payment,
                    status: 'Refunded',
                    refundStatus: 'Processed',
                    refundId: json.refund?.id,
                    refundAmount: refundModalOrder.pricing.grandTotal,
                  },
                }
              : o
          )
        );
        setActionMsg(`Refund of ${formatPrice(refundModalOrder.pricing.grandTotal)} issued successfully!`);
        setRefundModalOrder(null);
        setRefundReason('');
        setTimeout(() => setActionMsg(''), 4000);
      } else {
        alert(json.error || 'Failed to issue refund.');
      }
    } catch (err: any) {
      alert('Refund error: ' + err.message);
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.orderStatus === filterStatus || o.payment?.status === filterStatus);

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-6 text-stone-900">
      {/* Header Bar */}
      <div className={`p-4 sm:p-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300 ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-lg sm:text-xl font-bold ${textTitle}`}>Payments & Orders Management</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            View live Razorpay transactions, order status pipeline, and process official refunds.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 text-xs font-bold uppercase tracking-wider py-2 px-4 flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter Status Bar */}
      <div className={`p-3 sm:p-4 border flex flex-wrap gap-1.5 sm:gap-2 text-xs transition-colors duration-300 ${cardBg}`}>
        {['all', 'Pending Payment', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Paid', 'Refunded'].map((status) => (
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

      {/* Orders & Payments Table */}
      <div className={`border overflow-hidden transition-colors duration-300 ${cardBg}`}>
        {loading ? (
          <div className={`py-20 text-center text-xs uppercase tracking-widest animate-pulse ${textSub}`}>
            Loading Customer Orders & Razorpay Transactions...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`py-16 text-center text-xs ${textSub}`}>No orders found for this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead>
                <tr className={`border-b ${borderLine} ${textSub} uppercase tracking-widest ${isWhite ? 'bg-stone-50' : 'bg-stone-900/60'}`}>
                  <th className="p-3 sm:p-4">Order Ref & Date</th>
                  <th className="p-3 sm:p-4">Customer Details</th>
                  <th className="p-3 sm:p-4">Ordered Items</th>
                  <th className="p-3 sm:p-4">Amount</th>
                  <th className="p-3 sm:p-4">Payment Info</th>
                  <th className="p-3 sm:p-4">Order Pipeline</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isWhite ? 'divide-stone-200' : 'divide-stone-800/60'}`}>
                {filteredOrders.map((order) => {
                  const isPaid = order.payment?.status === 'Paid';
                  const isRefunded = order.payment?.status === 'Refunded';

                  return (
                    <tr key={order.id || order.orderNumber} className={isWhite ? 'hover:bg-stone-50/80' : 'hover:bg-stone-900/40'}>
                      {/* Ref & Date */}
                      <td className="p-3 sm:p-4">
                        <strong className="font-mono text-xs sm:text-sm text-[#C5A059] block font-bold">{order.orderNumber}</strong>
                        <span className={`text-[10px] ${textSub}`}>{new Date(order.createdAt || '').toLocaleDateString()}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-3 sm:p-4">
                        <strong className={`block ${textTitle}`}>{order.customer.name}</strong>
                        <span className={`block font-mono text-[11px] ${textSub}`}>{order.customer.phone}</span>
                        {order.customer.city && <span className={`text-[10px] ${textSub}`}>{order.customer.city}</span>}
                      </td>

                      {/* Items */}
                      <td className="p-3 sm:p-4">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className={isWhite ? 'text-stone-800' : 'text-stone-300'}>
                              <strong>{item.productName}</strong> ({item.size} x {item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className={`p-3 sm:p-4 font-bold font-serif ${textTitle}`}>
                        {formatPrice(order.pricing.grandTotal)}
                      </td>

                      {/* Payment Status & Details */}
                      <td className="p-3 sm:p-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRefunded
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : order.payment?.status === 'Failed'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {order.payment?.status || 'Pending'}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase ${textSub}`}>
                            ({order.payment?.method || 'UPI'})
                          </span>
                        </div>

                        {order.payment?.paymentId && (
                          <div className={`text-[10px] font-mono ${textSub}`}>
                            Pay ID: {order.payment.paymentId}
                          </div>
                        )}
                        {order.payment?.orderId && (
                          <div className={`text-[9px] font-mono opacity-70 ${textSub}`}>
                            Gateway Order: {order.payment.orderId}
                          </div>
                        )}
                      </td>

                      {/* Order Status Select */}
                      <td className="p-3 sm:p-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id || order._id || '', e.target.value as OrderStatus)}
                          className={`text-xs font-semibold py-1.5 px-2 focus:outline-none transition-colors border ${
                            isWhite
                              ? 'bg-white border-stone-300 text-stone-900'
                              : 'bg-stone-900 border-stone-800 text-[#C5A059]'
                          }`}
                        >
                          <option value="Pending Payment">Pending Payment</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Ready to Ship">Ready to Ship</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions (Refund Trigger) */}
                      <td className="p-3 sm:p-4 text-right">
                        {isPaid && !isRefunded && (
                          <button
                            onClick={() => setRefundModalOrder(order)}
                            className="bg-purple-900 hover:bg-purple-800 text-purple-100 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}
                        {isRefunded && (
                          <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                            Refunded ({formatPrice(order.payment?.refundAmount || order.pricing.grandTotal)})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RAZORPAY REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full p-6 border shadow-2xl space-y-4 ${isWhite ? 'bg-white border-stone-300 text-stone-900' : 'bg-[#141312] border-stone-800 text-white'}`}>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-base font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#C5A059]" /> Issue Official Razorpay Refund
              </h3>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <strong className="font-mono">{refundModalOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <strong>{refundModalOrder.customer.name} ({refundModalOrder.customer.phone})</strong>
              </div>
              <div className="flex justify-between">
                <span>Razorpay Payment ID:</span>
                <strong className="font-mono">{refundModalOrder.payment?.paymentId || 'N/A'}</strong>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 font-serif text-sm">
                <span>Refund Amount:</span>
                <strong className="text-[#C5A059]">{formatPrice(refundModalOrder.pricing.grandTotal)}</strong>
              </div>
            </div>

            <form onSubmit={handleIssueRefund} className="space-y-4 pt-2">
              <div>
                <label className="text-[11px] uppercase font-semibold block mb-1">Reason for Refund (Optional)</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer cancelled order / size out of stock"
                  className={`w-full text-xs p-2.5 border focus:outline-none focus:border-[#C5A059] ${isWhite ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-800'}`}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="px-4 py-2 text-xs uppercase font-semibold border border-stone-300 hover:bg-stone-100 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="px-5 py-2 text-xs uppercase font-bold bg-purple-900 hover:bg-purple-800 text-white shadow-md transition-all"
                >
                  {isRefunding ? 'Executing Refund...' : 'Confirm Razorpay Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

