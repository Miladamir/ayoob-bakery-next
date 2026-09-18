import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Blog from '@/models/Blog';
import { SITE_URL } from '@/lib/site';

/* PHASE 3: regenerate hourly (ISR) instead of only at build time,
   and never let a DB outage break the build or the sitemap. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // PHASE 8: SITE_URL — the single source of truth for public URLs
    const baseUrl = SITE_URL;

    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
    ];

    // 2. Dynamic routes — best effort. If the DB is unreachable
    //    (e.g. during a build on a machine without credentials),
    //    the sitemap serves the static routes instead of failing.
    let products: any[] = [];
    let categories: any[] = [];
    let blogs: any[] = [];

    try {
        await dbConnect();
        [products, categories, blogs] = await Promise.all([
            Product.find({}).select('_id updatedAt').lean(),
            Category.find({}).select('_id').lean(),
            Blog.find({}).select('_id date').lean(),
        ]);
    } catch (error) {
        console.error('Sitemap: DB fetch failed — serving static routes only.', error);
    }

    // 3. Dynamic Product Routes
    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
        url: `${baseUrl}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // 4. Dynamic Category Routes
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: any) => ({
        url: `${baseUrl}/products?category=${c._id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    // 5. Dynamic Blog Routes
    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b: any) => ({
        url: `${baseUrl}/blog/${b._id}`,
        lastModified: b.date ? new Date(b.date) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}