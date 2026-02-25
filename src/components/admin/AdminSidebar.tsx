"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || (path !== "/admin" && pathname.startsWith(path));

    return (
        <aside className="w-64 bg-brand-900 text-white flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-brand-300 transition-colors">
                    <i className="fa-solid fa-wheat-awn text-xl"></i>
                    <span className="font-serif text-xl font-bold">Ayoob Bakery</span>
                </Link>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</p>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') && !isActive('/admin/products') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-gauge w-5"></i> Dashboard
                </Link>
                <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-box w-5"></i> Products
                </Link>
                <Link href="/admin/categories" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/categories') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-tags w-5"></i> Categories
                </Link>
                <Link href="/admin/blogs" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/blogs') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-newspaper w-5"></i> Blogs
                </Link>
                <Link href="/admin/banners" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/banners') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-images w-5"></i> Banners
                </Link>
            </nav>

            <div className="p-4 border-t border-white/10">
                <Link href="/" className="text-brand-300 text-sm hover:text-white flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back to Website
                </Link>
            </div>
        </aside>
    );
}