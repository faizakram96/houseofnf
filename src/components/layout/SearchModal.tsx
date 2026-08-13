'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '@/types';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] shadow-2xl overflow-hidden border border-stone-200 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C5A059]" />
          <form onSubmit={handleFullSearch} className="flex-1">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kurta Sets, Chanderi Silk, Chikankari..."
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 focus:outline-none text-base font-medium"
            />
          </form>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Searches */}
        {!query && (
          <div className="p-6">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-500 mb-3">Popular Searches</h4>
            <div className="flex flex-wrap gap-2">
              {['Kurta Sets', 'Chanderi Silk', 'Chikankari', 'Anarkali', 'Kurtas', 'Emerald Silk'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-xs bg-stone-100 hover:bg-[#C5A059] hover:text-white text-stone-700 px-3 py-1.5 transition-colors border border-stone-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query && (
          <div className="max-h-96 overflow-y-auto p-4">
            {loading ? (
              <div className="py-8 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
                Searching House of NF Collection...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((product) => (
                  <div
                    key={product.id || product._id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-4 p-2 hover:bg-stone-100 cursor-pointer transition-colors border-b border-stone-100 last:border-none"
                  >
                    <img
                      src={product.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80'}
                      alt={product.name}
                      className="w-12 h-16 object-cover bg-stone-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif text-sm font-medium text-stone-900">{product.name}</h4>
                      <p className="text-xs text-stone-500">{product.categoryName || 'Kurta Collection'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#C5A059]">₹{product.pricing.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-stone-500 text-xs uppercase tracking-wider">
                No luxury pieces found for "{query}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
