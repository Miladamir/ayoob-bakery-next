"use client";

import Link from "next/link";
import { ICategory } from "@/models/Category";

interface SidebarProps {
    categories: ICategory[];
    currentCategory: ICategory | null;
    currentFilters: any;
}

export default function ShopSidebar({ categories, currentCategory, currentFilters }: SidebarProps) {
    return (
        <div className="sticky top-28 space-y-8">
            {/* Search */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Search</label>
                <form action="/search" method="GET">
                    <div className="relative">
                        <input type="text" name="q" placeholder="Find a product..." className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:border-brand-500" />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-500">
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </div>
                </form>
            </div>

            {/* Categories List */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Categories</h3>
                <div className="space-y-2">
                    <Link href="/products" className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${!currentCategory ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        All Products
                    </Link>
                    {categories.map((cat) => (
                        <div key={cat._id.toString()}>
                            <Link
                                href={`/products?category=${cat._id}`}
                                className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${currentCategory?._id.toString() === cat._id.toString() ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {cat.name}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Filter Form */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Filters</h3>
                <form action="/products" method="GET" className="space-y-4">
                    {/* Preserve category if set */}
                    {currentFilters.category && <input type="hidden" name="category" value={currentFilters.category} />}

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                        <input type="number" name="minPrice" defaultValue={currentFilters.minPrice || 0} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                        <input type="number" name="maxPrice" defaultValue={currentFilters.maxPrice || ""} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-brand-600 transition-colors">
                        Apply
                    </button>
                </form>
            </div>
        </div>
    );
}