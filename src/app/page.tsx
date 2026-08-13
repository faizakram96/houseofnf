'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Award, Compass, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import InstagramFeed from '@/components/home/InstagramFeed';
import { Product } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'kurta-sets' | 'kurtas'>('all');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // High-fashion women's ethnic wear editorial hero images
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop',
      title: 'Royal Chanderi Silk Set',
    },
    {
      url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2000&auto=format&fit=crop',
      title: 'Lucknowi Chikankari Kurta',
    },
    {
      url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=2000&auto=format&fit=crop',
      title: 'Heritage Velvet Brocade',
    },
  ];

  // Auto-advance background imagery gently
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?limit=8');
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load home products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) =>
          activeCategory === 'kurta-sets' ? p.categoryId === 'cat-kurta-sets' : p.categoryId === 'cat-kurtas'
        );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900">
      {/* --- TIMELESS INDIAN ELEGANCE (MINIMAL CINEMATIC HERO SECTION) --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#141312] text-[#F3EBDD] py-20">
        {/* Ambient Background Ken Burns Imagery */}
        <div className="absolute inset-0 z-0 opacity-40 overflow-hidden">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${
                idx === currentImageIdx ? 'opacity-100 scale-105 animate-kenburns' : 'opacity-0 scale-100'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/60 to-[#141312]/30" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Centered Minimal Brand Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-7 animate-fade-in-up">
          {/* Atelier Badge */}
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HERITAGE WOMEN'S ATELIER • FESTIVE 2026</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Timeless Indian <br />
              <span className="gold-gradient-text font-serif italic font-normal">Elegance.</span>
            </h1>
            <p className="text-xs sm:text-sm tracking-[0.25em] text-amber-200/90 font-light uppercase">
              Handcrafted Couture for the Modern Woman
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed max-w-xl mx-auto">
            Discover the art of pure Chanderi Silk Kurta Sets, Zardosi hand embroidery, and Lucknowi Chikankari motifs. Tailored to perfection for royal celebrations and timeless occasions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/shop?category=kurta-sets"
              className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] px-9 py-4 text-center transition-all duration-300 shadow-xl shadow-[#C5A059]/20 flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              <span>Shop Kurta Sets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop?category=kurtas"
              className="border border-[#F3EBDD]/40 hover:border-[#C5A059] text-white hover:text-[#C5A059] font-semibold text-xs uppercase tracking-[0.2em] px-9 py-4 text-center transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Explore Kurtas</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-stone-800/80 flex items-center justify-center gap-8 text-[11px] font-medium tracking-wider text-stone-400">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C5A059]" />
              <span>Pure Chanderi Silk</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Zardosi Handwork</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C5A059]" />
              <span>Artisan Crafted</span>
            </div>
          </div>
        </div>
      </section>

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
                100% Authentic Handcraft
              </h3>
              <p className="text-xs text-stone-500 font-light mt-0.5">Crafted by master Indian artisans</p>
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
            Handcrafted Kurta Sets & Kurtas tailored for royal celebrations, festive family gatherings, and everyday elegance.
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

      {/* --- INSTAGRAM FEED SECTION ("FOLLOW OUR STYLE") --- */}
      <InstagramFeed />
    </div>
  );
}
