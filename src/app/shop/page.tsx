'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product, Category } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const isNewArrivals = searchParams.get('new') === 'true';
  const isFeatured = searchParams.get('featured') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const catRes = await fetch('/api/categories');
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data);

        let url = `/api/products?sortBy=${sortBy}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (isNewArrivals) url += `&new=true`;
        if (isFeatured) url += `&featured=true`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const prodRes = await fetch(url);
        const prodJson = await prodRes.json();
        if (prodJson.success) setProducts(prodJson.data);
      } catch (err) {
        console.error('Failed to load shop items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, sortBy, searchQuery, isNewArrivals, isFeatured]);

  // Client-side size filter
  const displayedProducts = selectedSize
    ? products.filter((p) => p.variants.some((v) => v.size === selectedSize && v.stock > 0))
    : products;

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
            CURATED CATALOGUE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            {selectedCategory === 'kurta-sets'
              ? 'Kurta Sets Collection'
              : selectedCategory === 'kurtas'
              ? 'Kurtas Collection'
              : isNewArrivals
              ? 'New Arrivals 2026'
              : isFeatured
              ? 'Festive Collection'
              : 'Shop All Indian Ethnic Wear'}
          </h1>
          <p className="text-xs text-stone-500 mt-2 font-light">
            Showing {displayedProducts.length} curated fashion pieces.
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="bg-white border border-stone-200 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full bg-stone-50 border border-stone-200 text-xs py-2 pl-9 pr-4 focus:outline-none focus:border-[#C5A059]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="md:hidden flex items-center gap-2 border border-stone-300 px-4 py-2 text-xs font-semibold uppercase text-stone-800"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 uppercase tracking-widest hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-xs text-stone-900 py-2 px-3 focus:outline-none focus:border-[#C5A059] font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Filter Sidebar Desktop */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 border border-stone-200 h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" /> Filters
              </h3>
              {(selectedCategory || selectedSize || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-stone-900"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-800 mb-3">Categories</h4>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`block w-full text-left py-1.5 px-2 transition-colors ${
                    selectedCategory === '' ? 'bg-[#141312] text-[#F3EBDD] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`block w-full text-left py-1.5 px-2 transition-colors ${
                      selectedCategory === cat.slug ? 'bg-[#141312] text-[#F3EBDD] font-semibold' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-800 mb-3">Size Availability</h4>
              <div className="flex flex-wrap gap-2">
                {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className={`w-9 h-9 border text-xs font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-[#C5A059] text-white border-[#C5A059]'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-stone-200 h-96 animate-pulse" />
                ))}
              </div>
            ) : displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 text-center py-16 px-4">
                <h3 className="font-serif text-lg font-semibold text-stone-800 mb-2">No Products Match Your Filter</h3>
                <p className="text-xs text-stone-500 mb-6">Try resetting filters or adjusting search keywords.</p>
                <button
                  onClick={resetFilters}
                  className="bg-[#141312] text-[#F3EBDD] text-xs uppercase tracking-widest px-6 py-3 font-medium hover:bg-[#C5A059] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center text-xs uppercase tracking-widest">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
