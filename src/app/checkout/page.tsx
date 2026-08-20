'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getWhatsAppCartUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, freeShippingThreshold } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const shipping = subtotal >= freeShippingThreshold ? 0 : 150;
  const grandTotal = subtotal + shipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer: formData,
        items: cart.map((item) => ({
          productId: item.product.id || item.product._id,
          productName: item.product.name,
          sku: item.product.sku,
          size: item.selectedSize,
          color: item.selectedColor || 'Default',
          quantity: item.quantity,
          unitPrice: item.product.pricing.price,
          totalPrice: item.product.pricing.price * item.quantity,
          image: item.product.images[0]?.url,
        })),
        pricing: {
          subtotal,
          discount: 0,
          shipping,
          tax: 0,
          grandTotal,
        },
        payment: {
          method: 'WhatsApp',
          status: 'Pending',
        },
        source: 'Website',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedOrder(json.data);
        clearCart();
      }
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    const whatsappItems = createdOrder.items.map((i: any) => ({
      name: i.productName,
      sku: i.sku,
      size: i.size,
      quantity: i.quantity,
      price: i.unitPrice,
    }));
    const waUrl = getWhatsAppCartUrl(whatsappItems, createdOrder.pricing.grandTotal);

    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 flex items-center justify-center">
        <div className="max-w-xl w-full mx-4 bg-white p-8 sm:p-12 border border-stone-200 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
            ORDER RESERVED & CREATED
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Thank You, {createdOrder.customer.name}!</h1>
          <p className="text-xs text-stone-500 mb-4 font-mono">Order Reference: <strong>{createdOrder.orderNumber}</strong></p>

          <div className="bg-stone-50 p-4 border border-stone-200 text-left text-xs space-y-2 mb-8">
            <div className="flex justify-between">
              <span>Items Total ({createdOrder.items.length}):</span>
              <strong>{formatPrice(createdOrder.pricing.grandTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Phone Contact:</span>
              <strong>{createdOrder.customer.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-[#C5A059] font-semibold">Pending WhatsApp Confirmation</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            Your items are reserved. Click below to connect with House of NF on WhatsApp to complete payment and shipping details.
          </p>

          <div className="space-y-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs uppercase tracking-widest py-4 px-6 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Complete Order on WhatsApp
            </a>

            <Link
              href="/shop"
              className="block text-center text-xs uppercase tracking-widest text-stone-600 hover:text-[#C5A059] py-2"
            >
              Return to Shop Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-24 text-center">
        <h2 className="font-serif text-2xl text-stone-900 mb-4">Your Shopping Bag is Empty</h2>
        <Link href="/shop" className="bg-[#141312] text-[#F3EBDD] text-xs uppercase tracking-widest px-8 py-4 font-semibold">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-1">
            ATELIER CHECKOUT
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Delivery & Customer Details</h1>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Customer Details Input (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 border border-stone-200 space-y-6">
            <h3 className="font-serif text-base font-bold uppercase text-stone-900 pb-3 border-b border-stone-200">
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Roy"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 96642 09989"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ananya@example.com"
                className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <h3 className="font-serif text-base font-bold uppercase text-stone-900 pb-3 border-b border-stone-200 pt-4">
              2. Shipping Address
            </h3>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House/Flat No, Street Name, Landmark"
                className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Jaipur"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="302017"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-white p-8 border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-base font-bold uppercase text-stone-900 pb-3 border-b border-stone-200 mb-6">
                Order Summary ({cart.length})
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-4 text-xs">
                    <img src={item.product.images[0]?.url} alt="" className="w-12 h-16 object-cover bg-stone-100" />
                    <div className="flex-1">
                      <h4 className="font-serif font-semibold text-stone-900">{item.product.name}</h4>
                      <p className="text-stone-500">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-stone-900">{formatPrice(item.product.pricing.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-serif text-base font-semibold pt-3 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="text-[#C5A059]">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-semibold text-xs uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? 'Reserving Items...' : 'Create Order & Proceed to WhatsApp'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-stone-400 text-center">No online payment required now. Order confirmed directly with atelier staff.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
