import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
    await dbConnect();
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    return (
        <>
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
                    {blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog: any) => (
                                <Link href={`/blog/${blog._id}`} key={blog._id.toString()} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                                    <div className="h-56 overflow-hidden">
                                        <img
                                            src={blog.image || 'https://via.placeholder.com/600x400'}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-2">
                                            {new Date(blog.createdAt || blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <h3 className="font-serif text-2xl font-bold text-gray-800 mb-3 group-hover:text-brand-600 transition-colors leading-tight">
                                            {blog.title}
                                        </h3>
                                        {/* Strip HTML tags for the excerpt */}
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                                            {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                        </p>
                                        <span className="text-brand-600 font-semibold text-sm group-hover:underline flex items-center gap-2">
                                            Read Article <i className="fa-solid fa-arrow-right text-xs"></i>
                                        </span>
                                    </div>
                                </Link>
                            ))}
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