import mongoose, { Schema, Document, Model } from 'mongoose';
import "./Category";

// Interfaces for nested schemas
interface IProductOptionValue {
    value: string;
    price: number;
}

interface IProductOption {
    name: string;
    values: IProductOptionValue[];
}

interface IProductReview {
    userId?: mongoose.Types.ObjectId | null;
    user: string;
    comment: string;
    rating: number;
    date: Date;
}

export interface IProduct extends Document {
    name: string;
    price: number;
    images: string[];
    category: mongoose.Types.ObjectId;
    badge: string;
    description?: string;
    shortDescription?: string;
    discount: number;
    options: IProductOption[];
    ingredients?: string;
    nutrition?: string;
    features: string[];
    unit: 'kg' | 'lb' | 'quantity';
    ratings: number;
    salesCount: number;
    reviews: IProductReview[];
}

// Schema Definitions
/* timestamps: true (Phase 3) — the codebase already sorts and reads
   createdAt everywhere; now every new document is guaranteed to have
   it. Existing docs are untouched (see the optional backfill below). */
const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    badge: { type: String, default: '' },
    description: { type: String },
    shortDescription: { type: String },
    discount: { type: Number, default: 0 },

    options: [{
        name: { type: String, required: true },
        values: [{
            value: { type: String, required: true },
            price: { type: Number, required: true }
        }]
    }],

    ingredients: { type: String },
    nutrition: { type: String },
    features: [String],
    unit: { type: String, enum: ['kg', 'lb', 'quantity'], default: 'quantity' },

    ratings: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },

    reviews: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        user: String,
        comment: String,
        rating: Number,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

/* INDEXES (Phase 3) — every hot list query gets an index-backed path:
   - badge:      the four homepage tab queries (find badge: "Bestseller"…)
   - category:   related-products + per-category board queries
   - createdAt:  the "newest first" sort used on nearly every list
   Mongoose creates these automatically on first model use per process
   (autoIndex default). Verify in Atlas → Collections → Indexes after
   the first request post-deploy. */
productSchema.index({ badge: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;