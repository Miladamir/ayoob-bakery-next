"use client";

import Link from "next/link";

export default function Sidebar() {
    return (
        <>
            {/* Overlay - logic to show/hide will be connected to context later */}
            <div id="sidebar-overlay" className="sidebar-overlay hidden"></div>

            <aside id="global-sidebar" className="global-sidebar hidden">
                <header className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-serif text-xl font-bold text-gray-800">Ayoob Bakery</h2>
                    <button className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </header>

                <div className="p-6">
                    <ul className="space-y-4">
                        <li><Link href="/" className="flex items-center gap-3 text-gray-700 hover:text-brand-600"><i className="fas fa-home w-5"></i> Home</Link></li>
                        <li><Link href="/products" className="flex items-center gap-3 text-gray-700 hover:text-brand-600"><i className="fas fa-store w-5"></i> All Products</Link></li>
                        <li><Link href="/categories" className="flex items-center gap-3 text-gray-700 hover:text-brand-600"><i className="fas fa-tags w-5"></i> Categories</Link></li>
                        <li><Link href="/contact" className="flex items-center gap-3 text-gray-700 hover:text-brand-600"><i className="fas fa-envelope w-5"></i> Contact</Link></li>
                    </ul>
                </div>
            </aside>
        </>
    );
}