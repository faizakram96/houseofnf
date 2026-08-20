'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Crop,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ImageTransformSettings } from '@/types';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialTransform?: ImageTransformSettings;
  defaultAspectRatio?: '16:9' | '4:3' | '1:1' | '3:4' | 'free';
  title?: string;
  onSave: (croppedImageUrl: string, transform: ImageTransformSettings) => void;
  theme?: 'black' | 'white';
}

export default function ImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  initialTransform,
  defaultAspectRatio = '16:9',
  title = 'Image Positioning & Crop Editor',
  onSave,
  theme = 'black',
}: ImageEditorModalProps) {
  // Transform State
  const [positionX, setPositionX] = useState<number>(initialTransform?.positionX ?? 50);
  const [positionY, setPositionY] = useState<number>(initialTransform?.positionY ?? 50);
  const [zoom, setZoom] = useState<number>(initialTransform?.zoom ?? 1);
  const [rotation, setRotation] = useState<number>(initialTransform?.rotation ?? 0);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill' | 'custom'>(
    initialTransform?.objectFit ?? 'cover'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:4' | 'free'>(
    initialTransform?.aspectRatio ?? defaultAspectRatio
  );

  // Viewport Preview Device Mode ('desktop' | 'tablet' | 'mobile')
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state when initialTransform or imageUrl changes
  useEffect(() => {
    if (isOpen) {
      setPositionX(initialTransform?.positionX ?? 50);
      setPositionY(initialTransform?.positionY ?? 50);
      setZoom(initialTransform?.zoom ?? 1);
      setRotation(initialTransform?.rotation ?? 0);
      setObjectFit(initialTransform?.objectFit ?? 'cover');
      setAspectRatio(initialTransform?.aspectRatio ?? defaultAspectRatio);
    }
  }, [isOpen, initialTransform, defaultAspectRatio]);

  // Drag Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      setPositionX((prev) => Math.min(100, Math.max(0, prev - percentDeltaX * 0.8)));
      setPositionY((prev) => Math.min(100, Math.max(0, prev - percentDeltaY * 0.8)));
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset to Defaults
  const handleReset = () => {
    setPositionX(50);
    setPositionY(50);
    setZoom(1);
    setRotation(0);
    setObjectFit('cover');
    setAspectRatio(defaultAspectRatio);
  };

  // Canvas Crop & Export Handler
  const handleSaveAndExport = async () => {
    if (!imageUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Canvas dimensions based on aspect ratio
      let targetWidth = 1200;
      let targetHeight = 675; // Default 16:9

      if (aspectRatio === '4:3') {
        targetHeight = 900;
      } else if (aspectRatio === '1:1') {
        targetHeight = 1200;
      } else if (aspectRatio === '3:4') {
        targetWidth = 900;
        targetHeight = 1200;
      } else if (aspectRatio === 'free') {
        targetWidth = img.naturalWidth || 1200;
        targetHeight = img.naturalHeight || 800;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#141312';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.save();
        // Move origin to center of canvas
        ctx.translate(targetWidth / 2, targetHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply scale zoom
        ctx.scale(zoom, zoom);

        // Calculate offset based on positionX and positionY (50% = centered)
        const offsetX = ((50 - positionX) / 100) * targetWidth;
        const offsetY = ((50 - positionY) / 100) * targetHeight;

        // Draw image centered with objectFit calculation
        let renderW = targetWidth;
        let renderH = targetHeight;

        if (objectFit === 'contain') {
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const canvasRatio = targetWidth / targetHeight;
          if (imgRatio > canvasRatio) {
            renderH = targetWidth / imgRatio;
          } else {
            renderW = targetHeight * imgRatio;
          }
        }

        ctx.drawImage(img, -renderW / 2 + offsetX, -renderH / 2 + offsetY, renderW, renderH);
        ctx.restore();

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        const transformSettings: ImageTransformSettings = {
          positionX,
          positionY,
          zoom,
          rotation,
          objectFit,
          aspectRatio,
          croppedImageUrl: croppedDataUrl,
        };

        onSave(croppedDataUrl, transformSettings);
      }
    } catch (err) {
      console.error('Error cropping image:', err);
      // Fallback save settings with original URL
      onSave(imageUrl, {
        positionX,
        positionY,
        zoom,
        rotation,
        objectFit,
        aspectRatio,
        croppedImageUrl: imageUrl,
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isWhite = theme === 'white';
  const modalBg = isWhite ? 'bg-white text-stone-900 border-stone-200' : 'bg-[#1C1A18] text-[#F3EBDD] border-stone-800';

  // Calculate container aspect ratio CSS
  const getAspectRatioClass = () => {
    if (aspectRatio === '16:9') return 'aspect-[16/9]';
    if (aspectRatio === '4:3') return 'aspect-[4/3]';
    if (aspectRatio === '1:1') return 'aspect-square';
    if (aspectRatio === '3:4') return 'aspect-[3/4]';
    return 'aspect-video';
  };

  // Device width wrapper for live viewport preview
  const getDeviceWidthClass = () => {
    if (deviceViewport === 'mobile') return 'max-w-[360px]';
    if (deviceViewport === 'tablet') return 'max-w-[680px]';
    return 'max-w-full';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-5xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${modalBg}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#C5A059]" />
            <h2 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-stone-400 hover:text-white flex items-center gap-1 font-medium underline"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Grid split into Controls & Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Interactive Preview Canvas (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-[#141312] border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col justify-between space-y-4">
            {/* Viewport Device Mode Switcher Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> RESPONSIVE PREVIEW
              </span>

              <div className="flex items-center gap-1 bg-stone-900 p-1 border border-stone-800 rounded-full">
                <button
                  type="button"
                  onClick={() => setDeviceViewport('desktop')}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                    deviceViewport === 'desktop' ? 'bg-[#C5A059] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceViewport('tablet')}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                    deviceViewport === 'tablet' ? 'bg-[#C5A059] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceViewport('mobile')}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                    deviceViewport === 'mobile' ? 'bg-[#C5A059] text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas Container */}
            <div className="flex-1 flex items-center justify-center p-2 min-h-[320px]">
              <div className={`w-full transition-all duration-300 mx-auto ${getDeviceWidthClass()}`}>
                <div
                  ref={previewRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`relative w-full overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl cursor-grab active:cursor-grabbing select-none group ${getAspectRatioClass()}`}
                >
                  {/* Dynamic Transformed Image */}
                  <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Adjust Preview"
                      style={{
                        objectFit: objectFit === 'custom' ? 'cover' : objectFit,
                        objectPosition: `${positionX}% ${positionY}%`,
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                      }}
                      className="w-full h-full transition-all duration-200 pointer-events-none"
                    />
                  </div>

                  {/* Grid Overlay for Composition Rule-of-Thirds */}
                  <div className="absolute inset-0 border border-[#C5A059]/30 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 group-hover:opacity-70 transition-opacity">
                    <div className="border-r border-b border-[#C5A059]/30" />
                    <div className="border-r border-b border-[#C5A059]/30" />
                    <div className="border-b border-[#C5A059]/30" />
                    <div className="border-r border-b border-[#C5A059]/30" />
                    <div className="border-r border-b border-[#C5A059]/30" />
                    <div className="border-b border-[#C5A059]/30" />
                  </div>

                  {/* Drag Helper Notice */}
                  <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-sm border border-stone-800 text-[10px] text-stone-300 px-2.5 py-1 flex items-center gap-1.5 pointer-events-none">
                    <Move className="w-3 h-3 text-[#C5A059]" />
                    <span>Click & Drag to Pan Image</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Position Indicators */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span>Position: X {Math.round(positionX)}% | Y {Math.round(positionY)}%</span>
              <span>Zoom: {zoom.toFixed(2)}x</span>
              <span>Rotation: {rotation}°</span>
            </div>
          </div>

          {/* Right Column: Controls Panel (4 cols) */}
          <div className="lg:col-span-4 p-4 sm:p-6 space-y-6 bg-[#1A1816]">
            {/* 1. Zoom Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-300">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-4 h-4 text-[#C5A059]" /> Zoom Scale
                </span>
                <span className="text-[#C5A059] font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#C5A059] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Position X Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-300">
                <span>Horizontal Pan (X)</span>
                <span className="text-[#C5A059] font-mono">{Math.round(positionX)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={positionX}
                onChange={(e) => setPositionX(parseFloat(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
            </div>

            {/* 3. Position Y Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-300">
                <span>Vertical Pan (Y)</span>
                <span className="text-[#C5A059] font-mono">{Math.round(positionY)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={positionY}
                onChange={(e) => setPositionY(parseFloat(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
            </div>

            {/* 4. Rotation Controls */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-300 block">
                Rotation Angle
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotation(deg)}
                    className={`py-2 text-xs font-mono font-bold border transition-colors ${
                      rotation === deg
                        ? 'bg-[#C5A059] text-stone-950 border-[#C5A059]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Display Layout Mode */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-300 block">
                Display Mode
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['cover', 'contain', 'fill', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setObjectFit(mode)}
                    className={`py-2 px-3 border capitalize font-semibold transition-colors text-left ${
                      objectFit === mode
                        ? 'bg-[#C5A059] text-stone-950 border-[#C5A059]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    {mode === 'custom' ? 'Custom Crop' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Aspect Ratio Options */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-300 block">
                Target Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {(['16:9', '4:3', '1:1', '3:4', 'free'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 border transition-colors text-center uppercase ${
                      aspectRatio === ratio
                        ? 'bg-[#C5A059] text-stone-950 border-[#C5A059]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Save & Publish Action Buttons */}
            <div className="pt-4 border-t border-stone-800 space-y-3">
              <button
                type="button"
                onClick={handleSaveAndExport}
                disabled={isProcessing}
                className="w-full bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] py-3.5 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {isProcessing ? (
                  <span>Processing Crop Canvas...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save & Apply Image Settings
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-xs uppercase tracking-widest py-2.5 transition-colors border border-stone-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
