'use client';

import React, { useState, useRef } from 'react';
import { Upload, Check, Copy } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminMediaPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [images, setImages] = useState([
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000',
      title: 'Zardosi Chanderi Front',
    },
    {
      url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000',
      title: 'Emerald Silk Front',
    },
    {
      url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000',
      title: 'Chikankari Rose Detail',
    },
    {
      url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000',
      title: 'Maroon Velvet Heritage',
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('file', file));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.urls) {
        const newItems = json.urls.map((url: string, idx: number) => ({
          url,
          title: `Device Upload ${images.length + idx + 1}`,
        }));
        setImages([...newItems, ...images]);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyUrl = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className={`p-6 border flex items-center justify-between ${cardBg}`}>
        <div>
          <h1 className={`font-serif text-xl font-bold ${isWhite ? 'text-stone-900' : 'text-white'}`}>
            Media Library & File Uploads
          </h1>
          <p className={`text-xs font-light mt-1 ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>
            Upload product fashion imagery directly from your computer or phone.
          </p>
        </div>
      </div>

      {/* Hidden input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Upload trigger */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed text-center cursor-pointer transition-all ${cardBg} ${
          isWhite ? 'hover:bg-stone-50 hover:border-[#C5A059]' : 'hover:bg-stone-900 hover:border-[#C5A059]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#F3EBDD] text-[#C5A059] flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isWhite ? 'text-stone-900' : 'text-white'}`}>
            {isUploading ? 'Uploading Image File(s)...' : 'Click to Upload Image Files from Local Device'}
          </h3>
          <p className={`text-[11px] ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>
            Supports JPG, PNG, WEBP high-resolution fashion photography
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {images.map((img, idx) => (
          <div key={idx} className={`border overflow-hidden group ${cardBg}`}>
            <div className="relative aspect-[3/4] bg-stone-100">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className={`p-3 flex items-center justify-between ${isWhite ? 'bg-stone-50' : 'bg-stone-900'}`}>
              <span className={`text-[10px] font-medium truncate ${isWhite ? 'text-stone-800' : 'text-stone-300'}`}>
                {img.title}
              </span>
              <button
                onClick={() => copyUrl(img.url, idx)}
                className={`p-1 ${isWhite ? 'text-stone-600 hover:text-[#C5A059]' : 'text-stone-400 hover:text-[#C5A059]'}`}
                title="Copy Image Data URL"
              >
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
