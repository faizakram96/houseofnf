'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit3, Trash2, Eye, CheckCircle, XCircle, Archive, RotateCcw, ShieldAlert } from 'lucide-react';
import { Product, ProductStatus } from '@/types';
import { formatPrice } from '@/lib/utils';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminProductsPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ALL');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Modal Actions
  const [archiveTargetProduct, setArchiveTargetProduct] = useState<Product | null>(null);
  const [restoreTargetProduct, setRestoreTargetProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?admin=true&status=${statusTab}`);
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
  }, [statusTab]);

  const executeArchive = async (p: Product) => {
    const targetId = p.id || (p as any)._id || p.slug;
    if (!targetId) return;

    setActionLoading(true);
    setProducts((prev) => prev.map((item) => (item.id === targetId || (item as any)._id === targetId ? { ...item, status: 'ARCHIVED', flags: { ...item.flags, isActive: false } } : item)));
    setArchiveTargetProduct(null);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      } else {
        alert(`Archive failed: ${json.error || 'Unable to archive product'}`);
        fetchProducts();
      }
    } catch (e: any) {
      alert(`Archive error: ${e.message}`);
      fetchProducts();
    } finally {
      setActionLoading(false);
    }
  };

  const executeRestore = async (p: Product) => {
    const targetId = p.id || (p as any)._id || p.slug;
    if (!targetId) return;

    setActionLoading(true);
    setProducts((prev) => prev.map((item) => (item.id === targetId || (item as any)._id === targetId ? { ...item, status: 'ACTIVE', flags: { ...item.flags, isActive: true } } : item)));
    setRestoreTargetProduct(null);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      } else {
        alert(`Restore failed: ${json.error || 'Unable to restore product'}`);
        fetchProducts();
      }
    } catch (e: any) {
      alert(`Restore error: ${e.message}`);
      fetchProducts();
    } finally {
      setActionLoading(false);
    }
  };

  const executePermanentDelete = async (productToDelete: Product) => {
    const targetId = productToDelete.id || (productToDelete as any)._id || productToDelete.slug;
    if (!targetId) return;

    setActionLoading(true);
    setProducts((prev) => prev.filter((item) => item.id !== targetId && (item as any)._id !== targetId && item.slug !== targetId));
    setDeleteConfirmProduct(null);

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}?permanent=true`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
      } else {
        alert(`Permanent delete failed: ${json.error || 'Unable to delete product'}`);
        fetchProducts();
      }
    } catch (e: any) {
      alert(`Delete error: ${e.message || 'Server connection failed'}`);
      fetchProducts();
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusTab === 'ALL') return true;
    const currentStatus = p.status || (p.flags.isActive ? 'ACTIVE' : 'INACTIVE');
    return currentStatus === statusTab;
  });

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
            Single source of truth architecture with full product lifecycle management (Active, Inactive, Archived).
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-6 py-3 flex items-center justify-center gap-2 transition-colors self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create New Product
        </Link>
      </div>

      {/* Lifecycle Status Tabs */}
      <div className={`p-4 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBg}`}>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {(['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const).map((tab) => {
            const isActive = statusTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                  isActive
                    ? 'bg-[#C5A059] text-stone-950 border-[#C5A059] shadow-sm'
                    : isWhite
                    ? 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                {tab === 'ALL' && 'All Products'}
                {tab === 'ACTIVE' && 'Active Storefront'}
                {tab === 'INACTIVE' && 'Draft / Inactive'}
                {tab === 'ARCHIVED' && 'Archived Products'}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
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
      </div>

      {/* Table */}
      <div className={`border overflow-hidden ${cardBg}`}>
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
            Loading Atelier Products from Production Database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            No products found in <strong className="font-semibold">{statusTab}</strong> status.
          </div>
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
                  <th className="p-4">Lifecycle Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderLine}`}>
                {filteredProducts.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  const mainImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80';
                  const currentStatus: ProductStatus = p.status || (p.flags?.isActive ? 'ACTIVE' : 'INACTIVE');

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
                        {currentStatus === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 font-semibold">
                            <CheckCircle className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                        {currentStatus === 'INACTIVE' && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-stone-100 text-stone-600 border border-stone-300 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800 px-2 py-0.5 font-semibold">
                            <XCircle className="w-3 h-3" /> INACTIVE
                          </span>
                        )}
                        {currentStatus === 'ARCHIVED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 px-2 py-0.5 font-semibold">
                            <Archive className="w-3 h-3" /> ARCHIVED
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

                          {currentStatus === 'ARCHIVED' ? (
                            <>
                              <button
                                onClick={() => setRestoreTargetProduct(p)}
                                className="p-1.5 border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300 transition-colors"
                                title="Restore to Active Storefront"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmProduct(p)}
                                className="p-1.5 border bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-900 dark:text-red-300 transition-colors"
                                title="Permanently Delete from Database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setArchiveTargetProduct(p)}
                              className={`p-1.5 border transition-colors ${
                                isWhite ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-stone-900 border-stone-800 text-amber-400 hover:text-amber-300'
                              }`}
                              title="Archive Product (Hide from Public Site)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Archive Modal */}
      {archiveTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md p-6 sm:p-8 border shadow-2xl space-y-6 ${cardBg}`}>
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif text-lg font-bold ${textTitle}`}>Archive Product</h3>
                <p className={`text-xs ${textSub}`}>Production Lifecycle Action</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs ${textTitle}`}>
                Are you sure you want to archive <strong className="font-semibold text-amber-600 dark:text-amber-400">"{archiveTargetProduct.name}"</strong> (SKU: {archiveTargetProduct.sku})?
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                This product will be hidden from the public website storefront and moved to your <strong>Archived Products</strong> tab. Historical order data will remain preserved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setArchiveTargetProduct(null)}
                disabled={actionLoading}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => executeArchive(archiveTargetProduct)}
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-950 bg-[#C5A059] hover:bg-[#B38E46] shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <span>Archiving...</span> : <><Archive className="w-3.5 h-3.5" /><span>Confirm Archive</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {restoreTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md p-6 sm:p-8 border shadow-2xl space-y-6 ${cardBg}`}>
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif text-lg font-bold ${textTitle}`}>Restore Product</h3>
                <p className={`text-xs ${textSub}`}>Production Lifecycle Action</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs ${textTitle}`}>
                Restore <strong className="font-semibold text-emerald-600 dark:text-emerald-400">"{restoreTargetProduct.name}"</strong> (SKU: {restoreTargetProduct.sku}) back to active storefront?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setRestoreTargetProduct(null)}
                disabled={actionLoading}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => executeRestore(restoreTargetProduct)}
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <span>Restoring...</span> : <><RotateCcw className="w-3.5 h-3.5" /><span>Confirm Restore</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`relative w-full max-w-md p-6 sm:p-8 border shadow-2xl space-y-6 ${cardBg}`}>
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif text-lg font-bold ${textTitle}`}>Permanent Delete</h3>
                <p className={`text-xs ${textSub}`}>Irreversible Database Operation</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs ${textTitle}`}>
                Are you sure you want to PERMANENTLY remove <strong className="font-semibold text-red-600 dark:text-red-400">"{deleteConfirmProduct.name}"</strong> (SKU: {deleteConfirmProduct.sku}) from MongoDB?
              </p>
              <p className="text-[11px] text-red-500 font-light">
                This will hard-delete the record from MongoDB Atlas. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={actionLoading}
                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  isWhite ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => executePermanentDelete(deleteConfirmProduct)}
                disabled={actionLoading}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Hard Delete</span>
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
