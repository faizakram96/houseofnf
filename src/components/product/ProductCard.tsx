'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ShoppingBag, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import QuickViewModal from '@/components/product/QuickViewModal';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80';

  const secondaryImage =
    product.images[1]?.url ||
    primaryImage;

  const whatsappUrl = getWhatsAppUrl({
    productName: product.name,
    sku: product.sku,
    size: selectedSize,
    quantity: 1,
    price: product.pricing.price,
  });

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
              className="bg-white/90 hover:bg-white text-stone-900 text-xs font-medium px-3 py-2 flex items-center gap-1.5 backdrop-blur-md transition-all duration-200"
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

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-stone-900">{formatPrice(product.pricing.price)}</span>
              {product.pricing.compareAtPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.pricing.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Quick Add To Cart Button */}
            <button
              onClick={() => addToCart(product, selectedSize, 1)}
              className="p-2 text-stone-700 hover:text-[#C5A059] hover:bg-stone-50 rounded-full transition-colors"
              title="Add to Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
