'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle, ArrowRight, ShoppingBag, Heart, CheckCircle2 } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';

export default function AboutPage() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/houseofnf.in';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919664209989';

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 sm:py-16 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Header / Brand Positioning */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold block">
            ABOUT HOUSE OF NF
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
            Elevating Modern Women's Fashion
          </h1>
          <p className="font-serif text-base sm:text-xl text-[#C5A059] italic font-medium">
            "A thoughtfully curated fashion destination for the modern woman."
          </p>
        </div>

        {/* Content Section: Story & Brand Experience */}
        <div className="bg-white border border-stone-200 p-6 sm:p-10 lg:p-14 shadow-sm space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Feature Image */}
            <div className="lg:col-span-5 relative group overflow-hidden border border-stone-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
                alt="House of NF Curated Collection"
                className="w-full aspect-[3/4] object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-5 left-4 right-4 text-center">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold block">
                  CURATED WITH ELEGANCE
                </span>
                <p className="text-xs text-stone-100 font-serif italic mt-0.5">
                  Thoughtfully Selected for Every Occasion
                </p>
              </div>
            </div>

            {/* Right Brand Story Column */}
            <div className="lg:col-span-7 space-y-6 text-stone-700 leading-relaxed text-sm sm:text-base">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 mb-2">
                  Who We Are
                </h2>
                <p className="text-stone-700 font-light leading-relaxed">
                  House of NF is a modern online fashion brand dedicated to celebrating the style, grace, and individuality of today’s woman. Born out of a passion for refined aesthetics and effortless wearability, we bring together a curated collection of beautiful clothing designed to elevate your everyday and festive wardrobe.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 mb-2">
                  What We Offer
                </h2>
                <p className="text-stone-700 font-light leading-relaxed">
                  Our collections feature a carefully selected range of stylish <strong className="font-semibold text-stone-900">Kurta Sets, Kurtas, and ethnic fashion</strong> that harmoniously blend traditional charm with contemporary trends. Each piece in our collection is chosen with key priorities in mind: superior style, exceptional quality, lasting comfort, and attention to detail.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 mb-2">
                  Why House of NF?
                </h2>
                <p className="text-stone-700 font-light leading-relaxed">
                  We believe that discovering and shopping for fashion should be a joyful and inspiring experience. By offering high-quality, fashion-forward choices alongside a seamless online platform and friendly customer support, House of NF brings elevated fashion directly to your doorstep.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Value Pillars Grid */}
          <div className="pt-8 border-t border-stone-200">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                The House of NF Experience
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">
                What sets our destination apart
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#FAF9F6] p-6 border border-stone-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#C5A059] mx-auto shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Curated Selection
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Hand-selected pieces chosen for timeless charm, modern silhouettes, and current fashion trends.
                </p>
              </div>

              <div className="bg-[#FAF9F6] p-6 border border-stone-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#C5A059] mx-auto shadow-sm">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Quality & Comfort
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Focusing on premium feel, comfortable fits, and elegant craftsmanship details you will love.
                </p>
              </div>

              <div className="bg-[#FAF9F6] p-6 border border-stone-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#C5A059] mx-auto shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Seamless Shopping
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  An easy, enjoyable online browsing experience with quick delivery and dedicated assistance.
                </p>
              </div>

              <div className="bg-[#FAF9F6] p-6 border border-stone-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#C5A059] mx-auto shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-stone-900 uppercase tracking-wider">
                  Customer Focused
                </h4>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Direct support via WhatsApp and Instagram to help with sizing, styling, and inquiries.
                </p>
              </div>
            </div>
          </div>

          {/* Where to Shop & Connect Banner */}
          <div className="pt-8 border-t border-stone-200 text-center space-y-6">
            <div className="bg-[#141312] text-[#F3EBDD] p-6 sm:p-8 border border-stone-800 shadow-inner">
              <p className="font-serif text-sm sm:text-base lg:text-lg tracking-wider uppercase font-semibold text-[#C5A059]">
                Where to Discover & Shop Our Collections
              </p>
              <p className="text-xs sm:text-sm text-stone-300 font-light mt-2 max-w-xl mx-auto">
                Explore our full online catalog right here on our website or follow our official Instagram page for new arrivals, styling inspiration, and collection updates.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/shop"
                className="bg-[#141312] hover:bg-[#C5A059] text-white hover:text-stone-950 text-xs uppercase tracking-[0.2em] font-bold py-3.5 px-7 transition-all duration-300 flex items-center gap-2 shadow-md"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#E1306C] hover:bg-[#C13584] text-white text-xs uppercase tracking-widest font-bold py-3.5 px-6 flex items-center gap-2 transition-colors shadow-md"
              >
                <InstagramIcon className="w-4 h-4 text-white" /> Follow on Instagram
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#128C7E] hover:bg-[#075E54] text-white text-xs uppercase tracking-widest font-bold py-3.5 px-6 flex items-center gap-2 transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

