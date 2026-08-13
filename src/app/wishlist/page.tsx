'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold block mb-2">
            SAVED CREATIONS
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Your Saved Wishlist ({wishlist.length})</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-stone-200 text-center py-16 px-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
              <Heart className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-800 mb-2">Your Wishlist is Empty</h3>
            <p className="text-xs text-stone-500 mb-6">Explore House of NF collections and click the heart icon to save your favorite luxury ethnic pieces.</p>
            <Link
              href="/shop"
              className="bg-[#141312] text-[#F3EBDD] text-xs uppercase tracking-widest px-8 py-3.5 font-semibold hover:bg-[#C5A059] transition-colors inline-block"
            >
              Discover Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id || product._id} className="bg-white border border-stone-200 flex flex-col justify-between p-4">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
                  <img src={product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-600 hover:scale-110 transition-transform"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">{product.name}</h3>
                  <span className="text-xs font-bold text-[#C5A059] block my-1">{formatPrice(product.pricing.price)}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => addToCart(product, 'M', 1)}
                    className="flex-1 bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] text-xs uppercase tracking-widest py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
