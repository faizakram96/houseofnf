'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Product, ProductImage } from '@/types';
import QuickViewModal from '@/components/product/QuickViewModal';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [product, setProduct] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (json.success) {
          setProduct(json.data);
        } else {
          router.push('/admin/products');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, router]);

  const handleStockChange = (index: number, stock: number) => {
    if (!product?.variants) return;
    const updated = [...product.variants];
    updated[index].stock = stock;
    setProduct({ ...product, variants: updated });
  };

  const handleImagesChange = (updatedImages: ProductImage[]) => {
    if (!product) return;
    setProduct({ ...product, images: updatedImages });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.name || !product.pricing?.price) {
      alert('Please fill in product name and price.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/admin/products');
      } else {
        alert('Failed to update product: ' + json.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
        Loading Product for Editing...
      </div>
    );
  }

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-stone-200 focus:border-[#C5A059]';
  const borderHeader = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Bar */}
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
            <h1 className={`font-serif text-lg sm:text-xl font-bold ${isWhite ? 'text-stone-900' : 'text-white'}`}>Edit Product</h1>
            <p className={`text-xs ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>
              Update details & uploaded images for <strong className="text-[#C5A059]">{product.name}</strong>
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
            <Save className="w-4 h-4" /> {isSaving ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveProduct} className="space-y-8">
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            1. Product Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Product Title *
              </label>
              <input
                type="text"
                required
                value={product.name || ''}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                SKU Code
              </label>
              <input
                type="text"
                value={product.sku || ''}
                onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                className={`w-full text-xs font-mono p-3 focus:outline-none text-[#C5A059] ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Price (₹) *
              </label>
              <input
                type="number"
                required
                value={product.pricing?.price || 0}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    pricing: { ...product.pricing!, price: parseFloat(e.target.value) || 0 },
                  })
                }
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isWhite ? 'text-stone-700' : 'text-stone-400'}`}>
                Compare At Price (MRP ₹)
              </label>
              <input
                type="number"
                value={product.pricing?.compareAtPrice || ''}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    pricing: { ...product.pricing!, compareAtPrice: parseFloat(e.target.value) || undefined },
                  })
                }
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>
        </div>

        {/* Stock Variants */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            2. Stock Inventory per Variant
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {product.variants?.map((v, idx) => (
              <div
                key={v.size}
                className={`p-3 border text-center ${
                  isWhite ? 'bg-stone-50 border-stone-300' : 'bg-stone-900 border-stone-800'
                }`}
              >
                <span className="text-xs font-bold text-[#C5A059] block mb-1">Size {v.size}</span>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => handleStockChange(idx, parseInt(e.target.value, 10) || 0)}
                  className={`w-full text-center text-xs p-1.5 focus:outline-none border ${
                    isWhite ? 'bg-white border-stone-300 text-stone-900' : 'bg-stone-950 border-stone-800 text-stone-200'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Image Gallery Upload */}
        <div className={`p-6 border space-y-4 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderHeader}`}>
            3. Direct Device Image Uploads
          </h3>

          <FileUpload
            images={product.images || []}
            onChange={handleImagesChange}
            theme={theme}
          />
        </div>
      </form>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <QuickViewModal
          product={product as Product}
          isOpen={true}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
