'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Product } from '@/types';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminInventoryPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

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

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 border flex items-center justify-between transition-colors duration-300 ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-lg sm:text-xl font-bold ${textTitle}`}>Inventory & Variant Stock Management</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Real-time control over size-level stock quantities (S to XXL).
          </p>
        </div>
      </div>

      <div className={`border overflow-hidden transition-colors duration-300 ${cardBg}`}>
        {loading ? (
          <div className={`py-20 text-center text-xs uppercase tracking-widest animate-pulse ${textSub}`}>
            Loading Inventory Data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead>
                <tr className={`border-b ${borderLine} ${textSub} uppercase tracking-widest ${isWhite ? 'bg-stone-50' : 'bg-stone-900/60'}`}>
                  <th className="p-3 sm:p-4">Product Name</th>
                  <th className="p-3 sm:p-4">SKU</th>
                  <th className="p-3 sm:p-4">Size Variant Stock Breakdown</th>
                  <th className="p-3 sm:p-4 text-right">Total Stock</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isWhite ? 'divide-stone-200' : 'divide-stone-800/60'}`}>
                {products.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

                  return (
                    <tr key={p.id || p._id} className={isWhite ? 'hover:bg-stone-50/80' : 'hover:bg-stone-900/40'}>
                      <td className={`p-3 sm:p-4 font-serif text-sm font-semibold ${textTitle}`}>{p.name}</td>
                      <td className="p-3 sm:p-4 font-mono text-[#C5A059] font-medium">{p.sku}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex flex-wrap gap-2">
                          {p.variants.map((v) => {
                            const isLow = v.stock <= 3;
                            return (
                              <div
                                key={v.size}
                                className={`p-2 border text-center text-[11px] font-semibold min-w-[70px] transition-colors ${
                                  isLow
                                    ? isWhite
                                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                                      : 'bg-amber-950/60 border-amber-800 text-amber-300'
                                    : isWhite
                                    ? 'bg-stone-100 border-stone-200 text-stone-900'
                                    : 'bg-stone-900 border-stone-800 text-stone-200'
                                }`}
                              >
                                <span className={`block text-[10px] uppercase ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>Size {v.size}</span>
                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                  <button
                                    onClick={() => handleStockUpdate(p.id || p._id || '', v.size, Math.max(0, v.stock - 1))}
                                    className={`w-4 h-4 flex items-center justify-center font-bold text-xs transition-colors ${
                                      isWhite
                                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                                    }`}
                                  >
                                    -
                                  </button>
                                  <span className="font-mono">{v.stock}</span>
                                  <button
                                    onClick={() => handleStockUpdate(p.id || p._id || '', v.size, v.stock + 1)}
                                    className={`w-4 h-4 flex items-center justify-center font-bold text-xs transition-colors ${
                                      isWhite
                                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-900'
                                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                                    }`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className={`p-3 sm:p-4 text-right font-bold text-xs sm:text-sm ${textTitle}`}>{totalStock} Units</td>
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
