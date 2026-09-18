import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    content: string;
    image: string;
    author?: string;
    tags: string[];
    date: Date;
    toc: string[];
    embeds: string[];
}

const blogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    /* FIX: was required:true, but the form never required an image —
       saving a post without one threw a Mongoose ValidationError */
    image: { type: String, default: '' },
    /* FIX (B1): BlogForm has always sent author + tags, but the
       schema never had these fields — Mongoose strict mode silently
       dropped them on every save. */
    author: { type: String, default: 'Admin' },
    tags: [String],
    date: { type: Date, default: Date.now },
    toc: [String],
    embeds: [{ type: String }]
}, { timestamps: true });

/* INDEX (Phase 3): every blog list (public + admin + sitemap) sorts
   newest-first on createdAt */
blogSchema.index({ createdAt: -1 });

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;