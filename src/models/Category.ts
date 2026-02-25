import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    parent: mongoose.Types.ObjectId | null;
    image?: string;
    description?: string;
}

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String },
    description: { type: String }
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;