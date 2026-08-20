'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Award, Compass, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product, HeroBannerConfig } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'kurta-sets' | 'kurtas'>('all');

  // Hero Banner Dynamic Config State (with default fallback)
  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>({
    badgeText: "CURATED WOMEN'S WEAR • FESTIVE 2026",
    headingLine1: 'Timeless Indian',
    headingHighlight: 'Elegance.',
    subtitle: 'CURATED ELEGANCE FOR THE MODERN WOMAN',
    description:
      'Discover our thoughtfully curated collection of Kurta Sets, Kurtas, and elegant ethnic wear. Designed with attention to style, quality, comfort, and modern trends.',
    cta1Text: 'Shop Kurta Sets',
    cta1Link: '/shop?category=kurta-sets',
    cta2Text: 'Explore Kurtas',
    cta2Link: '/shop?category=kurtas',
    backgroundImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop',
    isActive: true,
  });

  useEffect(() => {
    async function loadHeroAndProducts() {
      try {
        const [heroRes, prodRes] = await Promise.all([
          fetch('/api/hero'),
          fetch('/api/products?limit=8'),
        ]);

        const heroJson = await heroRes.json();
        if (heroJson.success && heroJson.data) {
          setHeroConfig(heroJson.data);
        }

        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHeroAndProducts();
  }, []);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) =>
          activeCategory === 'kurta-sets' ? p.categoryId === 'cat-kurta-sets' : p.categoryId === 'cat-kurtas'
        );

  const defaultFallbackImage =
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop';
  const heroBgImage = heroConfig.backgroundImage || defaultFallbackImage;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
      {/* --- TIMELESS INDIAN ELEGANCE (DYNAMIC ADMIN-MANAGED HERO SECTION) --- */}
      {heroConfig.isActive && (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#141312] text-[#F3EBDD] py-20">
          {/* Ambient Dynamic Background Image */}
          <div className="absolute inset-0 z-0 opacity-45 overflow-hidden">
            <img
              src={heroBgImage}
              alt="House of NF Atelier Hero"
              style={{
                objectFit: heroConfig.transform?.objectFit ?? 'cover',
                objectPosition: heroConfig.transform
                  ? `${heroConfig.transform.positionX}% ${heroConfig.transform.positionY}%`
                  : '50% 50%',
                transform: heroConfig.transform
                  ? `scale(${heroConfig.transform.zoom}) rotate(${heroConfig.transform.rotation}deg)`
                  : 'scale(1.05)',
              }}
              className="absolute inset-0 w-full h-full transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/60 to-[#141312]/30" />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Centered Dynamic Brand Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-7 animate-fade-in-up">
            {/* Atelier Badge */}
            {heroConfig.badgeText && (
              <div className="inline-flex items-center gap-2 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroConfig.badgeText}</span>
              </div>
            )}

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
                {heroConfig.headingLine1 || 'Timeless Indian'} <br />
                <span className="gold-gradient-text font-serif italic font-normal">
                  {heroConfig.headingHighlight || 'Elegance.'}
                </span>
              </h1>
              {heroConfig.subtitle && (
                <p className="text-xs sm:text-sm tracking-[0.25em] text-amber-200/90 font-light uppercase">
                  {heroConfig.subtitle}
                </p>
              )}
            </div>

            {/* Subtitle / Description */}
            {heroConfig.description && (
              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-xl mx-auto">
                {heroConfig.description}
              </p>
            )}

            {/* Dynamic CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {heroConfig.cta1Text && (
                <Link
                  href={heroConfig.cta1Link || '/shop'}
                  className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] px-9 py-4 text-center transition-all duration-300 shadow-xl shadow-[#C5A059]/20 flex items-center justify-center gap-2 group w-full sm:w-auto"
                >
                  <span>{heroConfig.cta1Text}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {heroConfig.cta2Text && (
                <Link
                  href={heroConfig.cta2Link || '/shop'}
                  className="border border-[#F3EBDD]/40 hover:border-[#C5A059] text-white hover:text-[#C5A059] font-semibold text-xs uppercase tracking-[0.2em] px-9 py-4 text-center transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <span>{heroConfig.cta2Text}</span>
                </Link>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-[11px] font-medium tracking-wider text-stone-400">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C5A059]" />
                <span>Quality & Comfort</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Thoughtfully Curated</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C5A059]" />
                <span>Modern Indian Style</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- FEATURE HIGHLIGHTS BAR --- */}
      <section className="bg-white border-b border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 border-b md:border-b-0 md:border-r border-stone-200">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-stone-200 flex items-center justify-center text-[#C5A059] flex-shrink-0">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Complimentary Express Shipping
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">Free pan-India delivery on orders above ₹2,999</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border-b md:border-b-0 md:border-r border-stone-200">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-stone-200 flex items-center justify-center text-[#C5A059] flex-shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Thoughtfully Curated
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">Selected with style, quality & comfort in mind</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-stone-200 flex items-center justify-center text-[#C5A059] flex-shrink-0">
              <RefreshCw className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                Hassle-Free Exchanges
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">7-day size consultation & easy exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CURATED WOMEN'S PRODUCT COLLECTION --- */}
      <section id="collection" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#C5A059] font-bold block">
            WOMEN'S ETHNIC WEAR
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
            Curated Festive Collection
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
            Curated Kurta Sets & Kurtas selected for festive celebrations, family gatherings, and everyday elegance.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs uppercase tracking-widest px-6 py-2.5 transition-all font-medium ${
                activeCategory === 'all'
                  ? 'bg-[#141312] text-[#F3EBDD] font-bold shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              All Designs ({products.length})
            </button>

            <button
              onClick={() => setActiveCategory('kurta-sets')}
              className={`text-xs uppercase tracking-widest px-6 py-2.5 transition-all font-medium ${
                activeCategory === 'kurta-sets'
                  ? 'bg-[#141312] text-[#F3EBDD] font-bold shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              Kurta Sets
            </button>

            <button
              onClick={() => setActiveCategory('kurtas')}
              className={`text-xs uppercase tracking-widest px-6 py-2.5 transition-all font-medium ${
                activeCategory === 'kurtas'
                  ? 'bg-[#141312] text-[#F3EBDD] font-bold shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              Kurtas
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse rounded-none" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 uppercase tracking-wider">
            No products available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 text-xs font-bold uppercase tracking-[0.2em] px-10 py-4 transition-all duration-300 shadow-xl"
          >
            <span>Explore Entire Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
