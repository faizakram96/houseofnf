import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  pricing: {
    price: number;
    compareAtPrice?: number;
    currency: string;
  };
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    stock: number;
    price: number;
  }>;
  images: Array<{
    url: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  attributes: {
    fabric: string;
    pattern: string;
    occasion: string;
    sleeveType?: string;
    fit?: string;
    careInstructions?: string;
  };
  flags: {
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    isActive: boolean;
  };
  seo: {
    title: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    categoryId: { type: String, required: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    pricing: {
      price: { type: Number, required: true },
      compareAtPrice: { type: Number },
      currency: { type: String, default: 'INR' },
    },
    variants: [
      {
        sku: { type: String, required: true },
        size: { type: String, required: true, enum: ['S', 'M', 'L', 'XL', 'XXL'] },
        color: { type: String, default: 'Default' },
        stock: { type: Number, default: 10 },
        price: { type: Number, required: true },
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String, default: '' },
        sortOrder: { type: Number, default: 0 },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    attributes: {
      fabric: { type: String, default: 'Cotton' },
      pattern: { type: String, default: 'Embroidered' },
      occasion: { type: String, default: 'Festive' },
      sleeveType: { type: String },
      fit: { type: String },
      careInstructions: { type: String },
    },
    flags: {
      isFeatured: { type: Boolean, default: false, index: true },
      isNewArrival: { type: Boolean, default: true },
      isBestSeller: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true, index: true },
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Compound indexes for optimal search and filtering performance
ProductSchema.index({ categoryId: 1, 'flags.isActive': 1 });
ProductSchema.index({ 'flags.isFeatured': 1, 'flags.isActive': 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
