import React, { useState, useRef } from 'react';
import { Upload, Trash2, Link as LinkIcon, Crop } from 'lucide-react';
import { ProductImage, ImageTransformSettings } from '@/types';
import ImageEditorModal from '@/components/admin/ImageEditorModal';

interface FileUploadProps {
  images?: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  theme?: 'black' | 'white';
}

export default function FileUpload({ images = [], onChange, theme = 'black' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const newImages: ProductImage[] = json.urls.map((url: string, idx: number) => ({
          url,
          altText: `Product Image ${images.length + idx + 1}`,
          sortOrder: images.length + idx + 1,
          isPrimary: images.length === 0 && idx === 0,
        }));

        onChange([...images, ...newImages]);
      } else {
        alert(json.error || 'Failed to upload images');
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newImage: ProductImage = {
      url: urlInput.trim(),
      altText: `Product Image ${images.length + 1}`,
      sortOrder: images.length + 1,
      isPrimary: images.length === 0,
    };

    onChange([...images, newImage]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    onChange(updated);
  };

  const handleSaveTransform = (croppedUrl: string, transform: ImageTransformSettings) => {
    if (editingIndex === null) return;
    const updated = images.map((img, idx) => {
      if (idx === editingIndex) {
        return {
          ...img,
          url: transform.croppedImageUrl || croppedUrl,
          transform,
        };
      }
      return img;
    });
    onChange(updated);
    setEditingIndex(null);
  };

  const isWhite = theme === 'white';

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Drag & Drop / Click Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${isWhite
          ? 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-[#C5A059]'
          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 hover:border-[#C5A059]'
          }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${isWhite ? 'bg-[#F3EBDD] text-[#C5A059]' : 'bg-stone-800 text-[#C5A059]'
              }`}
          >
            <Upload className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isWhite ? 'text-stone-900' : 'text-white'}`}>
              {isUploading ? 'Uploading Image File(s)...' : 'Click to Upload Image File from Device'}
            </p>
            <p className={`text-[11px] mt-1 ${isWhite ? 'text-stone-500' : 'text-stone-400'}`}>
              Supports PNG, JPG, WEBP, JPEG up to 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* URL Toggle Option */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className={`text-xs flex items-center gap-1 font-medium ${isWhite ? 'text-stone-600 hover:text-[#C5A059]' : 'text-stone-400 hover:text-[#C5A059]'
            }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL Option' : 'Or Paste Web Image URL'}
        </button>
      </div>

      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className={`flex-1 text-xs p-2.5 border focus:outline-none focus:border-[#C5A059] ${isWhite ? 'bg-white border-stone-300 text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-200'
              }`}
          />
          <button
            type="submit"
            className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-4 py-2"
          >
            Add URL
          </button>
        </form>
      )}

      {/* Uploaded Images Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-[3/4] border overflow-hidden group transition-all ${isWhite ? 'bg-stone-100 border-stone-300' : 'bg-stone-900 border-stone-800'
                } ${img.isPrimary ? 'ring-2 ring-[#C5A059]' : ''}`}
            >
              <img
                src={img.url}
                alt={img.altText || ''}
                style={{
                  objectFit: (img.transform?.objectFit && img.transform.objectFit !== 'custom'
                    ? img.transform.objectFit
                    : 'cover') as React.CSSProperties['objectFit'],
                  objectPosition: img.transform ? `${img.transform.positionX}% ${img.transform.positionY}%` : '50% 50%',
                  transform: img.transform ? `scale(${img.transform.zoom}) rotate(${img.transform.rotation}deg)` : 'none',
                }}
                className="w-full h-full"
              />

              {/* Badges & Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(idx)}
                    className="p-1.5 bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 rounded-full transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2"
                    title="Adjust Position & Crop"
                  >
                    <Crop className="w-3.5 h-3.5" /> Adjust
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className={`text-[10px] uppercase font-bold py-1 px-2 tracking-widest transition-colors ${img.isPrimary
                    ? 'bg-[#C5A059] text-stone-950'
                    : 'bg-stone-900/90 text-white hover:bg-[#C5A059] hover:text-stone-950'
                    }`}
                >
                  {img.isPrimary ? 'Primary Image' : 'Set as Primary'}
                </button>
              </div>

              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-[#C5A059] text-stone-950 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-md">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Editor & Cropper Modal */}
      {editingIndex !== null && images[editingIndex] && (
        <ImageEditorModal
          isOpen={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          imageUrl={images[editingIndex].url}
          initialTransform={images[editingIndex].transform}
          defaultAspectRatio="3:4"
          title={`Adjust & Position Image #${editingIndex + 1}`}
          onSave={handleSaveTransform}
          theme={theme}
        />
      )}
    </div>
  );
}
