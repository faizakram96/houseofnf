'use client';

import React, { useEffect, useState } from 'react';
import { Plus, FolderTree, CheckCircle } from 'lucide-react';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-[#141312] p-6 border border-stone-800 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-white">Categories Management</h1>
          <p className="text-xs text-stone-400 font-light mt-1">
            Dynamic categories powering customer navigation & filters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Form */}
        <form onSubmit={handleCreateCategory} className="bg-[#141312] p-6 border border-stone-800 space-y-4">
          <h3 className="font-serif text-sm font-bold uppercase text-[#C5A059] pb-2 border-b border-stone-800">
            Add New Category
          </h3>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Sarees or Anarkali Sets"
              className="w-full bg-stone-900 border border-stone-800 text-xs text-stone-200 p-3 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-stone-400 block mb-1">Description</label>
            <textarea
              rows={3}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Short category description..."
              className="w-full bg-stone-900 border border-stone-800 text-xs text-stone-200 p-3 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Save Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="md:col-span-2 bg-[#141312] p-6 border border-stone-800 space-y-4">
          <h3 className="font-serif text-sm font-bold uppercase text-white pb-2 border-b border-stone-800">
            Existing Active Categories ({categories.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-stone-500 animate-pulse">Loading Categories...</div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id || cat._id} className="p-4 bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-200">{cat.name}</h4>
                    <p className="text-xs text-stone-500 font-mono">Slug: /{cat.slug}</p>
                    {cat.description && <p className="text-xs text-stone-400 mt-1">{cat.description}</p>}
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
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
