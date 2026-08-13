import { NextResponse } from 'next/server';

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

// Fallback curated Instagram posts for House of NF (when live API credentials are not yet configured)
const FALLBACK_INSTAGRAM_POSTS: InstagramMediaItem[] = [
  {
    id: 'ig-001',
    caption: 'Pure Chanderi Silk with intricate metallic Zardosi handwork. #HouseOfNF #FestiveWear #ChanderiSilk',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-08-10T12:00:00Z',
    like_count: 342,
    comments_count: 28,
  },
  {
    id: 'ig-002',
    caption: 'Handcrafted Lucknowi Chikankari Anarkali set in soft blush organza. #Chikankari #IndianFashion #LuxuryAtelier',
    media_type: 'VIDEO',
    media_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000&auto=format&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-08-08T15:30:00Z',
    like_count: 512,
    comments_count: 45,
  },
  {
    id: 'ig-003',
    caption: 'Emerald Royal Velvet Kurta with antique gold Zari embroidery. #VelvetCouture #Royalty #FestiveSelection',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-08-05T09:15:00Z',
    like_count: 289,
    comments_count: 19,
  },
  {
    id: 'ig-004',
    caption: 'Behind the scenes at our New Delhi Atelier weaving timeless Indian couture. #AtelierDiaries #ArtisanCraft',
    media_type: 'CAROUSEL_ALBUM',
    media_url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-08-01T18:45:00Z',
    like_count: 418,
    comments_count: 32,
  },
  {
    id: 'ig-005',
    caption: 'Festive drape & flow of handloom dupattas. #DupattaStyling #EthnicGrace #HouseOfNF',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-07-28T14:20:00Z',
    like_count: 376,
    comments_count: 24,
  },
  {
    id: 'ig-006',
    caption: 'Details of metallic zardosi border finishing on tissue silk. #LuxuryCraft #IndianWear #WomenFashion',
    media_type: 'VIDEO',
    media_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    thumbnail_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    permalink: 'https://www.instagram.com/houseofnf.in',
    timestamp: '2026-07-25T11:00:00Z',
    like_count: 620,
    comments_count: 58,
  },
];

export async function GET() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID || 'me';

    // If live token exists, query Meta / Instagram Basic Display or Graph API
    if (accessToken) {
      const graphUrl = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=8&access_token=${accessToken}`;
      
      const res = await fetch(graphUrl, {
        next: { revalidate: 3600 }, // Server-side cache for 1 hour
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return NextResponse.json({
            success: true,
            data: json.data,
            isLiveApi: true,
          });
        }
      }
    }

    // Return structured fallback posts if token is unconfigured or rate limited
    return NextResponse.json({
      success: true,
      data: FALLBACK_INSTAGRAM_POSTS,
      isLiveApi: false,
      message: 'Using curated Instagram feed fallback. Add INSTAGRAM_ACCESS_TOKEN to .env.local to enable live Meta API sync.',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: FALLBACK_INSTAGRAM_POSTS,
      isLiveApi: false,
      error: error.message,
    });
  }
}
