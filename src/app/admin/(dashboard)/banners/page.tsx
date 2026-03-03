import dbConnect from "@/lib/dbConnect";
import Banner from "@/models/Banner";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
    await dbConnect();
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">Banners</h1>
                <Link href="/admin/banners/new" className="bg-brand-600 text-white px-5 py-2.5 md:px-6 md:py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-sm text-sm md:text-base">
                    <i className="fa-solid fa-plus mr-2"></i> Add Banner
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Link</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-3 md:p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {banners.map((banner: any) => (
                                <tr key={banner._id.toString()} className="hover:bg-gray-50">
                                    <td className="p-3 md:p-4">
                                        <img src={banner.image} className="w-20 md:w-32 h-12 md:h-16 rounded-lg object-cover shadow-sm" alt={banner.title} />
                                    </td>
                                    <td className="p-3 md:p-4 font-semibold text-gray-800 text-sm md:text-base">{banner.title}</td>
                                    <td className="p-3 md:p-4 text-gray-500 text-xs md:text-sm max-w-xs truncate hidden md:table-cell">{banner.link || 'N/A'}</td>
                                    <td className="p-3 md:p-4">
                                        {banner.isActive ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">Active</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-3 md:p-4 flex gap-3">
                                        <Link href={`/admin/banners/edit/${banner._id}`} className="text-brand-600 hover:text-brand-800 font-semibold text-sm">Edit</Link>
                                        <form action={`/api/admin/banners/delete/${banner._id}`} method="POST">
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