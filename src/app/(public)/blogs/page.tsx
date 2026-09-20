import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import Link from "next/link";
import FontAwesome from "@/components/legacy/FontAwesome";
import TagFilter from "@/components/blog/TagFilter";
import { placeholderImg, slugify, stripHtml } from "@/lib/format";
import type { Metadata } from "next";

/* ISR — admin mutations revalidate /blogs immediately. */
export const revalidate = 300;

/* SEO-5: this page had no metadata — untitled in search results until now */
export const metadata: Metadata = {
  title: "The Bakery Journal — Stories & Recipes",
  description:
    "Stories, recipes and behind-the-scenes moments from the Ayoob Bakery kitchen in Dandenong North — Afghan pastries, traditional baking and everything in between.",
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
    await dbConnect();
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    /* the real tags present on the posts */
    const tags = [...new Set(
      (blogs as any[])
        .flatMap((b) => (Array.isArray(b.tags) ? b.tags : []))
        .filter(Boolean)
    )];

    return (
        <>
            <FontAwesome />

            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="font-serif text-5xl font-bold mb-4">The Bakery Journal</h1>
                    <p className="text-brand-200 text-lg max-w-xl mx-auto">Stories, recipes, and behind-the-scenes moments from our kitchen.</p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">

                    {/* SEO-3 — real, crawlable tag links */}
                    {tags.length > 0 && <TagFilter tags={tags} total={blogs.length} />}

                    {blogs.length > 0 ? (
                        <div className="blog-grid">
                            {blogs.map((blog: any) => {
                                const plain = stripHtml(blog.content || "");
                                const words = plain.split(/\s+/).filter(Boolean).length;
                                const minutes = Math.max(1, Math.round(words / 200));
                                return (
                                    <Link
                                        href={`/blog/${blog._id}`}
                                        key={blog._id.toString()}
                                        className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="h-56 overflow-hidden">
                                            <img
                                                src={blog.image || placeholderImg(600, 400, "Ayoob Bakery — journal")}
                                                alt={`${blog.title} — Ayoob Bakery Melbourne`}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-2">
                                                {new Date(blog.createdAt || blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                <span className="text-gray-300 mx-1">·</span>
                                                {minutes} min read
                                            </p>
                                            <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                                                {blog.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                                                {plain.substring(0, 100)}…
                                            </p>
                                            {/* SEO-3 — tag chips, crawlable */}
                                            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {blog.tags.map((tag: string) => (
                                                        <Link
                                                            key={tag}
                                                            href={`/blogs?tag=${encodeURIComponent(slugify(tag))}`}
                                                            className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors"
                                                        >
                                                            {tag}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-brand-600 font-semibold text-sm group-hover:underline flex items-center gap-2">
                                                Read Article <i className="fa-solid fa-arrow-right text-xs"></i>
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Posts Yet</h3>
                            <p className="text-gray-500">Check back soon for delicious updates!</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}