'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, ShoppingBag, Eye, Sparkles, ArrowRight, X } from 'lucide-react';
import QuickViewModal from '@/components/product/QuickViewModal';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

// Fashion Reel Collection
const REEL_COLLECTION = [
  {
    id: 'reel-1',
    title: 'Zardosi Gold Chanderi Silk Set',
    category: 'Kurta Sets',
    price: 3499,
    compareAtPrice: 4499,
    videoUrl: 'https://cdn.pixabay.com/video/2020/11/04/54728-472714470_tiny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000',
    tag: 'FESTIVE EDIT',
    fabric: 'Pure Chanderi Silk',
    product: {
      id: 'prod-001',
      name: 'Royal Silk Zardosi Kurta Set',
      slug: 'royal-silk-zardosi-kurta-set',
      sku: 'HNF-KS-001',
      categoryId: 'cat-kurta-sets',
      categoryName: 'Kurta Sets',
      description: 'Handcrafted Chanderi silk kurta set adorned with intricate metallic Zardosi threadwork and organza dupatta.',
      shortDescription: 'Chanderi silk with organza dupatta.',
      pricing: { price: 3499, compareAtPrice: 4499, currency: 'INR' },
      variants: [
        { sku: 'HNF-KS-001-S', size: 'S', color: 'Gold Ivory', stock: 10, price: 3499 },
        { sku: 'HNF-KS-001-M', size: 'M', color: 'Gold Ivory', stock: 15, price: 3499 },
        { sku: 'HNF-KS-001-L', size: 'L', color: 'Gold Ivory', stock: 8, price: 3499 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000', altText: 'Front', sortOrder: 1, isPrimary: true },
      ],
      attributes: { fabric: 'Chanderi Silk', pattern: 'Zardosi', occasion: 'Festive' },
      flags: { isFeatured: true, isNewArrival: true, isBestSeller: false, isActive: true },
      seo: { title: 'Royal Silk Zardosi Kurta Set', description: 'Royal silk kurta set' },
    } as Product,
  },
  {
    id: 'reel-2',
    title: 'Lucknowi Chikankari Anarkali',
    category: 'Kurtas',
    price: 2799,
    compareAtPrice: 3499,
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/08/70477-535791240_tiny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000',
    tag: 'PASTEL ATELIER',
    fabric: 'Organza Chikankari',
    product: {
      id: 'prod-002',
      name: 'Lucknowi Rose Chikankari Kurta',
      slug: 'lucknowi-rose-chikankari-kurta',
      sku: 'HNF-K-002',
      categoryId: 'cat-kurtas',
      categoryName: 'Kurtas',
      description: 'Delicate hand-embroidered Lucknowi chikankari motif on soft pastel organza silk fabric.',
      shortDescription: 'Organza hand chikankari.',
      pricing: { price: 2799, compareAtPrice: 3499, currency: 'INR' },
      variants: [
        { sku: 'HNF-K-002-S', size: 'S', color: 'Rose Blush', stock: 12, price: 2799 },
        { sku: 'HNF-K-002-M', size: 'M', color: 'Rose Blush', stock: 20, price: 2799 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000', altText: 'Front', sortOrder: 1, isPrimary: true },
      ],
      attributes: { fabric: 'Organza Silk', pattern: 'Chikankari', occasion: 'Soiree' },
      flags: { isFeatured: true, isNewArrival: true, isBestSeller: true, isActive: true },
      seo: { title: 'Lucknowi Rose Chikankari Kurta', description: 'Chikankari kurta' },
    } as Product,
  },
  {
    id: 'reel-3',
    title: 'Emerald Heritage Velvet Kurta',
    category: 'Kurta Sets',
    price: 4299,
    compareAtPrice: 5499,
    videoUrl: 'https://cdn.pixabay.com/video/2021/01/21/62691-504780517_tiny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000',
    tag: 'ROYAL HEIRLOOM',
    fabric: 'Micro Velvet & Brocade',
    product: {
      id: 'prod-003',
      name: 'Emerald Royal Velvet Set',
      slug: 'emerald-royal-velvet-set',
      sku: 'HNF-KS-003',
      categoryId: 'cat-kurta-sets',
      categoryName: 'Kurta Sets',
      description: 'Rich royal emerald micro velvet kurta with antique gold zari embroidery.',
      shortDescription: 'Velvet zari kurta set.',
      pricing: { price: 4299, compareAtPrice: 5499, currency: 'INR' },
      variants: [
        { sku: 'HNF-KS-003-M', size: 'M', color: 'Emerald Green', stock: 5, price: 4299 },
        { sku: 'HNF-KS-003-L', size: 'L', color: 'Emerald Green', stock: 4, price: 4299 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000', altText: 'Front', sortOrder: 1, isPrimary: true },
      ],
      attributes: { fabric: 'Micro Velvet', pattern: 'Zari Embroidery', occasion: 'Weddings' },
      flags: { isFeatured: true, isNewArrival: false, isBestSeller: true, isActive: true },
      seo: { title: 'Emerald Royal Velvet Set', description: 'Emerald velvet set' },
    } as Product,
  },
];

export default function OutfitReelShowcase() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <section className="py-24 bg-[#141312] text-[#F3EBDD] border-t border-stone-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATELIER IN MOTION • REELS SHOWCASE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Shop The Outfit Reels
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
            Experience the drape, texture, and movement of our women's ethnic wear in dynamic motion photography.
          </p>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REEL_COLLECTION.map((reel) => {
            const isPlaying = playingId === reel.id;

            return (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] bg-stone-900 border border-stone-800/80 overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#C5A059]/60"
              >
                {/* Visual / Video Player */}
                {isPlaying ? (
                  <video
                    src={reel.videoUrl}
                    poster={reel.posterUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={reel.posterUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {/* Video Play / Pause Toggle Button Overlay */}
                <button
                  onClick={() => togglePlay(reel.id)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-[#C5A059] flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                  aria-label={isPlaying ? 'Pause Reel' : 'Play Reel'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-[#C5A059]" /> : <Play className="w-4 h-4 fill-[#C5A059] ml-0.5" />}
                </button>

                {/* Badge Tag */}
                <span className="absolute top-4 left-4 z-20 bg-[#C5A059] text-stone-950 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shadow-md">
                  {reel.tag}
                </span>

                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/20 to-transparent pointer-events-none" />

                {/* Bottom Content & Shop The Look Box */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-3 bg-gradient-to-t from-[#141312] via-[#141312]/95 to-transparent">
                  <span className="text-[10px] text-[#C5A059] uppercase tracking-widest font-mono block">
                    {reel.fabric}
                  </span>

                  <h3 className="font-serif text-lg font-bold text-white leading-snug">{reel.title}</h3>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-base font-bold text-[#C5A059]">{formatPrice(reel.price)}</span>
                    {reel.compareAtPrice && (
                      <span className="text-xs text-stone-500 line-through font-light">
                        {formatPrice(reel.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setQuickViewProduct(reel.product)}
                      className="flex-1 bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2]" /> BUY THIS LOOK
                    </button>

                    <button
                      onClick={() => setQuickViewProduct(reel.product)}
                      className="p-3 border border-stone-700 hover:border-[#C5A059] text-white hover:text-[#C5A059] bg-stone-900/80 transition-colors"
                      title="Quick View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={true}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
}
