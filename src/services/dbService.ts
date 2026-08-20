import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import CategoryModel from '@/models/Category';
import OrderModel from '@/models/Order';
import InventoryModel from '@/models/Inventory';
import SettingsModel from '@/models/Settings';
import HeroBannerModel from '@/models/HeroBanner';
import { Product, Category, Order, SiteSettings, HeroBannerConfig } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_HERO } from '@/lib/seedData';
import { slugify, generateOrderNumber } from '@/lib/utils';

// In-memory store fallback when MongoDB is not connected
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryHero: HeroBannerConfig = { ...INITIAL_HERO };
let memoryOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'HNF-20260813-9821',
    customer: {
      name: 'Ananya Roy',
      phone: '+91 98123 45678',
      email: 'ananya@example.com',
      city: 'Mumbai',
      address: 'Bandra West, Hill Road',
      pincode: '400050',
    },
    items: [
      {
        productId: 'hnf-ks-001',
        productName: 'Gilded Zardosi Chanderi Kurta Set',
        sku: 'HNF-KS-001',
        size: 'M',
        color: 'Ivory Gold',
        quantity: 1,
        unitPrice: 4999,
        totalPrice: 4999,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      },
    ],
    pricing: {
      subtotal: 4999,
      discount: 0,
      shipping: 0,
      tax: 0,
      grandTotal: 4999,
    },
    payment: {
      method: 'WhatsApp',
      status: 'Pending',
    },
    orderStatus: 'Confirmed',
    source: 'Website',
    createdAt: new Date().toISOString(),
  },
];
let memorySettings: SiteSettings = { ...INITIAL_SETTINGS };

