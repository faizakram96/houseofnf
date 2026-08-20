'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Mail, ArrowRight } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/houseofnf.in';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919664209989';

  return (
    <footer className="bg-[#141312] text-[#F3EBDD] py-10 sm:py-14 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Core Footer Navigation & Brand Details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 text-left">
          {/* Brand Info Column */}
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <div>
              <span className="font-serif text-lg sm:text-xl tracking-[0.15em] font-semibold text-white uppercase block">
                HOUSE OF NF
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-[#C5A059] uppercase block font-semibold -mt-0.5">
                LUXURY INDIAN WOMEN'S WEAR
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed font-light max-w-sm">
              A thoughtfully curated fashion destination for the modern woman. Discover stylish, quality Kurta Sets and ethnic fashion.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#128C7E] flex items-center justify-center text-stone-300 hover:text-white transition-colors"
                title="WhatsApp Direct Support"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-[#C5A059] flex items-center justify-center text-stone-300 hover:text-stone-950 transition-colors"
                title="Instagram Profile"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:thehouseofnf@gmail.com"
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-amber-600 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
                title="Email Support"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">
              Collections
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-stone-400 font-light">
              <li>
                <Link href="/shop?category=kurta-sets" className="hover:text-white transition-colors">
                  Royal Kurta Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kurtas" className="hover:text-white transition-colors">
                  Designer Kurtas
                </Link>
              </li>
              <li>
                <Link href="/shop?new=true" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true" className="hover:text-white transition-colors">
                  Festive Selection
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care Column */}
          <div className="col-span-1">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">
              Client Care
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-stone-400 font-light">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About House of NF
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Visits
                </Link>
              </li>
              <li>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Size Consultation
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="col-span-2 lg:col-span-1 space-y-2.5">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-3">
              The House Gazette
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed font-light">
              Subscribe to receive private invitations to new collection previews & trunk shows.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative pt-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-stone-900 border border-stone-800 text-[11px] sm:text-xs text-white placeholder-stone-500 py-2.5 px-3.5 pr-9 focus:outline-none focus:border-[#C5A059]"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C5A059] hover:text-white pt-1">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-stone-500 gap-3 text-center sm:text-left">
          <p>© 2026 HOUSE OF NF. All Rights Reserved. Crafted for Luxury Indian Women's Fashion.</p>
          <div className="flex items-center gap-4 text-stone-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Worldwide Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
