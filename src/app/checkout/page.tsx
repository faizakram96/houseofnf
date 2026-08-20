'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, MessageCircle, ArrowRight, CheckCircle2, CreditCard, Wallet, Banknote, AlertTriangle, MapPin, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getWhatsAppCartUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Dynamically loads the official Razorpay Checkout SDK Script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, subtotal, clearCart, freeShippingThreshold } = useCart();
  const router = useRouter();

  // Guest Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    houseNo: '',
    street: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'whatsapp'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Indian PIN Code Auto-Lookup State
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{
    valid: boolean;
    message: string;
    city?: string;
    state?: string;
  } | null>(null);

  const shipping = subtotal >= freeShippingThreshold ? 0 : 150;
  const grandTotal = subtotal + shipping;

  // Indian PIN Code lookup handler
  const handlePincodeChange = async (val: string) => {
    const cleanPincode = val.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleanPincode }));

    if (cleanPincode.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`);
        const data = await res.json();

        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const fetchedCity = po.District || po.Block || po.Circle || 'Jaipur';
          const fetchedState = po.State || 'Rajasthan';

          setFormData((prev) => ({
            ...prev,
            city: fetchedCity,
            state: fetchedState,
          }));

          setPincodeStatus({
            valid: true,
            message: `Delivery Available: ${fetchedCity}, ${fetchedState}`,
            city: fetchedCity,
            state: fetchedState,
          });
        } else if (/^[1-9][0-9]{5}$/.test(cleanPincode)) {
          setPincodeStatus({
            valid: true,
            message: 'Valid 6-Digit Indian PIN Code Format (Delivery Available)',
          });
        } else {
          setPincodeStatus({
            valid: false,
            message: 'Invalid Indian PIN Code. Delivery service unconfirmed.',
          });
        }
      } catch (err) {
        if (/^[1-9][0-9]{5}$/.test(cleanPincode)) {
          setPincodeStatus({
            valid: true,
            message: 'Valid 6-Digit Indian PIN Code Format (Delivery Available)',
          });
        } else {
          setPincodeStatus({
            valid: false,
            message: 'Please enter a valid 6-digit Indian PIN Code.',
          });
        }
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg('Mobile number is required for order delivery updates.');
      return;
    }

    if (!formData.houseNo.trim() || !formData.street.trim()) {
      setErrorMsg('Please enter your complete delivery street address.');
      return;
    }

    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      setErrorMsg('A valid 6-digit Indian PIN Code is required.');
      return;
    }

    if (pincodeStatus && !pincodeStatus.valid) {
      setErrorMsg('Invalid PIN Code. Please correct your PIN Code before proceeding.');
      return;
    }

    if (!formData.city.trim() || !formData.state.trim()) {
      setErrorMsg('City and State are required for shipping.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setIsSubmitting(true);

    const fullStreetAddress = `${formData.houseNo}, ${formData.street}${formData.landmark ? `, Landmark: ${formData.landmark}` : ''}`;

    const customerPayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: fullStreetAddress,
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      state: formData.state.trim(),
      country: formData.country,
    };

    try {
      if (paymentMethod === 'razorpay') {
        // --- 1. RAZORPAY ONLINE PAYMENT FLOW ---
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          setErrorMsg('Failed to load Razorpay Payment Gateway SDK. Please check your internet connection.');
          setIsSubmitting(false);
          return;
        }

        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerPayload,
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
            notes: formData.notes,
            paymentMethod: 'upi',
          }),
        });

        const json = await res.json();
        if (!json.success || !json.razorpayOrder) {
          throw new Error(json.error || 'Failed to initialize payment gateway.');
        }

        const { razorpayOrder, order } = json;

        // Launch Official Razorpay Modal
        const options = {
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'House of NF',
          description: `Order ${order.orderNumber} - Curated Women's Fashion`,
          image: '/images/house-story-craft.jpg',
          order_id: razorpayOrder.id,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#C5A059',
          },
          handler: async function (response: any) {
            // --- 2. SERVER-SIDE SIGNATURE VERIFICATION ---
            try {
              setIsSubmitting(true);
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  dbOrderId: order.id,
                  paymentMethod: 'upi',
                }),
              });

              const verifyJson = await verifyRes.json();
              if (verifyJson.success) {
                setConfirmedOrder(verifyJson.data || {
                  orderNumber: order.orderNumber || `HNF-${Math.floor(10000 + Math.random() * 90000)}`,
                  customer: customerPayload,
                  pricing: { grandTotal },
                  items: cart,
                  payment: { status: 'Paid', method: 'Online (Razorpay)', paymentId: response.razorpay_payment_id },
                });
                clearCart();
              } else {
                setErrorMsg(verifyJson.error || 'Payment signature verification failed.');
              }
            } catch (err: any) {
              setErrorMsg('Payment verification exception: ' + err.message);
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setErrorMsg(`Payment Failed: ${response.error?.description || 'Transaction declined'}`);
          setIsSubmitting(false);
        });

        rzp.open();
      } else {
        // --- 2. WHATSAPP ORDER FLOW ---
        const orderPayload = {
          customer: customerPayload,
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
          pricing: { subtotal, discount: 0, shipping, tax: 0, grandTotal },
          payment: { gateway: 'whatsapp', method: 'whatsapp', status: 'Pending' },
          orderStatus: 'Pending Payment',
          source: 'Website',
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        const json = await res.json();
        if (json.success) {
          setConfirmedOrder(json.data);
          clearCart();
        } else {
          setErrorMsg(json.error || 'Failed to reserve order.');
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      if (paymentMethod !== 'razorpay') {
        setIsSubmitting(false);
      }
    }
  };

  // --- ORDER CONFIRMATION SCREEN ---
  if (confirmedOrder) {
    const isPaid = confirmedOrder.payment?.status === 'Paid';

    const orderRef = confirmedOrder.orderNumber || `HNF-${Math.floor(10000 + Math.random() * 90000)}`;

    const whatsappItems = (confirmedOrder.items || []).map((i: any) => ({
      name: i.productName,
      sku: i.sku,
      size: i.size,
      quantity: i.quantity,
      price: i.unitPrice,
    }));
    const waUrl = getWhatsAppCartUrl(whatsappItems, confirmedOrder.pricing?.grandTotal || grandTotal);

    return (
      <div className="min-h-screen bg-[#FAF9F6] py-16 flex items-center justify-center">
        <div className="max-w-xl w-full mx-4 bg-white p-8 sm:p-12 border border-stone-200 shadow-2xl text-center space-y-6">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-1">
              {isPaid ? 'PAYMENT VERIFIED & ORDER CONFIRMED' : 'ORDER RESERVED'}
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Thank You, {confirmedOrder.customer?.name}!
            </h1>
            <p className="text-xs text-stone-500 mt-1 font-mono">
              Order ID: <strong className="text-stone-900 font-bold">{orderRef}</strong>
            </p>
          </div>

          <div className="bg-stone-50 p-5 border border-stone-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Order Amount:</span>
              <strong className="text-stone-900 text-sm font-serif">{formatPrice(confirmedOrder.pricing?.grandTotal || grandTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Method:</span>
              <span className="font-semibold uppercase text-stone-800">{isPaid ? 'Online Payment (Razorpay)' : 'WhatsApp Order'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Status:</span>
              <span className={`font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {confirmedOrder.payment?.status || 'Paid'}
              </span>
            </div>
            {confirmedOrder.payment?.paymentId && (
              <div className="flex justify-between">
                <span className="text-stone-500">Razorpay Payment ID:</span>
                <span className="font-mono text-[11px] text-stone-700">{confirmedOrder.payment.paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Delivery Mobile:</span>
              <span className="font-mono text-stone-900 font-semibold">{confirmedOrder.customer?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Delivery Address:</span>
              <span className="text-stone-800 text-right font-medium max-w-[240px] truncate">{confirmedOrder.customer?.address ? `${confirmedOrder.customer.address}, ${confirmedOrder.customer.city} (${confirmedOrder.customer.pincode})` : 'Jaipur'}</span>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {isPaid
              ? 'Your order has been confirmed. Our atelier team will begin preparing your quality-checked items for express dispatch.'
              : 'Your order reference has been created. Connect with atelier support on WhatsApp if you require instant updates.'}
          </p>

          <div className="space-y-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs uppercase tracking-widest py-4 px-6 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Support on WhatsApp
            </a>

            <Link
              href="/shop"
              className="block text-center text-xs uppercase tracking-widest text-stone-600 hover:text-[#C5A059] py-2"
            >
              Continue Shopping
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
    <div className="min-h-screen bg-[#FAF9F6] py-12 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block">
            GUEST CHECKOUT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">Address & Payment Details</h1>
          <p className="text-xs text-stone-500 font-light pt-1">Fast guest checkout — no account creation required.</p>
        </div>

        {errorMsg && (
          <div className="mb-8 max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Customer & Shipping Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-stone-200 space-y-6 shadow-sm">
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
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 96642 09989"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
                <span className="text-[10px] text-stone-400 font-light mt-0.5 block">Used for delivery updates & OTP updates</span>
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
              2. Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">House / Flat / Building No. *</label>
                <input
                  type="text"
                  required
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  placeholder="Flat 402, Sunshine Apartments"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Street / Area *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Malviya Nagar"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near World Trade Park"
                className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Indian PIN Code Validation & Auto-Lookup Section */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block">PIN Code *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 302017 or 110001"
                  className={`w-full bg-stone-50 border text-xs p-3 focus:outline-none ${
                    pincodeStatus
                      ? pincodeStatus.valid
                        ? 'border-emerald-500 focus:border-emerald-600'
                        : 'border-red-500 focus:border-red-600'
                      : 'border-stone-300 focus:border-[#C5A059]'
                  }`}
                />
                {pincodeLoading && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin" />
                  </div>
                )}
              </div>

              {pincodeStatus && (
                <div className={`text-[11px] font-medium flex items-center gap-1.5 ${pincodeStatus.valid ? 'text-emerald-700' : 'text-red-600'}`}>
                  {pincodeStatus.valid ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{pincodeStatus.message}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Jaipur"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Rajasthan"
                  className="w-full bg-stone-50 border border-stone-300 text-xs p-3 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block mb-1">Country</label>
                <input
                  type="text"
                  readOnly
                  value={formData.country}
                  className="w-full bg-stone-100 border border-stone-300 text-xs p-3 text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* PAYMENT METHOD SELECTION */}
            <h3 className="font-serif text-base font-bold uppercase text-stone-900 pb-3 border-b border-stone-200 pt-4">
              3. Payment Method
            </h3>

            <div className="space-y-3">
              {/* Razorpay Online Payment Option */}
              <label
                className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#C5A059] bg-[#C5A059]/5 ring-1 ring-[#C5A059]'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-1 accent-[#C5A059]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                      Online Payment (Razorpay)
                    </span>
                    <span className="bg-[#C5A059] text-stone-950 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-light mt-1">
                    Pay securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Net Banking & Wallets.
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-stone-600">
                    <CreditCard className="w-4 h-4 text-[#C5A059]" />
                    <Wallet className="w-4 h-4 text-[#C5A059]" />
                    <Banknote className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-[10px] text-stone-400 font-mono">100% Encrypted & Verified</span>
                  </div>
                </div>
              </label>

              {/* WhatsApp Order Option */}
              <label
                className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                  paymentMethod === 'whatsapp'
                    ? 'border-[#C5A059] bg-[#C5A059]/5 ring-1 ring-[#C5A059]'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  className="mt-1 accent-[#C5A059]"
                />
                <div>
                  <span className="font-semibold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#128C7E]" /> WhatsApp Direct Order
                  </span>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Reserve items and complete ordering directly via WhatsApp consultation.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-stone-200 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="font-serif text-base font-bold uppercase text-stone-900 pb-3 border-b border-stone-200 mb-6">
                Order Summary ({cart.length})
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-4 text-xs">
                    <img src={item.product.images[0]?.url} alt="" className="w-12 h-16 object-cover bg-stone-100 border border-stone-200" />
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
                className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-semibold text-xs uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? 'Initializing Payment...'
                  : paymentMethod === 'razorpay'
                  ? `Pay ${formatPrice(grandTotal)} Now`
                  : 'Reserve on WhatsApp'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Bank-grade 256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


