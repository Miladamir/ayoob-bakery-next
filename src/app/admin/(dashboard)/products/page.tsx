import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    await dbConnect();
    const products = await Product.find().populate('category').sort({ createdAt: -1 }).lean();
    const categories = await Category.find().lean();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 font-serif">Products</h1>
                <Link href="/admin/products/new" className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm">
                    <i className="fa-solid fa-plus mr-2"></i> Add Product
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Badge</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product: any) => (
                                <tr key={product._id.toString()} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <img src={product.images[0]} className="w-12 h-12 rounded-lg object-cover" alt={product.name} />
                                    </td>
                                    <td className="p-4 font-semibold text-gray-800">{product.name}</td>
                                    <td className="p-4 text-gray-600">${product.price.toFixed(2)} {product.discount > 0 && <span className="text-red-500 text-xs">(-{product.discount}%)</span>}</td>
                                    <td className="p-4 text-gray-600">{product.category?.name || 'N/A'}</td>
                                    <td className="p-4">
                                        {product.badge && <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full">{product.badge}</span>}
                                    </td>
                                    <td className="p-4 flex gap-3">
                                        <Link href={`/admin/products/edit/${product._id}`} className="text-brand-600 hover:text-brand-800 font-semibold text-sm">Edit</Link>
                                        <form action={`/api/admin/products/delete/${product._id}`} method="POST">
                                            <button type="submit" className="text-red-500 hover:text-red-700 font-semibold text-sm">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}