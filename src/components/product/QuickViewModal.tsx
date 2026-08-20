'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, MessageCircle, Check, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!isOpen) return null;

  const activeImage = product.images[activeImgIndex]?.url || product.images[0]?.url;

  const whatsappUrl = getWhatsAppUrl({
    productName: product.name,
    sku: product.sku,
    size: selectedSize,
    quantity: 1,
    price: product.pricing.price,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden bg-[#FAF9F6] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-stone-200 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-stone-500 hover:text-stone-900 bg-white/80 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery Column */}
            <div className="p-6 bg-stone-100/60 flex flex-col justify-between">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-200 mb-4">
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-14 h-18 border-2 overflow-hidden flex-shrink-0 transition-all ${
                      activeImgIndex === idx ? 'border-[#C5A059]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details Column */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold block mb-1">
                  {product.categoryName || 'House of NF Atelier'}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-2">{product.name}</h2>
                <p className="text-xs text-stone-400 font-mono mb-4">SKU: {product.sku}</p>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl font-bold text-stone-900">{formatPrice(product.pricing.price)}</span>
                  {product.pricing.compareAtPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.pricing.compareAtPrice)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-6 line-clamp-3">{product.description}</p>

                {/* Attributes Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-100/70 p-3 mb-6 border border-stone-200">
                  <div>
                    <span className="text-stone-400 block">Fabric:</span>
                    <strong className="text-stone-800">{product.attributes.fabric}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Pattern:</span>
                    <strong className="text-stone-800">{product.attributes.pattern}</strong>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mb-6">
                  <label className="text-xs uppercase tracking-widest text-stone-700 font-semibold block mb-2">
                    Select Size
                  </label>
                  <div className="flex gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 border text-xs font-semibold uppercase transition-all ${
                          selectedSize === size
                            ? 'bg-[#141312] text-[#F3EBDD] border-[#141312]'
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart(product, selectedSize, 1);
                      onClose();
                      router.push('/cart');
                    }}
                    className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 text-xs uppercase tracking-widest py-3 px-4 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    BUY NOW
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs uppercase tracking-widest py-3 px-4 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="block text-center text-xs uppercase tracking-wider text-stone-600 hover:text-[#C5A059] py-1 underline font-medium"
                >
                  View Full Product Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
