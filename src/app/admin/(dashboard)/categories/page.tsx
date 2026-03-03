import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 }).lean();

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">Categories</h1>
                <Link href="/admin/categories/new" className="bg-brand-600 text-white px-5 py-2.5 md:px-6 md:py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm text-sm md:text-base">
                    <i className="fa-solid fa-plus mr-2"></i> Add Category
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category: any) => (
                                <tr key={category._id.toString()} className="hover:bg-gray-50">
                                    <td className="p-3 md:p-4">
                                        <img src={category.image || "https://via.placeholder.com/100"} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" alt={category.name} />
                                    </td>
                                    <td className="p-3 md:p-4 font-semibold text-gray-800 text-sm md:text-base">{category.name}</td>
                                    <td className="p-3 md:p-4 text-gray-500 font-mono text-xs md:text-sm hidden sm:table-cell">{category.slug}</td>
                                    <td className="p-3 md:p-4 flex gap-3">
                                        <Link href={`/admin/categories/edit/${category._id}`} className="text-brand-600 hover:text-brand-800 font-semibold text-sm">Edit</Link>
                                        <form action={`/api/admin/categories/delete/${category._id}`} method="POST">
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