'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Save, Upload, Eye, CheckCircle2, ArrowRight, Link as LinkIcon, RefreshCw, ShieldAlert, Crop } from 'lucide-react';
import { HeroBannerConfig, ImageTransformSettings } from '@/types';
import { useAdminTheme } from '@/context/AdminThemeContext';
import ImageEditorModal from '@/components/admin/ImageEditorModal';

export default function AdminHeroPage() {
  const { theme } = useAdminTheme();
  const isWhite = theme === 'white';

  const [hero, setHero] = useState<HeroBannerConfig>({
    badgeText: "CURATED WOMEN'S WEAR • FESTIVE 2026",
    headingLine1: 'Timeless Indian',
    headingHighlight: 'Elegance.',
    subtitle: 'CURATED ELEGANCE FOR THE MODERN WOMAN',
    description:
      'Discover our thoughtfully curated collection of Kurta Sets, Kurtas, and elegant ethnic wear. Designed with attention to style, quality, comfort, and modern trends.',
    cta1Text: 'Shop Kurta Sets',
    cta1Link: '/shop?category=kurta-sets',
    cta2Text: 'Explore Kurtas',
    cta2Link: '/shop?category=kurtas',
    backgroundImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop',
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadHeroConfig() {
      setLoading(true);
      try {
        const res = await fetch('/api/hero');
        const json = await res.json();
        if (json.success && json.data) {
          setHero(json.data);
        }
      } catch (e: any) {
        console.error('Failed to load hero banner config:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHeroConfig();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds the 10MB limit. Please select a smaller file.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported image format. Please upload JPG, PNG, WEBP, or GIF images.');
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.urls && json.urls.length > 0) {
        setHero((prev) => ({ ...prev, backgroundImage: json.urls[0] }));
        setStatusMsg('Background image uploaded successfully! Click "Adjust & Position Image" to fine-tune placement.');
      } else {
        setErrorMsg(json.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      setErrorMsg('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setHero((prev) => ({ ...prev, backgroundImage: urlInput.trim() }));
    setUrlInput('');
    setShowUrlInput(false);
    setStatusMsg('Custom image URL applied! You can now adjust & position image.');
  };

  const handleSaveHeroTransform = (croppedUrl: string, transform: ImageTransformSettings) => {
    setHero((prev) => ({
      ...prev,
      backgroundImage: transform.croppedImageUrl || croppedUrl || prev.backgroundImage,
      transform,
    }));
    setStatusMsg('Banner position and crop settings saved! Click "Publish Hero Banner" to go live.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg('Hero section content published successfully! Home page is updated in real-time.');
      } else {
        setErrorMsg(json.error || 'Failed to save hero configuration.');
      }
    } catch (err: any) {
      setErrorMsg('Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const cardBg = isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800';
  const textTitle = isWhite ? 'text-stone-900' : 'text-white';
  const textSub = isWhite ? 'text-stone-500' : 'text-stone-400';
  const borderLine = isWhite ? 'border-stone-200' : 'border-stone-800';
  const inputBg = isWhite
    ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-[#C5A059]'
    : 'bg-stone-900 border-stone-800 text-stone-200 focus:border-[#C5A059]';

  if (loading) {
    return (
      <div className="py-24 text-center text-xs uppercase tracking-widest text-stone-400 animate-pulse">
        Loading Hero Banner Management...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner Header */}
      <div className={`p-4 sm:p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${cardBg}`}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <h1 className={`font-serif text-lg sm:text-xl font-bold ${textTitle}`}>Home Page Hero Banner Management</h1>
          </div>
          <p className={`text-xs font-light mt-1 ${textSub}`}>
            Manage background imagery, promotional headings, description text, and CTA buttons without changing code.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-6 py-3 flex items-center justify-center gap-2 shadow-lg transition-colors self-start sm:self-auto"
        >
          <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Publishing...' : 'Publish Hero Banner'}
        </button>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs p-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/90 border border-red-800 text-red-300 text-xs p-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Hero Visibility & Background Image */}
        <div className={`p-4 sm:p-6 border space-y-6 transition-colors duration-300 ${cardBg}`}>
          <div className="flex items-center justify-between pb-3 border-b border-stone-700/40">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059]">
              1. Hero Visibility & Background Imagery
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hero.isActive}
                onChange={(e) => setHero({ ...hero, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#C5A059]"
              />
              <span className={`text-xs font-bold ${hero.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>
                {hero.isActive ? 'Active (Visible on Home Page)' : 'Inactive (Hidden)'}
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <label className={`text-xs uppercase tracking-wider font-semibold block ${textSub}`}>
              Background Imagery (Device Upload or Image URL)
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isWhite
                  ? 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-[#C5A059]'
                  : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-[#C5A059]'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#F3EBDD] text-[#C5A059] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isWhite ? 'text-stone-900' : 'text-white'}`}>
                  {isUploading ? 'Uploading Image...' : 'Click to Upload Background Image from Device'}
                </h4>
                <p className={`text-[11px] ${textSub}`}>Supports High-Res JPG, PNG, WEBP, GIF up to 10MB</p>
              </div>
            </div>

            {/* Action Bar: Open Editor Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 text-xs uppercase font-bold tracking-wider py-2.5 px-4 flex items-center gap-2 transition-all shadow-md"
              >
                <Crop className="w-4 h-4" /> Adjust & Position Banner Image
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 font-medium"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {showUrlInput ? 'Hide URL Option' : 'Or Enter Web Image URL'}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className={`flex-1 text-xs p-3 focus:outline-none ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-4 py-2"
                >
                  Apply URL
                </button>
              </div>
            )}
          </div>

          {/* Image Positioning Modal */}
          {isEditorOpen && (
            <ImageEditorModal
              isOpen={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              imageUrl={hero.backgroundImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80'}
              initialTransform={hero.transform}
              defaultAspectRatio="16:9"
              title="Adjust & Position Home Page Banner Image"
              onSave={handleSaveHeroTransform}
              theme={theme}
            />
          )}
        </div>

        {/* Section 2: Heading, Subtitle & Description */}
        <div className={`p-4 sm:p-6 border space-y-6 transition-colors duration-300 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderLine}`}>
            2. Headline, Tagline & Text Content
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Top Badge Tagline
              </label>
              <input
                type="text"
                required
                value={hero.badgeText}
                onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
                placeholder="e.g. HERITAGE WOMEN'S ATELIER • FESTIVE 2026"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Subtitle / Tagline
              </label>
              <input
                type="text"
                required
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                placeholder="e.g. Handcrafted Couture for the Modern Woman"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Main Heading Line 1 *
              </label>
              <input
                type="text"
                required
                value={hero.headingLine1}
                onChange={(e) => setHero({ ...hero, headingLine1: e.target.value })}
                placeholder="e.g. Timeless Indian"
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>

            <div>
              <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
                Main Heading Highlight (Italic / Gold Accent) *
              </label>
              <input
                type="text"
                required
                value={hero.headingHighlight}
                onChange={(e) => setHero({ ...hero, headingHighlight: e.target.value })}
                placeholder="e.g. Elegance."
                className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>
              Full Subtitle / Promotional Description *
            </label>
            <textarea
              rows={3}
              required
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              placeholder="Detailed promotional description..."
              className={`w-full text-xs p-3 focus:outline-none ${inputBg}`}
            />
          </div>
        </div>

        {/* Section 3: Call-To-Action (CTA) Buttons */}
        <div className={`p-4 sm:p-6 border space-y-6 transition-colors duration-300 ${cardBg}`}>
          <h3 className={`font-serif text-sm font-bold uppercase tracking-wider text-[#C5A059] pb-3 border-b ${borderLine}`}>
            3. Call-To-Action Buttons (CTA)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CTA 1 */}
            <div className="space-y-3 p-4 border border-stone-700/30 rounded-none bg-stone-500/5">
              <span className="text-xs uppercase font-bold text-[#C5A059] block">Primary Button 1</span>
              <div>
                <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Button Label</label>
                <input
                  type="text"
                  required
                  value={hero.cta1Text}
                  onChange={(e) => setHero({ ...hero, cta1Text: e.target.value })}
                  placeholder="e.g. Shop Kurta Sets"
                  className={`w-full text-xs p-2.5 focus:outline-none ${inputBg}`}
                />
              </div>
              <div>
                <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Action Link / URL</label>
                <input
                  type="text"
                  required
                  value={hero.cta1Link}
                  onChange={(e) => setHero({ ...hero, cta1Link: e.target.value })}
                  placeholder="e.g. /shop?category=kurta-sets"
                  className={`w-full text-xs font-mono p-2.5 focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            {/* CTA 2 */}
            <div className="space-y-3 p-4 border border-stone-700/30 rounded-none bg-stone-500/5">
              <span className="text-xs uppercase font-bold text-[#C5A059] block">Secondary Button 2</span>
              <div>
                <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Button Label</label>
                <input
                  type="text"
                  required
                  value={hero.cta2Text}
                  onChange={(e) => setHero({ ...hero, cta2Text: e.target.value })}
                  placeholder="e.g. Explore Kurtas"
                  className={`w-full text-xs p-2.5 focus:outline-none ${inputBg}`}
                />
              </div>
              <div>
                <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-1 ${textSub}`}>Action Link / URL</label>
                <input
                  type="text"
                  required
                  value={hero.cta2Link}
                  onChange={(e) => setHero({ ...hero, cta2Link: e.target.value })}
                  placeholder="e.g. /shop?category=kurtas"
                  className={`w-full text-xs font-mono p-2.5 focus:outline-none ${inputBg}`}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* --- LIVE INTERACTIVE PREVIEW SECTION --- */}
      <div className={`p-4 sm:p-6 border space-y-4 transition-colors duration-300 ${cardBg}`}>
        <div className="flex items-center justify-between pb-3 border-b border-stone-700/40">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#C5A059]" />
            <h3 className={`font-serif text-sm font-bold uppercase tracking-wider ${textTitle}`}>
              Live Hero Section Preview (As Shown on Home Page)
            </h3>
          </div>
          <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-2.5 py-0.5 font-bold uppercase">
            REAL-TIME PREVIEW
          </span>
        </div>

        {/* Hero Card Preview Container */}
        <div className="relative min-h-[420px] rounded-none overflow-hidden bg-[#141312] text-[#F3EBDD] flex items-center justify-center p-6 sm:p-10 border border-stone-800 shadow-2xl">
          {/* Background Image with Ambient Darkness */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={hero.backgroundImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000'}
              alt="Hero Preview"
              style={{
                objectFit: (hero.transform?.objectFit && hero.transform.objectFit !== 'custom'
                  ? hero.transform.objectFit
                  : 'cover') as React.CSSProperties['objectFit'],
                objectPosition: hero.transform ? `${hero.transform.positionX}% ${hero.transform.positionY}%` : '50% 50%',
                transform: hero.transform ? `scale(${hero.transform.zoom}) rotate(${hero.transform.rotation}deg)` : 'none',
              }}
              className="w-full h-full opacity-50 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/60 to-[#141312]/30" />
          </div>

          {/* Centered Preview Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>{hero.badgeText || "HERITAGE WOMEN'S ATELIER"}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {hero.headingLine1 || 'Timeless Indian'}{' '}
              <span className="text-[#C5A059] font-serif italic font-normal">{hero.headingHighlight || 'Elegance.'}</span>
            </h2>

            <p className="text-[10px] sm:text-xs tracking-[0.2em] text-amber-200/90 font-light uppercase">
              {hero.subtitle || 'Handcrafted Couture for the Modern Woman'}
            </p>

            <p className="text-xs text-stone-300 font-light leading-relaxed max-w-md mx-auto line-clamp-3">
              {hero.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="bg-[#C5A059] text-stone-950 font-bold text-[10px] uppercase tracking-[0.15em] px-6 py-2.5 flex items-center gap-1.5 shadow-lg">
                <span>{hero.cta1Text || 'Shop Kurta Sets'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              <div className="border border-[#F3EBDD]/40 text-white font-semibold text-[10px] uppercase tracking-[0.15em] px-6 py-2.5 backdrop-blur-sm">
                <span>{hero.cta2Text || 'Explore Kurtas'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
