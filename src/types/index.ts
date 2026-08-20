export interface ImageTransformSettings {
  positionX: number; // 0% to 100%, default 50%
  positionY: number; // 0% to 100%, default 50%
  zoom: number; // 1.0x to 3.0x, default 1.0x
  rotation: number; // 0, 90, 180, 270 degrees
  objectFit: 'cover' | 'contain' | 'fill' | 'custom';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | 'free';
  croppedImageUrl?: string;
}

export interface ProductVariant {
  sku: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  stock: number;
  price: number;
}

export interface ProductImage {
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  transform?: ImageTransformSettings;
}

export interface ProductAttributes {
  fabric: string;
  pattern: string;
  occasion: string;
  sleeveType?: string;
  fit?: string;
  careInstructions?: string;
}

export interface ProductFlags {
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
}

export interface ProductSEO {
  title: string;
  description: string;
}

export interface ProductPricing {
  price: number;
  compareAtPrice?: number;
  currency: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  shortDescription: string;
  pricing: ProductPricing;
  variants: ProductVariant[];
  images: ProductImage[];
  attributes: ProductAttributes;
  flags: ProductFlags;
  seo: ProductSEO;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentCategoryId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

export type PaymentStatus = 'Pending' | 'Initiated' | 'Paid' | 'Failed' | 'Refunded';

export type RefundStatus = 'None' | 'Requested' | 'Processed' | 'Failed';

export interface OrderPayment {
  gateway: 'razorpay' | 'cod' | 'whatsapp' | 'instagram' | 'manual';
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'whatsapp' | 'manual';
  status: PaymentStatus;
  orderId?: string; // Razorpay Order ID (e.g. order_xyz)
  paymentId?: string; // Razorpay Payment ID (e.g. pay_xyz)
  signature?: string;
  transactionId?: string;
  refundStatus?: RefundStatus;
  refundId?: string;
  refundAmount?: number;
  paidAt?: string;
  errorDescription?: string;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type OrderSource = 'Website' | 'WhatsApp' | 'Instagram' | 'Admin';

export interface Order {
  _id?: string;
  id?: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  pricing: OrderPricing;
  payment: OrderPayment;
  orderStatus: OrderStatus;
  source: OrderSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id?: string;
  productId: string;
  productName: string;
  sku: string;
  variantSku: string;
  size: string;
  color: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  selectedColor: string;
  quantity: number;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  permissions?: string[];
  createdAt?: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  instagramUrl: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  freeShippingThreshold: number;
  currencySymbol: string;
}

export interface HeroBannerConfig {
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
  transform?: ImageTransformSettings;
  isActive: boolean;
  updatedAt?: string;
}