// --- PRODUCT SERVICES ---
export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  newArrivalsOnly?: boolean;
  search?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const query: any = { 'flags.isActive': true };
      if (options?.categorySlug) {
        const category = await CategoryModel.findOne({ slug: options.categorySlug });
        if (category) {
          query.categoryId = category._id.toString();
        }
      }
      if (options?.featuredOnly) query['flags.isFeatured'] = true;
      if (options?.newArrivalsOnly) query['flags.isNewArrival'] = true;
      if (options?.search) {
        query.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
          { sku: { $regex: options.search, $options: 'i' } },
        ];
      }

      let sortOptions: any = { createdAt: -1 };
      if (options?.sortBy === 'price-low') sortOptions = { 'pricing.price': 1 };
      if (options?.sortBy === 'price-high') sortOptions = { 'pricing.price': -1 };
      if (options?.sortBy === 'newest') sortOptions = { createdAt: -1 };

      const total = await ProductModel.countDocuments(query);
      const docs = await ProductModel.find(query)
        .sort(sortOptions)
        .limit(options?.limit || 50)
        .lean();

      const products = docs.map((doc: any) => ({
        id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        sku: doc.sku,
        categoryId: doc.categoryId,
        description: doc.description,
        shortDescription: doc.shortDescription,
        pricing: doc.pricing,
        variants: doc.variants,
        images: doc.images,
        attributes: doc.attributes,
        flags: doc.flags,
        seo: doc.seo,
        createdAt: doc.createdAt?.toISOString(),
      }));

      return { products, total };
    }
  } catch (err) {
    console.warn('Using memory products fallback:', err);
  }

  // Fallback memory implementation
  let filtered = [...memoryProducts].filter((p) => p.flags.isActive);

  if (options?.categorySlug) {
    const cat = memoryCategories.find((c) => c.slug === options.categorySlug);
    if (cat) {
      filtered = filtered.filter((p) => p.categoryId === cat.id);
    }
  }
  if (options?.featuredOnly) {
    filtered = filtered.filter((p) => p.flags.isFeatured);
  }
  if (options?.newArrivalsOnly) {
    filtered = filtered.filter((p) => p.flags.isNewArrival);
  }
  if (options?.search) {
    const term = options.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  if (options?.sortBy === 'price-low') {
    filtered.sort((a, b) => a.pricing.price - b.pricing.price);
  } else if (options?.sortBy === 'price-high') {
    filtered.sort((a, b) => b.pricing.price - a.pricing.price);
  }

  return { products: filtered, total: filtered.length };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc: any = await ProductModel.findOne({ slug }).lean();
      if (doc) {
        return {
          id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          sku: doc.sku,
          categoryId: doc.categoryId,
          description: doc.description,
          shortDescription: doc.shortDescription,
          pricing: doc.pricing,
          variants: doc.variants,
          images: doc.images,
          attributes: doc.attributes,
          flags: doc.flags,
          seo: doc.seo,
          createdAt: doc.createdAt?.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Memory product slug fallback:', err);
  }

  return memoryProducts.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc: any = await ProductModel.findById(id).lean();
      if (doc) {
        return {
          id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          sku: doc.sku,
          categoryId: doc.categoryId,
          description: doc.description,
          shortDescription: doc.shortDescription,
          pricing: doc.pricing,
          variants: doc.variants,
          images: doc.images,
          attributes: doc.attributes,
          flags: doc.flags,
          seo: doc.seo,
        };
      }
    }
  } catch (err) {
    console.warn('Memory product id fallback:', err);
  }

  return memoryProducts.find((p) => p.id === id || p._id === id) || null;
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const slug = productData.slug || slugify(productData.name || `product-${Date.now()}`);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const newDoc = await ProductModel.create({
        ...productData,
        slug,
      });
      return {
        id: newDoc._id.toString(),
        name: newDoc.name,
        slug: newDoc.slug,
        sku: newDoc.sku,
        categoryId: newDoc.categoryId,
        description: newDoc.description,
        shortDescription: newDoc.shortDescription,
        pricing: newDoc.pricing,
        variants: newDoc.variants,
        images: newDoc.images,
        attributes: newDoc.attributes,
        flags: newDoc.flags,
        seo: newDoc.seo,
      };
    }
  } catch (err) {
    console.warn('DB create error, storing in memory:', err);
  }

  const newProduct: Product = {
    id: `hnf-p-${Date.now()}`,
    name: productData.name || 'Untitled Kurta',
    slug,
    sku: productData.sku || `HNF-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    categoryId: productData.categoryId || 'cat-kurta-sets',
    description: productData.description || '',
    shortDescription: productData.shortDescription || '',
    pricing: productData.pricing || { price: 2999, currency: 'INR' },
    variants: productData.variants || [
      { sku: 'DEFAULT-S', size: 'S', color: 'Default', stock: 10, price: productData.pricing?.price || 2999 },
      { sku: 'DEFAULT-M', size: 'M', color: 'Default', stock: 10, price: productData.pricing?.price || 2999 },
      { sku: 'DEFAULT-L', size: 'L', color: 'Default', stock: 10, price: productData.pricing?.price || 2999 },
    ],
    images: productData.images || [
      {
        url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
        altText: productData.name || 'Product Image',
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    attributes: productData.attributes || {
      fabric: 'Silk',
      pattern: 'Embroidered',
      occasion: 'Festive',
    },
    flags: productData.flags || {
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isActive: true,
    },
    seo: productData.seo || {
      title: `${productData.name} | House of NF`,
      description: productData.shortDescription || '',
    },
  };

  memoryProducts.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const updated: any = await ProductModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (updated) {
        return {
          id: updated._id.toString(),
          name: updated.name,
          slug: updated.slug,
          sku: updated.sku,
          categoryId: updated.categoryId,
          description: updated.description,
          shortDescription: updated.shortDescription,
          pricing: updated.pricing,
          variants: updated.variants,
          images: updated.images,
          attributes: updated.attributes,
          flags: updated.flags,
          seo: updated.seo,
        };
      }
    }
  } catch (err) {
    console.warn('DB update error, updating memory store:', err);
  }

  const idx = memoryProducts.findIndex((p) => p.id === id || p._id === id);
  if (idx !== -1) {
    memoryProducts[idx] = { ...memoryProducts[idx], ...updates };
    return memoryProducts[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      await ProductModel.findByIdAndDelete(id);
      return true;
    }
  } catch (err) {
    console.warn('DB delete error, deleting from memory:', err);
  }

  const initialLen = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== id && p._id !== id);
  return memoryProducts.length < initialLen;
}

// --- CATEGORY SERVICES ---
export async function getCategories(): Promise<Category[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await CategoryModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
      return docs.map((doc: any) => ({
        id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        image: doc.image,
        isActive: doc.isActive,
        sortOrder: doc.sortOrder,
      }));
    }
  } catch (err) {
    console.warn('Category fetch error, using memory:', err);
  }
  return memoryCategories;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: data.name || 'New Category',
    slug: slugify(data.name || `category-${Date.now()}`),
    description: data.description || '',
    image: data.image || '',
    isActive: true,
    sortOrder: memoryCategories.length + 1,
  };
  memoryCategories.push(newCat);
  return newCat;
}

// --- ORDER SERVICES ---
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const orderNumber = generateOrderNumber();
  const fullOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customer: orderData.customer || { name: 'Valued Customer', phone: '+91 9999999999' },
    items: orderData.items || [],
    pricing: orderData.pricing || {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      grandTotal: 0,
    },
    payment: orderData.payment || { method: 'WhatsApp', status: 'Pending' },
    orderStatus: 'Pending',
    source: orderData.source || 'Website',
    createdAt: new Date().toISOString(),
  };

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await OrderModel.create(fullOrder);
    }
  } catch (err) {
    console.warn('DB create order error, storing in memory:', err);
  }

  memoryOrders.unshift(fullOrder);
  return fullOrder;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const docs = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs.length > 0) {
        return docs.map((d: any) => ({
          id: d._id.toString(),
          orderNumber: d.orderNumber,
          customer: d.customer,
          items: d.items,
          pricing: d.pricing,
          payment: d.payment,
          orderStatus: d.orderStatus,
          source: d.source,
          createdAt: d.createdAt?.toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn('Order fetch error, using memory:', err);
  }
  return memoryOrders;
}

export async function updateOrderStatus(id: string, status: Order['orderStatus']): Promise<Order | null> {
  const order = memoryOrders.find((o) => o.id === id || o.orderNumber === id);
  if (order) {
    order.orderStatus = status;
    return order;
  }
  return null;
}

// --- SETTINGS SERVICES ---
export async function getSettings(): Promise<SiteSettings> {
  return memorySettings;
}

export async function updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySettings = { ...memorySettings, ...updates };
  return memorySettings;
}

// --- HERO BANNER SERVICES ---
export async function getHeroBanner(): Promise<HeroBannerConfig> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc: any = await HeroBannerModel.findOne({}).sort({ updatedAt: -1 }).lean();
      if (doc) {
        const isOldText =
          doc.badgeText?.includes('HERITAGE') ||
          doc.subtitle?.includes('Handcrafted') ||
          doc.description?.includes('Zardosi');
        return {
          badgeText: isOldText ? INITIAL_HERO.badgeText : doc.badgeText || INITIAL_HERO.badgeText,
          headingLine1: doc.headingLine1 || INITIAL_HERO.headingLine1,
          headingHighlight: doc.headingHighlight || INITIAL_HERO.headingHighlight,
          subtitle: isOldText ? INITIAL_HERO.subtitle : doc.subtitle || INITIAL_HERO.subtitle,
          description: isOldText ? INITIAL_HERO.description : doc.description || INITIAL_HERO.description,
          cta1Text: doc.cta1Text || INITIAL_HERO.cta1Text,
          cta1Link: doc.cta1Link || INITIAL_HERO.cta1Link,
          cta2Text: doc.cta2Text || INITIAL_HERO.cta2Text,
          cta2Link: doc.cta2Link || INITIAL_HERO.cta2Link,
          backgroundImage: doc.backgroundImage || INITIAL_HERO.backgroundImage,
          isActive: typeof doc.isActive === 'boolean' ? doc.isActive : true,
          updatedAt: doc.updatedAt?.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Hero banner fetch error, using memory fallback:', err);
  }
  return memoryHero;
}

export async function updateHeroBanner(updates: Partial<HeroBannerConfig>): Promise<HeroBannerConfig> {
  memoryHero = { ...memoryHero, ...updates };
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const updated: any = await HeroBannerModel.findOneAndUpdate({}, memoryHero, {
        new: true,
        upsert: true,
      }).lean();
      if (updated) {
        return {
          badgeText: updated.badgeText,
          headingLine1: updated.headingLine1,
          headingHighlight: updated.headingHighlight,
          subtitle: updated.subtitle,
          description: updated.description,
          cta1Text: updated.cta1Text,
          cta1Link: updated.cta1Link,
          cta2Text: updated.cta2Text,
          cta2Link: updated.cta2Link,
          backgroundImage: updated.backgroundImage,
          isActive: updated.isActive,
          updatedAt: updated.updatedAt?.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Hero banner DB update error:', err);
  }
  return memoryHero;
}

// --- SEED SEEDER SERVICE ---
export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      await ProductModel.deleteMany({});
      await CategoryModel.deleteMany({});
      await SettingsModel.deleteMany({});

      await CategoryModel.insertMany(INITIAL_CATEGORIES);
      await ProductModel.insertMany(INITIAL_PRODUCTS);
      await SettingsModel.create(INITIAL_SETTINGS);

      return { success: true, message: 'Database successfully seeded on MongoDB Atlas!' };
    }
  } catch (err) {
    console.warn('MongoDB Seed Warning:', err);
  }

  memoryProducts = [...INITIAL_PRODUCTS];
  memoryCategories = [...INITIAL_CATEGORIES];
  memorySettings = { ...INITIAL_SETTINGS };

  return { success: true, message: 'InMemory Store reset and seeded successfully!' };
}
