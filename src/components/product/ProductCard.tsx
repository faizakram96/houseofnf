'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, MessageCircle, ArrowRight, X } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import QuickViewModal from '@/components/product/QuickViewModal';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSizeSelectOpen, setIsSizeSelectOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80';

  const secondaryImage = product.images[1]?.url || primaryImage;

  const whatsappUrl = getWhatsAppUrl({
    productName: product.name,
    sku: product.sku,
    size: selectedSize,
    quantity: 1,
    price: product.pricing.price,
  });

  const handleBuyNow = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    addToCart(product, size, 1);
    window.location.href = '/cart';
  };

  return (
    <>
      <div className="group relative flex flex-col bg-white border border-stone-200/60 overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-stone-300">
        {/* Product Image Wrapper */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
            />
            <img
              src={secondaryImage}
              alt={`${product.name} Hover`}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.flags.isNewArrival && (
              <span className="bg-[#141312] text-[#F3EBDD] text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold">
                New Arrival
              </span>
            )}
            {product.pricing.compareAtPrice && product.pricing.compareAtPrice > product.pricing.price && (
              <span className="bg-[#C5A059] text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold">
                Sale
              </span>
            )}
          </div>

          {/* Quick Actions Bar on Hover */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
            <button
              onClick={() => setIsQuickViewOpen(true)}
              className="bg-white/90 hover:bg-white text-stone-900 text-xs font-medium px-3 py-2 flex items-center gap-1.5 backdrop-blur-md transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
              Quick View
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-medium px-3 py-2 flex items-center gap-1.5 transition-all duration-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium block mb-1">
              {product.categoryName || 'Kurta Collection'}
            </span>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-serif text-sm font-semibold text-stone-900 hover:text-[#C5A059] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-light">{product.shortDescription}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-stone-900">{formatPrice(product.pricing.price)}</span>
              {product.pricing.compareAtPrice && (
                <span className="text-[11px] text-stone-400 line-through">
                  {formatPrice(product.pricing.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Responsive BUY NOW Button */}
            <button
              onClick={() => setIsSizeSelectOpen(true)}
              className="w-full sm:w-auto text-center whitespace-nowrap px-3.5 py-2 bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.15em] transition-all rounded shadow-sm cursor-pointer flex items-center justify-center gap-1"
            >
              <span>BUY NOW</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SIZE SELECTOR & BUY MODAL */}
      {isSizeSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white p-6 border border-stone-200 shadow-2xl space-y-5 text-stone-900">
            <button
              onClick={() => setIsSizeSelectOpen(false)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-center">
              <img src={primaryImage} alt="" className="w-14 h-18 object-cover bg-stone-100 border border-stone-200" />
              <div>
                <span className="text-[10px] uppercase text-[#C5A059] font-bold tracking-widest block">INSTANT CHECKOUT</span>
                <h4 className="font-serif text-sm font-bold text-stone-900 line-clamp-1">{product.name}</h4>
                <p className="text-xs font-bold text-stone-900 mt-0.5">{formatPrice(product.pricing.price)}</p>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-stone-700 block mb-2">
                Select Your Size
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-xs font-bold uppercase border transition-all ${
                      selectedSize === size
                        ? 'bg-[#141312] text-[#F3EBDD] border-[#141312]'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleBuyNow(selectedSize)}
              className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>PROCEED TO ADDRESS & PAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

