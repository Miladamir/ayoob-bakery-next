import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    buttonText?: string;
    buttonLink?: string;
    position: 'hero' | 'promo';
    expiryDate?: Date;
    isActive: boolean;
    order: number;
}

const bannerSchema = new Schema<IBanner>({
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    image: { type: String, required: true },
    buttonText: { type: String },
    buttonLink: { type: String },
    position: { type: String, enum: ['hero', 'promo'], default: 'hero' },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;