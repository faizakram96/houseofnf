import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryDocument extends Document {
  productId: string;
  productName: string;
  sku: string;
  variantSku: string;
  size: string;
  color: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryDocument>(
  {
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    variantSku: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    color: { type: String, default: 'Default' },
    stock: { type: Number, required: true, default: 0 },
    reservedStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory || mongoose.model<IInventoryDocument>('Inventory', InventorySchema);
