'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, MessageCircle, Play, Image as ImageIcon, ExternalLink, X } from 'lucide-react';
import InstagramIcon from '@/components/ui/InstagramIcon';
import { InstagramMediaItem } from '@/app/api/instagram/route';

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<InstagramMediaItem | null>(null);

  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/houseofnf.in';

  useEffect(() => {
    async function fetchInstagramFeed() {
      try {
        const res = await fetch('/api/instagram');
        const json = await res.json();
        if (json.success && json.data) {
          setPosts(json.data);
        }
      } catch (err) {
        console.error('Failed to load Instagram feed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstagramFeed();
  }, []);

  return (
    <section className="py-20 bg-[#141312] text-[#F3EBDD] border-t border-stone-800 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>@HOUSEOFNF ON INSTAGRAM</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Follow Our Style
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
            Discover our latest looks, collections, and styling inspiration on Instagram.
          </p>
        </div>

        {/* Feed Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-stone-900 animate-pulse border border-stone-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {posts.slice(0, 6).map((item) => {
              const isVideo = item.media_type === 'VIDEO';
              const displayImg = isVideo && item.thumbnail_url ? item.thumbnail_url : item.media_url;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPost(item)}
                  className="group relative aspect-square bg-stone-900 border border-stone-800 overflow-hidden cursor-pointer shadow-lg hover:border-[#C5A059]/60 transition-all duration-300"
                >
                  {/* Image/Thumbnail */}
                  <img
                    src={displayImg}
                    alt={item.caption || 'House of NF Instagram'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />

                  {/* Media Type Badge Tag */}
                  <div className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-[#C5A059] flex items-center justify-center shadow-md">
                    {isVideo ? <Play className="w-3.5 h-3.5 fill-[#C5A059]" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  </div>

                  {/* Hover Overlay Vignette & Info */}
                  <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-left">
                    <p className="text-[11px] text-stone-200 line-clamp-3 font-light leading-snug">
                      {item.caption || 'Explore latest ethnic wear look on Instagram.'}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-stone-800">
                      <div className="flex items-center justify-between text-[11px] text-stone-300">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          <span>{item.like_count || 320}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.comments_count || 24}</span>
                        </span>
                      </div>

                      <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold block flex items-center gap-1">
                        <span>View Post</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 transition-all duration-300 shadow-xl shadow-[#C5A059]/15 group"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Follow Us on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Instagram Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 shadow-2xl p-6 space-y-4 text-left animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-square bg-black overflow-hidden relative border border-stone-800">
              <img
                src={selectedPost.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light">
              {selectedPost.caption}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-stone-800">
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{selectedPost.like_count || 320} Likes</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>{selectedPost.comments_count || 24} Comments</span>
                </span>
              </div>

              <a
                href={selectedPost.permalink}
                target="_blank"
                rel="noreferrer"
                className="bg-[#C5A059] hover:bg-[#B38E46] text-stone-950 font-bold text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-1.5 transition-colors"
              >
                <span>View on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
