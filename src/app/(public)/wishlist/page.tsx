"use client";

import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/models/Product";

export default function WishlistPage() {
    const { wishlistIds, refreshWishlist } = useWishlist(); // Get refreshWishlist
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (wishlistIds.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/products/by-ids?ids=${wishlistIds.join(',')}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);

                    // FIX: CLEANUP LOGIC
                    // Compare fetched IDs with requested IDs
                    const fetchedIds = data.map((p: any) => p._id.toString());

                    // Find IDs that were in wishlist but NOT in DB (Ghost IDs)
                    const ghostIds = wishlistIds.filter(id => !fetchedIds.includes(id));

                    // If we found ghost IDs, refresh the context to remove them
                    if (ghostIds.length > 0) {
                        console.log("Cleaning invalid wishlist IDs:", ghostIds);
                        refreshWishlist(fetchedIds);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch wishlist products", error);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if wishlistIds is populated (avoids flash of empty state on first render)
        if (wishlistIds.length > 0 || !loading) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [wishlistIds]); // Dependency is fine, logic handles the rest

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
                    {loading ? (
                        <div className="text-center text-gray-500 py-20">Loading favorites...</div>
                    ) : products.length === 0 ? (
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