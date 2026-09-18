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
}, { timestamps: true });

/* INDEX (Phase 3): the category tree (getNestedCategories) filters on
   parent twice per call — { parent: null } and { parent: { $ne: null } } */
categorySchema.index({ parent: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;