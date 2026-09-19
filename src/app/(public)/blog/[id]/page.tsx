import { cache } from "react";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import FontAwesome from "@/components/legacy/FontAwesome";
import { placeholderImg, slugify, stripHtml } from "@/lib/format";
import { SITE_URL as siteUrl, BUSINESS_NAME } from "@/lib/site";

interface Props {
    params: Promise<{ id: string }>;
}

/* ISR — admin mutations revalidate /blog/[id] immediately. */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
    try {
        await dbConnect();
        const blogs = await Blog.find({}).select("_id").lean();
        return blogs.map((b: any) => ({ id: String(b._id) }));
    } catch {
        return [];
    }
}

/* one query serves metadata + page */
const getBlog = cache(async (id: string) => {
    await dbConnect();
    return Blog.findById(id).lean();
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const blog: any = await getBlog(id);

    if (!blog) return { title: 'Post Not Found' };

    const plain = stripHtml(blog.content || '');
    const author = blog.author || BUSINESS_NAME;

    return {
        title: blog.title,
        description: plain.slice(0, 150),
        alternates: { canonical: `/blog/${id}` },
        openGraph: {
            title: blog.title,
            description: plain.slice(0, 150),
            images: blog.image ? [blog.image] : [],
            type: 'article',
            publishedTime: blog.createdAt || blog.date,
            /* SEO-4: author + tags in the article OG data */
            authors: [author],
            tags: Array.isArray(blog.tags) ? blog.tags : undefined,
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { id } = await params;

    const blog: any = await getBlog(id);

    if (!blog) notFound();

    const tags = Array.isArray(blog.tags) ? blog.tags : [];

    /* related posts: same tag first, topped up newest */
    let related: any[] = [];
    if (tags.length > 0) {
        related = await Blog.find({
            _id: { $ne: blog._id },
            tags: { $in: tags },
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title image createdAt")
            .lean();
    }
    if (related.length < 3) {
        const exclude = [blog._id, ...related.map((r) => r._id)];
        const more = await Blog.find({ _id: { $nin: exclude } })
            .sort({ createdAt: -1 })
            .limit(3 - related.length)
            .select("title image createdAt")
            .lean();
        related = [...related, ...more];
    }

    /* ---------- SEO-4: BlogPosting + BreadcrumbList ---------- */
    const plain = stripHtml(blog.content || "");
    const published = blog.createdAt || blog.date;
    const modified = blog.updatedAt || published;
    const author = blog.author || BUSINESS_NAME;

    const blogLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: plain.slice(0, 200),
        image: [blog.image || `${siteUrl}/images/og-image.jpg`],
        author: { "@type": "Person", name: author },
        publisher: {
            "@type": "Organization",
            name: BUSINESS_NAME,
            logo: { "@type": "ImageObject", url: `${siteUrl}/images/logo.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${id}` },
    };
    if (published) blogLd.datePublished = new Date(published).toISOString();
    if (modified) blogLd.dateModified = new Date(modified).toISOString();
    if (tags.length) blogLd.keywords = tags.join(", ");

    const crumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Journal", item: `${siteUrl}/blogs` },
            { "@type": "ListItem", position: 3, name: blog.title, item: `${siteUrl}/blog/${id}` },
        ],
    };

    return (
        <>
            <FontAwesome />

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />

            {/* Breadcrumbs */}
            <section className="pt-28 pb-4 bg-brand-900">
                <div className="container mx-auto px-6">
                    <nav className="text-sm text-brand-300 flex items-center gap-2 flex-wrap" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span aria-hidden="true">›</span>
                        <Link href="/blogs" className="hover:text-white">Journal</Link>
                        <span aria-hidden="true">›</span>
                        <span className="text-white/80" aria-current="page">{blog.title}</span>
                    </nav>
                </div>
            </section>

            {/* Hero Section */}
            <section className="pt-4 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm text-brand-200 flex-wrap">
                        <span><i className="fa-solid fa-calendar-days mr-2"></i> {new Date(blog.createdAt || blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span><i className="fa-solid fa-user mr-2"></i> {author}</span>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Main Content */}
                        <main className="lg:w-3/4">
                            <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={blog.image || placeholderImg(1200, 600, "Ayoob Bakery — journal")}
                                        alt={`${blog.title} — Ayoob Bakery Melbourne`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-8 md:p-12 article-content">
                                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                                </div>

                                {tags.length > 0 && (
                                    <div className="px-8 md:px-12 pb-8">
                                        <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                                            {tags.map((tag: string) => (
                                                <Link
                                                    key={tag}
                                                    href={`/blogs?tag=${encodeURIComponent(slugify(tag))}`}
                                                    className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors"
                                                >
                                                    {tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        </main>

                        {/* Sidebar */}
                        <aside className="lg:w-1/4">
                            <div className="sticky top-28 space-y-8">

                                {related.length > 0 && (
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs">Related Posts</h3>
                                        <div className="space-y-4">
                                            {related.map((post: any) => (
                                                <Link href={`/blog/${post._id}`} key={post._id.toString()} className="block group">
                                                    <h4 className="text-gray-700 font-semibold group-hover:text-brand-600 transition-colors text-sm leading-snug">
                                                        {post.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </aside>

                    </div>
                </div>
            </section>
        </>
    );
}