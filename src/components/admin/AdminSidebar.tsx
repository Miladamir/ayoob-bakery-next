"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
    onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || (path !== "/admin" && pathname.startsWith(path));

    // Helper to close sidebar on link click (mobile)
    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside className="h-full w-64 bg-brand-900 text-white flex-shrink-0 flex flex-col">

            {/* Mobile Header (Close Button) */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center lg:hidden">
                <span className="font-serif text-lg font-bold">Menu</span>
                <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-md">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            {/* Logo Area - Hidden on mobile to save space, or show if desired */}
            <div className="p-6 border-b border-white/10 hidden lg:block">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-brand-300 transition-colors">
                    <i className="fa-solid fa-wheat-awn text-xl"></i>
                    <span className="font-serif text-xl font-bold">Ayoob Bakery</span>
                </Link>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</p>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                <Link href="/admin" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') && !isActive('/admin/products') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-gauge w-5"></i> Dashboard
                </Link>
                <Link href="/admin/products" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/products') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-box w-5"></i> Products
                </Link>
                <Link href="/admin/categories" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/categories') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-tags w-5"></i> Categories
                </Link>
                <Link href="/admin/blogs" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/blogs') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-newspaper w-5"></i> Blogs
                </Link>
                <Link href="/admin/banners" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/banners') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                    <i className="fa-solid fa-images w-5"></i> Banners
                </Link>
            </nav>

            <div className="p-4 border-t border-white/10">
                <Link href="/" onClick={handleLinkClick} className="text-brand-300 text-sm hover:text-white flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back to Website
                </Link>
            </div>
        </aside>
    );
}