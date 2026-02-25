import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Blog from '@/models/Blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await dbConnect();

    // Fetch dynamic data
    const products = await Product.find({}).select('_id updatedAt').lean();
    const categories = await Category.find({}).select('_id').lean();
    const blogs = await Blog.find({}).select('_id date').lean();

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Static Pages
    const staticRoutes = [
        { url: baseUrl, lastModified: new Date(), priority: 1.0 },
        { url: `${baseUrl}/products`, lastModified: new Date(), priority: 0.8 },
        { url: `${baseUrl}/categories`, lastModified: new Date(), priority: 0.6 },
        { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7 },
        { url: `${baseUrl}/blogs`, lastModified: new Date(), priority: 0.6 },
    ];

    // Dynamic Product Routes
    const productRoutes = products.map((p: any) => ({
        url: `${baseUrl}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        priority: 0.9,
    }));

    // Dynamic Category Routes
    const categoryRoutes = categories.map((c: any) => ({
        url: `${baseUrl}/products?category=${c._id}`,
        lastModified: new Date(),
        priority: 0.8,
    }));

    // Dynamic Blog Routes
    const blogRoutes = blogs.map((b: any) => ({
        url: `${baseUrl}/blog/${b._id}`,
        lastModified: b.date ? new Date(b.date) : new Date(),
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}