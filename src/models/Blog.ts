import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    content: string;
    image: string;
    date: Date;
    toc: string[];
    embeds: string[];
}

const blogSchema = new Schema<IBlog>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: Date, default: Date.now },
    toc: [String],
    embeds: [{ type: String }]
});

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;