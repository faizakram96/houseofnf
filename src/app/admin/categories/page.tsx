'use client';

import React, { useEffect, useState } from 'react';
import { Plus, FolderTree, CheckCircle } from 'lucide-react';
import { Category } from '@/types';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminCategoriesPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      const json = await res.json();
      if (json.success) {
        setNewCatName('');
        setNewCatDesc('');
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-stone-200 focus:border-[#C5A059]';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className={`p-4 sm:p-6 border flex items-center justify-between transition-colors duration-300 ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-lg sm:text-xl font-bold ${textTitle}`}>Categories Management</h1>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Dynamic categories powering customer navigation & filters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Create Form */}
        <form onSubmit={handleCreateCategory} className={`p-4 sm:p-6 border space-y-4 transition-colors duration-300 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase text-[#C5A059] pb-2 border-b ${borderLine}`}>
            Add New Category
          </h3>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Category Name *</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Sarees or Anarkali Sets"
              className={`w-full text-xs p-3 focus:outline-none transition-colors ${inputBg}`}
            />
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Description</label>
            <textarea
              rows={3}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short category description..."
              className={`w-full text-xs p-3 focus:outline-none transition-colors ${inputBg}`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> Save Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className={`md:col-span-2 p-4 sm:p-6 border space-y-4 transition-colors duration-300 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase pb-2 border-b ${textTitle} ${borderLine}`}>
            Existing Active Categories ({categories.length})
          </h3>

          {loading ? (
            <div className={`py-8 text-center text-xs animate-pulse ${textSub}`}>Loading Categories...</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id || cat._id}
                  className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isWhite ? 'bg-stone-50 border-stone-200' : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div>
                    <h4 className={`font-serif text-sm font-bold ${textTitle}`}>{cat.name}</h4>
                    <p className={`text-xs font-mono mt-0.5 ${textSub}`}>Slug: /{cat.slug}</p>
                    {cat.description && <p className={`text-xs mt-1 ${textSub}`}>{cat.description}</p>}
                  </div>
                  <span className="self-start sm:self-auto text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-2 py-0.5 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
