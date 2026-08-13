'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Product } from '@/types';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdate = async (productId: string, size: string, newStock: number) => {
    const targetProduct = products.find((p) => (p.id || p._id) === productId);
    if (!targetProduct) return;

    const updatedVariants = targetProduct.variants.map((v) => {
      if (v.size === size) return { ...v, stock: newStock };
      return v;
    });

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: updatedVariants }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => ((p.id || p._id) === productId ? { ...p, variants: updatedVariants } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#141312] p-6 border border-stone-800 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-white">Inventory & Variant Stock Management</h1>
          <p className="text-xs text-stone-400 font-light mt-1">
            Real-time control over size-level stock quantities (S to XXL).
          </p>
        </div>
      </div>

      <div className="bg-[#141312] border border-stone-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-widest text-stone-500 animate-pulse">
            Loading Inventory Data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-widest bg-stone-900/60">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Size Variant Stock Breakdown</th>
                  <th className="p-4 text-right">Total Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {products.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

                  return (
                    <tr key={p.id || p._id} className="hover:bg-stone-900/40">
                      <td className="p-4 font-serif text-sm font-semibold text-stone-200">{p.name}</td>
                      <td className="p-4 font-mono text-[#C5A059]">{p.sku}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {p.variants.map((v) => (
                            <div
                              key={v.size}
                              className={`p-2 border text-center text-[11px] font-semibold min-w-[70px] ${
                                v.stock <= 3
                                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                                  : 'bg-stone-900 border-stone-800 text-stone-200'
                              }`}
                            >
                              <span className="block text-[10px] text-stone-400 uppercase">Size {v.size}</span>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <button
                                  onClick={() => handleStockUpdate(p.id || p._id || '', v.size, Math.max(0, v.stock - 1))}
                                  className="w-4 h-4 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center rounded-none"
                                >
                                  -
                                </button>
                                <span>{v.stock}</span>
                                <button
                                  onClick={() => handleStockUpdate(p.id || p._id || '', v.size, v.stock + 1)}
                                  className="w-4 h-4 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center rounded-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-sm text-stone-200">{totalStock} Units</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
