'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getWhatsAppCartUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, subtotal, freeShippingThreshold } = useCart();

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  const whatsappItems = cart.map((item) => ({
    name: item.product.name,
    sku: item.product.sku,
    size: item.selectedSize,
    quantity: item.quantity,
    price: item.product.pricing.price,
  }));

  const whatsappCheckoutUrl = getWhatsAppCartUrl(whatsappItems, subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col justify-between border-l border-stone-200">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-serif text-lg font-semibold tracking-wider text-stone-900 uppercase">
                Your Shopping Bag ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F4F1EA] p-3 px-6 border-b border-stone-200/60">
            <p className="text-xs text-stone-700 font-medium mb-1.5 flex items-center justify-between">
              {subtotal >= freeShippingThreshold ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Unlocked Complimentary Express Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#C5A059]">{formatPrice(remainingForFreeShipping)}</strong> more for Free Shipping
                </span>
              )}
            </p>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C5A059] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">Your Bag is Empty</h3>
                <p className="text-xs text-stone-500 mb-6 max-w-xs">
                  Discover House of NF timeless Kurta Sets and Kurtas.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#141312] text-[#F3EBDD] text-xs uppercase tracking-widest px-6 py-3 font-medium hover:bg-[#C5A059] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              cart.map((item) => {
                const primaryImg =
                  item.product.images.find((img) => img.isPrimary)?.url ||
                  item.product.images[0]?.url ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80';
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-4 pb-6 border-b border-stone-200/70 last:border-none"
                  >
                    <img
                      src={primaryImg}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover bg-stone-100 flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id || item.product._id || '', item.selectedSize)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">SKU: {item.product.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 border border-stone-200">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-300 bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id || item.product._id || '',
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="px-2.5 py-0.5 text-stone-600 hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-semibold text-stone-800">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id || item.product._id || '',
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="px-2.5 py-0.5 text-stone-600 hover:bg-stone-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-[#C5A059]">
                          {formatPrice(item.product.pricing.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Controls */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Express Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '₹150'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 font-serif text-base font-semibold pt-2 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span className="text-[#C5A059]">{formatPrice(subtotal >= freeShippingThreshold ? subtotal : subtotal + 150)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs uppercase tracking-widest py-3.5 px-4 font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  Order Direct on WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-white text-xs uppercase tracking-widest py-3 px-4 font-medium flex items-center justify-center gap-2 transition-colors text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
