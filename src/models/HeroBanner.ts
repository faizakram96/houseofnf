import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroBannerDocument extends Document {
  badgeText: string;
  headingLine1: string;
  headingHighlight: string;
  subtitle: string;
  description: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  backgroundImage: string;
  isActive: boolean;
  updatedAt: Date;
}

const HeroBannerSchema = new Schema<IHeroBannerDocument>(
  {
    badgeText: { type: String, default: "CURATED WOMEN'S WEAR • FESTIVE 2026" },
    headingLine1: { type: String, default: 'Timeless Indian' },
    headingHighlight: { type: String, default: 'Elegance.' },
    subtitle: { type: String, default: 'CURATED ELEGANCE FOR THE MODERN WOMAN' },
    description: {
      type: String,
      default:
        'Discover our thoughtfully curated collection of Kurta Sets, Kurtas, and elegant ethnic wear. Designed with attention to style, quality, comfort, and modern trends.',
    },
    cta1Text: { type: String, default: 'Shop Kurta Sets' },
    cta1Link: { type: String, default: '/shop?category=kurta-sets' },
    cta2Text: { type: String, default: 'Explore Kurtas' },
    cta2Link: { type: String, default: '/shop?category=kurtas' },
    backgroundImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2000&auto=format&fit=crop',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HeroBanner || mongoose.model<IHeroBannerDocument>('HeroBanner', HeroBannerSchema);
