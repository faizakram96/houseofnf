'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit3, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminProductsPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const executeDelete = async (productToDelete: Product) => {
    const targetId = productToDelete.id || (productToDelete as any)._id || productToDelete.slug;
    if (!targetId) return;

    setIsDeleting(true);
    // Optimistic UI state removal for instant visual response
    setProducts((prev) => prev.filter((item) => item.id !== targetId && (item as any)._id !== targetId && item.slug !== targetId));
    setDeleteConfirmProduct(null);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      } else {
        alert(`Delete failed: ${json.error || 'Unable to delete product'}`);
        fetchProducts();
      }
    } catch (e: any) {
      alert(`Delete error: ${e.message || 'Server connection failed'}`);
      fetchProducts();
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-xl font-bold ${textTitle}`}>Products Management</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Create, update pricing, upload device image files, and control product availability dynamically.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-6 py-3 flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create New Product
        </Link>
      </div>

      {/* Filter Bar */}
      <div className={`p-4 border flex items-center justify-between gap-4 ${cardBg}`}>
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${textSub}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter products by Name or SKU..."
            className={`w-full text-xs p-2.5 pl-9 focus:outline-none focus:border-[#C5A059] border ${
              isWhite ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-200'
            }`}
          />
        </div>

        <span className={`text-xs font-mono ${textSub}`}>Total Items: {filteredProducts.length}</span>
      </div>

      {/* Table */}
      <div className={`border overflow-hidden ${cardBg}`}>
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
            Loading Atelier Products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b ${borderLine} ${textSub} uppercase tracking-widest ${isWhite ? 'bg-stone-50' : 'bg-stone-900/60'}`}>
                  <th className="p-4">Item</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderLine}`}>
                {filteredProducts.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                  const mainImg = p.images[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80';

                  return (
                    <tr key={p.id || p._id} className={isWhite ? 'hover:bg-stone-50' : 'hover:bg-stone-900/40'}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={mainImg} alt="" className="w-10 h-14 object-cover bg-stone-200 flex-shrink-0" />
                          <div>
                            <strong className={`font-serif text-sm font-semibold block ${textTitle}`}>{p.name}</strong>
                            <span className={`text-[10px] ${textSub}`}>{p.attributes?.fabric || 'Luxury Weave'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#C5A059]">{p.sku}</td>
                      <td className={`p-4 ${isWhite ? 'text-stone-700' : 'text-stone-300'}`}>{p.categoryName || 'Kurta Collection'}</td>
                      <td className={`p-4 font-semibold ${textTitle}`}>{formatPrice(p.pricing.price)}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${totalStock > 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {totalStock} Units
                        </span>
                      </td>
                      <td className="p-4">
                        {p.flags.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 font-semibold">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 border border-stone-300 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800 px-2 py-0.5 font-semibold">
                            <XCircle className="w-3 h-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className={`p-1.5 border transition-colors ${
                              isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                            }`}
                            title="Preview Customer View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/admin/products/${p.id || p._id}/edit`}
                            className={`p-1.5 border transition-colors ${
                              isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-[#C5A059] hover:text-stone-950' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-stone-950 hover:bg-[#C5A059]'
                            }`}
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            className={`p-1.5 border transition-colors ${
                              isWhite ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-red-300'
                            }`}
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md p-6 sm:p-8 border shadow-2xl space-y-6 ${cardBg}`}>
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif text-lg font-bold ${textTitle}`}>Delete Product</h3>
                <p className={`text-xs ${textSub}`}>Atelier Admin Confirmation</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs ${textTitle}`}>
                Are you sure you want to permanently remove <strong className="font-semibold text-red-600 dark:text-red-400">"{deleteConfirmProduct.name}"</strong> (SKU: {deleteConfirmProduct.sku})?
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                This product will be removed from your catalog, website storefront, and active collections immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={isDeleting}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => executeDelete(deleteConfirmProduct)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer View Live Preview Modal */}
      {previewProduct && (
        <QuickViewModal product={previewProduct} isOpen={true} onClose={() => setPreviewProduct(null)} />
      )}
    </div>
  );
}
