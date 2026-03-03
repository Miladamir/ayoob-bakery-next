import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Blog from "@/models/Blog";
import Banner from "@/models/Banner";
import Category from "@/models/Category";
import Subscriber from "@/models/Subscriber";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    await dbConnect();

    const productCount = await Product.countDocuments();
    const blogCount = await Blog.countDocuments();
    const bannerCount = await Banner.countDocuments();
    const categoryCount = await Category.countDocuments();
    const subscriberCount = await Subscriber.countDocuments();

    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).populate('category').lean();

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif mb-6 md:mb-8">Dashboard</h1>

            {/* Stats Grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                <Link href="/admin/products" className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Products</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{productCount}</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                            <i className="fa-solid fa-box text-lg md:text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories" className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Categories</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{categoryCount}</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <i className="fa-solid fa-tags text-lg md:text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/blogs" className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Blogs</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{blogCount}</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <i className="fa-solid fa-newspaper text-lg md:text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/banners" className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Banners</p>
                            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{bannerCount}</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <i className="fa-solid fa-images text-lg md:text-xl"></i>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Recent Products</h2>
                    <Link href="/admin/products" className="text-brand-600 text-xs md:text-sm font-semibold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    {/* FIX: Removed comment inside <table> to prevent hydration error */}
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentProducts.map((product: any) => (
                                <tr key={product._id.toString()} className="hover:bg-gray-50">
                                    <td className="p-3 md:p-4">
                                        <img src={product.images[0]} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" alt={product.name} />
                                    </td>
                                    <td className="p-3 md:p-4 font-semibold text-gray-800 text-sm md:text-base">{product.name}</td>
                                    <td className="p-3 md:p-4 text-gray-600 text-sm hidden sm:table-cell">${product.price.toFixed(2)}</td>
                                    <td className="p-3 md:p-4 text-gray-600 text-sm hidden md:table-cell">{product.category?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}