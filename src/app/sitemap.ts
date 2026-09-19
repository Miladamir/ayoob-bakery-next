import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    let products: any[] = [];
    let blogs: any[] = [];
    let categories: any[] = [];

    try {
        await dbConnect();
        [products, blogs, categories] = await Promise.all([
            Product.find({}).select('_id updatedAt').lean(),
            Blog.find({}).select('_id date updatedAt').lean(),
            /* categories aren't listed as URLs (SEO-1) but drive the
               /categories page's lastmod */
            Category.find({}).select('_id updatedAt').lean(),
        ]);
    } catch (error) {
        console.error('Sitemap: DB fetch failed — serving static routes only.', error);
    }

    /* ---------- honest lastmod ----------
       Real update time when we have one → else the legacy `date`
       field → else the ObjectId's embedded creation time. Never
       "now": a standing fake date trains crawlers to ignore every
       date in this file. */
    const toLastMod = (doc: any, fallbackField?: string): Date => {
        if (doc?.updatedAt) return new Date(doc.updatedAt);
        if (fallbackField && doc?.[fallbackField]) return new Date(doc[fallbackField]);
        try {
            return (doc._id as any).getTimestamp();
        } catch {
            return new Date();
        }
    };

    const latestOf = (docs: any[], fallbackField?: string): Date | undefined =>
        docs.length
            ? docs.map((d) => toLastMod(d, fallbackField)).reduce((a, b) => (b > a ? b : a))
            : undefined;

    const latestProduct = latestOf(products);
    const latestCategory = latestOf(categories);
    const latestBlog = latestOf(blogs, 'date');
    const catalogMax = [latestProduct, latestCategory]
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())[0];

    const staticRoutes: MetadataRoute.Sitemap = [
        /* catalog-driven pages: their content genuinely changes when
           the catalog does, so their lastmod is the newest item */
        { url: baseUrl, lastModified: catalogMax, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/products`, lastModified: catalogMax, changeFrequency: 'daily', priority: 0.9 },
        /* SEO-5: the menu — highest-intent local page ("bakery menu
           Dandenong North"), so it gets priority to match */
        { url: `${baseUrl}/menu`, lastModified: catalogMax, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/categories`, lastModified: catalogMax, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/blogs`, lastModified: latestBlog, changeFrequency: 'daily', priority: 0.7 },
        /* /about and /contact: no lastModified — we don't track copy
           changes, and a fake "now" would devalue the real dates */
        { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    ];

    const productRoutes: MetadataRoute.Sitemap = products.map((p: any) => ({
        url: `${baseUrl}/product/${p._id}`,
        lastModified: toLastMod(p),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b: any) => ({
        url: `${baseUrl}/blog/${b._id}`,
        lastModified: toLastMod(b, 'date'),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
}