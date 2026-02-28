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

    // Fetch counts
    const productCount = await Product.countDocuments();
    const blogCount = await Blog.countDocuments();
    const bannerCount = await Banner.countDocuments();
    const categoryCount = await Category.countDocuments();
    const subscriberCount = await Subscriber.countDocuments();

    // Fetch recent products (last 5)
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).populate('category').lean();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 font-serif mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link href="/admin/products" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Products</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{productCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                            <i className="fa-solid fa-box text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Categories</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{categoryCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <i className="fa-solid fa-tags text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/blogs" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Blogs</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{blogCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <i className="fa-solid fa-newspaper text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/banners" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Banners</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{bannerCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <i className="fa-solid fa-images text-xl"></i>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/subscribers" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Subscribers</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{subscriberCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                            <i className="fa-solid fa-envelope text-xl"></i>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Recent Products</h2>
                    <Link href="/admin/products" className="text-brand-600 text-sm font-semibold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentProducts.map((product: any) => (
                                <tr key={product._id.toString()} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <img src={product.images[0]} className="w-12 h-12 rounded-lg object-cover" alt={product.name} />
                                    </td>
                                    <td className="p-4 font-semibold text-gray-800">{product.name}</td>
                                    <td className="p-4 text-gray-600">${product.price.toFixed(2)}</td>
                                    <td className="p-4 text-gray-600">{product.category?.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}