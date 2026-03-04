"use client";

import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/models/Product";

export default function WishlistPage() {
    const { wishlistIds, refreshWishlist } = useWishlist();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            // 1. Handle Empty State Immediately
            if (!wishlistIds || wishlistIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(false);

            try {
                // 2. CRITICAL FIX: Add Timestamp to bust Vercel/Edge Cache
                // This forces a fresh request every time
                const res = await fetch(`/api/products/by-ids?ids=${wishlistIds.join(',')}&t=${Date.now()}`);

                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);

                    // 3. Cleanup "Ghost" IDs (Deleted Products)
                    const fetchedIds = data.map((p: any) => p._id.toString());
                    const ghostIds = wishlistIds.filter(id => !fetchedIds.includes(id));

                    // If we found IDs that don't exist in DB, remove them from context
                    if (ghostIds.length > 0) {
                        console.log("Cleaning invalid wishlist IDs:", ghostIds);
                        refreshWishlist(fetchedIds);
                    }
                } else {
                    console.error("Failed to fetch wishlist products");
                    setError(true);
                }
            } catch (err) {
                console.error("Network error fetching wishlist", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [wishlistIds]); // Standard dependency

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-brand-300">
                            <i className="fa-solid fa-heart text-2xl"></i>
                        </div>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">My Favorites</h1>
                    <p className="text-brand-200">You have saved <span className="font-bold text-white">{products.length}</span> items.</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">

                    {/* Loading State */}
                    {loading ? (
                        <div className="text-center text-gray-500 py-20">
                            <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
                            <p>Loading favorites...</p>
                        </div>
                    ) : error ? (
                        /* Error State */
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-300">
                                <i className="fa-solid fa-wifi text-4xl"></i>
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
                            <p className="text-gray-500 mb-6">Could not load your favorites. Please check your connection.</p>
                            <button onClick={() => window.location.reload()} className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold uppercase text-sm tracking-wider hover:bg-brand-700 transition-colors">
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <i className="fa-solid fa-heart-crack text-4xl"></i>
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
                            <p className="text-gray-500 mb-6">Looks like you haven't saved any items yet.</p>
                            <Link href="/products" className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold uppercase text-sm tracking-wider hover:bg-brand-700 transition-colors">
                                Start Browsing
                            </Link>
                        </div>
                    ) : (
                        /* Product Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCard key={product._id.toString()} product={product} />
                            ))}
                        </div>
                    )}

                </div>
            </section>
        </>
    );
}