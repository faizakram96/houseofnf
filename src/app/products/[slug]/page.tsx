'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, MessageCircle, ShieldCheck, Truck, RefreshCw, Ruler, Check, ChevronRight, ArrowRight } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description');

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data);
        } else {
          router.push('/shop');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
          Loading Luxury Product Details...
        </div>
      </div>
    );
  }

  if (!product) return null;

  const selectedVariant = product.variants.find((v) => v.size === selectedSize);
  const currentStock = selectedVariant ? selectedVariant.stock : 10;

  const whatsappUrl = getWhatsAppUrl({
    productName: product.name,
    sku: product.sku,
    size: selectedSize,
    quantity,
    price: product.pricing.price,
  });

  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/houseofnf.in';

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-stone-500 mb-8 space-x-2 uppercase tracking-wider">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-stone-900">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-900 font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Gallery Thumbnails + Main View (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Gallery Thumbnails Column */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] flex-shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-20 border-2 overflow-hidden bg-stone-100 flex-shrink-0 transition-all ${
                    selectedImgIndex === idx ? 'border-[#C5A059]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="relative flex-1 aspect-[3/4] bg-stone-100 overflow-hidden shadow-sm group">
              <img
                src={product.images[selectedImgIndex]?.url || product.images[0]?.url}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right Product Specifications & Purchasing Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold block mb-1">
                  {product.categoryName || 'House of NF Atelier'}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-stone-400 font-mono">SKU: {product.sku}</p>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline justify-between pt-2 border-t border-stone-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-stone-900">{formatPrice(product.pricing.price)}</span>
                  {product.pricing.compareAtPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.pricing.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  {currentStock > 0 ? (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock ({currentStock} Available)
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">{product.shortDescription}</p>

              {/* Size Selector + Size Guide */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-stone-800 font-semibold">
                    Select Size
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Guide
                  </button>
                </div>

                <div className="flex gap-2">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 border text-xs font-semibold uppercase transition-all ${
                        selectedSize === size
                          ? 'bg-[#141312] text-[#F3EBDD] border-[#141312] shadow-md'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="pt-2 flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest text-stone-800 font-semibold">Quantity</span>
                <div className="flex items-center border border-stone-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-semibold text-stone-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="space-y-3 pt-6 border-t border-stone-200">
                <button
                  onClick={() => {
                    addToCart(product, selectedSize, quantity);
                    router.push('/checkout');
                  }}
                  className="w-full bg-[#141312] hover:bg-[#C5A059] text-[#F3EBDD] hover:text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                  BUY NOW
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 transition-colors shadow-md text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order on WhatsApp
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-stone-900 hover:bg-[#C5A059] text-white hover:text-stone-950 font-semibold text-xs uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    DM on Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Product Specifications & Tabs */}
            <div className="mt-10 pt-6 border-t border-stone-200">
              <div className="flex border-b border-stone-200 text-xs uppercase tracking-widest font-semibold gap-6 mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 transition-colors ${
                    activeTab === 'description' ? 'border-b-2 border-[#C5A059] text-[#C5A059]' : 'text-stone-500'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 transition-colors ${
                    activeTab === 'details' ? 'border-b-2 border-[#C5A059] text-[#C5A059]' : 'text-stone-500'
                  }`}
                >
                  Fabric & Craft
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-2 transition-colors ${
                    activeTab === 'care' ? 'border-b-2 border-[#C5A059] text-[#C5A059]' : 'text-stone-500'
                  }`}
                >
                  Care Instructions
                </button>
              </div>

              <div className="text-xs text-stone-600 leading-relaxed font-light">
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'details' && (
                  <ul className="space-y-2">
                    <li><strong>Fabric:</strong> {product.attributes.fabric}</li>
                    <li><strong>Pattern:</strong> {product.attributes.pattern}</li>
                    <li><strong>Occasion:</strong> {product.attributes.occasion}</li>
                    {product.attributes.sleeveType && <li><strong>Sleeves:</strong> {product.attributes.sleeveType}</li>}
                    {product.attributes.fit && <li><strong>Fit:</strong> {product.attributes.fit}</li>}
                  </ul>
                )}
                {activeTab === 'care' && (
                  <p>{product.attributes.careInstructions || 'Dry Clean Only. Store in breathable muslin bags away from direct light.'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)} />
          <div className="relative w-full max-w-lg bg-white p-6 shadow-2xl z-10 border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="font-serif text-base font-bold uppercase text-stone-900">House of NF Size Guide</h3>
              <button onClick={() => setIsSizeGuideOpen(false)} className="p-1 text-stone-500">✕</button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-900 border-b">
                  <th className="p-2.5 font-semibold">Size</th>
                  <th className="p-2.5 font-semibold">Bust (in)</th>
                  <th className="p-2.5 font-semibold">Waist (in)</th>
                  <th className="p-2.5 font-semibold">Hip (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr><td className="p-2.5 font-bold">S</td><td className="p-2.5">34</td><td className="p-2.5">28</td><td className="p-2.5">36</td></tr>
                <tr><td className="p-2.5 font-bold">M</td><td className="p-2.5">36</td><td className="p-2.5">30</td><td className="p-2.5">38</td></tr>
                <tr><td className="p-2.5 font-bold">L</td><td className="p-2.5">38</td><td className="p-2.5">32</td><td className="p-2.5">40</td></tr>
                <tr><td className="p-2.5 font-bold">XL</td><td className="p-2.5">40</td><td className="p-2.5">34</td><td className="p-2.5">42</td></tr>
                <tr><td className="p-2.5 font-bold">XXL</td><td className="p-2.5">42</td><td className="p-2.5">36</td><td className="p-2.5">44</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
