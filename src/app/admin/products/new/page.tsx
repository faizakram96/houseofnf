'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Product, ProductImage } from '@/types';
import QuickViewModal from '@/components/product/QuickViewModal';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function NewProductPage() {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: `HNF-KS-${Math.floor(100 + Math.random() * 900)}`,
    categoryId: 'cat-kurta-sets',
    categoryName: 'Kurta Sets',
    description: '',
    shortDescription: '',
    pricing: {
      price: 3499,
      compareAtPrice: 4499,
      currency: 'INR',
    },
    attributes: {
      fabric: 'Chanderi Silk',
      pattern: 'Zardosi Hand Embroidery',
      occasion: 'Festive & Soirees',
      sleeveType: '3/4 Sleeves',
      fit: 'Relaxed Tailored Fit',
      careInstructions: 'Dry Clean Only',
    },
    variants: [
      { sku: `HNF-SKU-S`, size: 'S', color: 'Gold Ivory', stock: 10, price: 3499 },
      { sku: `HNF-SKU-M`, size: 'M', color: 'Gold Ivory', stock: 15, price: 3499 },
      { sku: `HNF-SKU-L`, size: 'L', color: 'Gold Ivory', stock: 8, price: 3499 },
      { sku: `HNF-SKU-XL`, size: 'XL', color: 'Gold Ivory', stock: 5, price: 3499 },
      { sku: `HNF-SKU-XXL`, size: 'XXL', color: 'Gold Ivory', stock: 2, price: 3499 },
    ],
    images: [],
    flags: {
      isActive: true,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
    },
    seo: {
      title: '',
      description: '',
    },
  });

  const handleStockChange = (index: number, stock: number) => {
    const updated = [...(formData.variants || [])];
    updated[index].stock = stock;
    setFormData({ ...formData, variants: updated });
  };

  const handleImagesChange = (updatedImages: ProductImage[]) => {
    setFormData({ ...formData, images: updatedImages });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pricing?.price) {
      alert('Please fill in product name and price.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/admin/products');
      } else {
        alert('Failed to save product: ' + json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-stone-200 focus:border-[#C5A059]';
  const borderHeader = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Action Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border ${cardBg}`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/admin/products"
            className={`p-2 border transition-colors flex-shrink-0 ${
              isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`font-serif text-lg sm:text-xl font-bold ${isWhite ? 'text-stone-900' : 'text-white'}`}>Create New Product</h1>
            <p className={`text-xs ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>
              Add a luxury Kurta or Kurta Set to the House of NF catalogue.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className={`font-semibold text-xs uppercase tracking-widest px-3 sm:px-4 py-2.5 flex items-center justify-center gap-1.5 border transition-colors flex-1 sm:flex-none ${
              isWhite ? 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200' : 'bg-stone-900 border-stone-700 text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Eye className="w-4 h-4 text-[#C5A059]" /> Preview
          </button>

          <button
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 shadow-lg flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Publishing...' : 'Save Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveProduct} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            1. Product Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Silk Zardosi Kurta Set"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={`w-full text-xs font-mono p-3 focus:outline-none text-[#C5A059] ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const catId = e.target.value;
                  const catName = catId === 'cat-kurta-sets' ? 'Kurta Sets' : 'Kurtas';
                  setFormData({ ...formData, categoryId: catId, categoryName: catName });
                }}
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              >
                <option value="cat-kurta-sets">Kurta Sets</option>
                <option value="cat-kurtas">Kurtas</option>
              </select>
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="e.g. Chanderi silk with organza dupatta."
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
              Full Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of weave, hand embroidery, and fit..."
              className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
            />
          </div>
        </div>

        {/* Section 2: Pricing & Stock Variants */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            2. Pricing & Size Inventory Stock
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.pricing?.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing!, price: parseFloat(e.target.value) || 0 },
                  })
                }
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Compare At Price (Original MRP ₹)
              </label>
              <input
                type="number"
                value={formData.pricing?.compareAtPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing!, compareAtPrice: parseFloat(e.target.value) || undefined },
                  })
                }
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <label className={`text-xs uppercase tracking-wider font-semibold block mb-2 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
            Variant Inventory Stock by Size
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {formData.variants?.map((variant, idx) => (
              <div
                key={variant.size}
                className={`p-3 border text-center ${
                  isWhite ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-800'
                }`}
              >
                <span className="text-xs font-bold text-[#C5A059] block mb-1">Size {variant.size}</span>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => handleStockChange(idx, parseInt(e.target.value, 10) || 0)}
                  className={`w-full text-center text-xs p-1.5 focus:outline-none border ${
                    isWhite ? 'bg-white border-stone-300 text-stone-900' : 'bg-stone-950 border-stone-800 text-stone-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Product Image Uploads (Direct Device Upload & Drag Drop) */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            3. Upload Product Images (From Device)
          </h3>

          <FileUpload
            images={formData.images || []}
            onChange={handleImagesChange}
            theme={theme}
          />
        </div>

        {/* Section 4: Publishing Flags */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            4. Publishing Options
          </h3>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-xs ${isWhite ? 'text-stone-700' : 'text-stone-300'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.flags?.isActive}
                onChange={(e) => setFormData({ ...formData, flags: { ...formData.flags!, isActive: e.target.checked } })}
                className="w-4 h-4 accent-[#C5A059]"
              />
              <span>Active (Visible on Website)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.flags?.isFeatured}
                onChange={(e) => setFormData({ ...formData, flags: { ...formData.flags!, isFeatured: e.target.checked } })}
                className="w-4 h-4 accent-[#C5A059]"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.flags?.isNewArrival}
                onChange={(e) => setFormData({ ...formData, flags: { ...formData.flags!, isNewArrival: e.target.checked } })}
                className="w-4 h-4 accent-[#C5A059]"
              />
              <span>New Arrival Badge</span>
            </label>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <QuickViewModal
          product={formData as Product}
          isOpen={true}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
