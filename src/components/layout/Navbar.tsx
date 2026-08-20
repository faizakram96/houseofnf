'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import SearchModal from '@/components/layout/SearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Kurta Sets', href: '/shop?category=kurta-sets' },
    { name: 'Kurtas', href: '/shop?category=kurtas' },
    { name: 'New Arrivals', href: '/shop?new=true' },
    { name: 'About', href: '/about' },
  ];

  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-[#141312] text-[#F3EBDD] text-[10px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-2">
        <span>Complimentary Express Shipping on Orders Above ₹2,999</span>
        <span className="hidden sm:inline text-[#C5A059]">•</span>
        <span className="hidden sm:inline text-amber-200/80">Crafted with Luxury Indian Weaves</span>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-nav shadow-sm border-b border-stone-200/60 py-3'
            : 'bg-[#FAF9F6] border-b border-stone-200/40 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-stone-800 hover:text-[#C5A059] transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>

            {/* Left Nav Links - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8 text-xs uppercase tracking-widest font-medium">
              {navLinks.slice(0, 3).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`transition-all duration-300 relative py-1 hover:text-[#C5A059] ${
                      isActive ? 'text-[#C5A059] font-semibold' : 'text-stone-700'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C5A059] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Center Brand Title / Logo */}
            <div className="text-center flex-shrink-0 min-w-0">
              <Link href="/" className="inline-block group">
                <span className="font-serif text-lg sm:text-2xl lg:text-3xl tracking-[0.12em] sm:tracking-[0.2em] font-semibold uppercase text-stone-950 block group-hover:text-[#C5A059] transition-colors duration-300 whitespace-nowrap">
                  HOUSE OF NF
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.35em] text-[#C5A059] uppercase block font-medium -mt-1 whitespace-nowrap">
                  FLAGSHIP ATELIER • JAIPUR
                </span>
              </Link>
            </div>

            {/* Right Nav Links & Action Icons */}
            <div className="flex items-center space-x-1 sm:space-x-3 lg:space-x-4 flex-shrink-0">
              {/* Desktop Additional Links */}
              <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8 text-xs uppercase tracking-widest font-medium mr-2">
                {navLinks.slice(3).map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`transition-all duration-300 hover:text-[#C5A059] ${
                        isActive ? 'text-[#C5A059] font-semibold' : 'text-stone-700'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 text-stone-700 hover:text-[#C5A059] transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 sm:p-2 text-stone-700 hover:text-[#C5A059] transition-colors relative flex items-center gap-1.5"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="bg-[#C5A059] text-stone-950 font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF9F6] border-r border-stone-200 p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                <span className="font-serif text-lg font-bold uppercase tracking-widest text-stone-950">
                  HOUSE OF NF
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-stone-600 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-6 space-y-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block text-xs uppercase tracking-[0.2em] font-medium py-2 transition-colors ${
                        isActive ? 'text-[#C5A059] font-bold' : 'text-stone-800 hover:text-[#C5A059]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-stone-200 text-center space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 block">
                FLAGSHIP ATELIER • JAIPUR
              </span>
              <p className="text-[10px] text-stone-400">Curated Indian Fashion Destination</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
