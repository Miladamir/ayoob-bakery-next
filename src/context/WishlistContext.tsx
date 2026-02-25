"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WishlistContextType {
    wishlistIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch("/api/wishlist");
                if (res.ok) {
                    const data = await res.json();
                    setWishlistIds(data.ids || []);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, []);

    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = async (productId: string) => {
        // Optimistic Update
        const isCurrentlyIn = wishlistIds.includes(productId);
        let newIds: string[];

        if (isCurrentlyIn) {
            newIds = wishlistIds.filter(id => id !== productId);
        } else {
            newIds = [...wishlistIds, productId];
        }
        setWishlistIds(newIds);

        try {
            await fetch(`/api/wishlist/toggle/${productId}`, { method: "POST" });
        } catch (error) {
            // Revert on error
            setWishlistIds(wishlistIds);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
};