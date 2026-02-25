import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
    params: { id: string };
}

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }: Props) {
    await dbConnect();

    const blog = await Blog.findById(params.id).lean();

    if (!blog) {
        notFound();
    }

    // Fetch recent blogs for sidebar (excluding current)
    const recentBlogs = await Blog.find({ _id: { $ne: blog._id } })
        .limit(3)
        .sort({ createdAt: -1 })
        .lean();

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <div className="mb-6 text-sm text-brand-300">
                        <Link href="/blogs" className="hover:text-white">Back to Journal</Link>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm text-brand-200">
                        {/* Fix: Cast to any to access createdAt safely */}
                        <span><i className="fa-solid fa-calendar-days mr-2"></i> {new Date((blog as any).createdAt || blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span><i className="fa-solid fa-user mr-2"></i> Ayoob Bakery</span>
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
                                {/* Featured Image */}
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={blog.image || 'https://via.placeholder.com/1200x600'}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Article Body */}
                                <div className="p-8 md:p-12 article-content">
                                    {/* Render HTML content safely. 
                      Note: In a real app, you'd want to sanitize this HTML on the server 
                      or ensure it's safe from XSS before storing. */}
                                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                                </div>
                            </article>

                            {/* Share Section */}
                            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="font-semibold text-gray-700">Enjoyed this story? Share it!</p>
                                <div className="flex gap-3">
                                    <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                        <i className="fa-brands fa-facebook-f"></i>
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                        <i className="fa-brands fa-twitter"></i>
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                        <i className="fa-brands fa-whatsapp"></i>
                                    </a>
                                </div>
                            </div>
                        </main>

                        {/* Sidebar */}
                        <aside className="lg:w-1/4">
                            <div className="sticky top-28 space-y-8">

                                {/* Recent Posts */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs">Recent Posts</h3>
                                    <div className="space-y-4">
                                        {recentBlogs.length > 0 ? (
                                            recentBlogs.map((post: any) => (
                                                <Link href={`/blog/${post._id}`} key={post._id.toString()} className="block group">
                                                    <h4 className="text-gray-700 font-semibold group-hover:text-brand-600 transition-colors text-sm leading-snug">
                                                        {post.title}
                                                    </h4>
                                                    {/* Fix: Cast to any to access createdAt safely */}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date((post as any).createdAt || post.date).toLocaleDateString()}
                                                    </p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400">No recent posts.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Categories Placeholder */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors cursor-pointer">Recipes</span>
                                        <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors cursor-pointer">News</span>
                                        <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full hover:bg-brand-100 transition-colors cursor-pointer">Tips</span>
                                    </div>
                                </div>

                            </div>
                        </aside>

                    </div>
                </div>
            </section>
        </>
    );
}