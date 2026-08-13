'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageCircle } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
            THE HOUSE STORY
          </span>
          <h1 className="font-serif text-4xl font-bold text-stone-900">About House of NF</h1>
          <p className="text-xs text-stone-500 mt-3 font-light">Timeless Indian Elegance, Reimagined.</p>
        </div>

        <div className="bg-white border border-stone-200 p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000"
              alt="House of NF Atelier"
              className="w-full h-96 object-cover"
            />
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-stone-900">A Heritage of Grace & Craftsmanship</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                House of NF was born from a passion for preserving traditional Indian textile heritage while redefining it for modern luxury fashion. Specialized in handcrafted Kurta Sets and Kurtas, our atelier blends handloom Chanderi silk, Lucknowi Chikankari, and intricate Zardosi needlework into featherlight, elegant silhouettes.
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Each garment is individually cut, tailored, and inspected by master karigars in New Delhi, ensuring unparalleled finish and regal comfort for festive soirees, weddings, and everyday elegance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
