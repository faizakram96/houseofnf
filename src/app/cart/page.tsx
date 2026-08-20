'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, freeShippingThreshold } = useCart();
  const router = useRouter();

  const shipping = subtotal >= freeShippingThreshold ? 0 : 150;
  const discount = 0;
  const grandTotal = subtotal + shipping - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAF9F6] py-24 flex items-center justify-center text-center px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-12 border border-stone-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 text-[#C5A059] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-1">
              ATELIER SHOPPING BAG
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">Your Shopping Cart is Empty</h1>
            <p className="text-xs text-stone-500 font-light mt-2">
              Discover our handcrafted Jaipur collection and add your favorite pieces.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all shadow-lg"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb / Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block">
            STEP 1 OF 3 — SHOPPING BAG
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">Your Shopping Cart</h1>
          <p className="text-xs text-stone-500 font-light">
            Review your selected curated pieces before proceeding to guest checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Cart Items List (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="font-serif text-lg font-bold uppercase text-stone-900">
                Selected Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
              <Link href="/shop" className="text-xs text-[#C5A059] hover:underline font-semibold uppercase tracking-wider">
                + Add More Items
              </Link>
            </div>

            <div className="divide-y divide-stone-200">
              {cart.map((item) => {
                const itemKey = `${item.product.id || item.product._id}-${item.selectedSize}`;
                const itemTotal = item.product.pricing.price * item.quantity;
                const productId = item.product.id || item.product._id || '';

                return (
                  <div key={itemKey} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    {/* Item Image */}
                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                      <img
                        src={item.product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80'}
                        alt={item.product.name}
                        className="w-20 h-28 object-cover object-top bg-stone-100 border border-stone-200 shadow-sm hover:opacity-90 transition-opacity"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 space-y-1.5 min-w-0 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-serif text-sm font-semibold text-stone-900 hover:text-[#C5A059] transition-colors truncate">
                            {item.product.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeFromCart(productId, item.selectedSize)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 font-mono text-[10px] uppercase font-bold border border-stone-200">
                          Size: {item.selectedSize}
                        </span>
                        {item.selectedColor && (
                          <span className="text-stone-500">Color: {item.selectedColor}</span>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-stone-300 bg-stone-50">
                          <button
                            onClick={() => updateQuantity(productId, item.selectedSize, item.quantity - 1)}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-stone-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(productId, item.selectedSize, item.quantity + 1)}
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <span className="font-serif text-sm font-bold text-stone-900 block">
                            {formatPrice(itemTotal)}
                          </span>
                          <span className="text-[10px] text-stone-400 font-light">
                            {formatPrice(item.product.pricing.price)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Atelier Quality Trust Badges */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>Quality Checked — Jaipur Atelier</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>Insured Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold uppercase text-stone-900 pb-4 border-b border-stone-200">
                Order Summary
              </h2>

              <div className="py-6 space-y-3 text-xs text-stone-600 border-b border-stone-200">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {subtotal < freeShippingThreshold && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 border border-amber-200 font-light leading-relaxed">
                    Add {formatPrice(freeShippingThreshold - subtotal)} more to qualify for <strong>FREE Express Shipping</strong>!
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-between items-baseline text-stone-900">
                <span className="font-serif text-base font-bold uppercase">Total Amount</span>
                <span className="font-serif text-2xl font-bold text-[#C5A059]">{formatPrice(grandTotal)}</span>
              </div>
              <p className="text-[10px] text-stone-400 font-light text-right pt-0.5">Includes all applicable taxes</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-200">
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <Link
                  href="/shop"
                  className="inline-block text-xs uppercase tracking-wider text-stone-500 hover:text-[#C5A059] transition-colors py-1"
                >
                  ← Continue Shopping
                </Link>
                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>256-Bit SSL Encrypted & Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
