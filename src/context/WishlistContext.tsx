"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface WishlistContextType {
    wishlistIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession(); // Only use status, not session object to prevent re-renders
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Consolidated Initialization Effect
    useEffect(() => {
        // Do not run if loading or already initialized
        if (status === "loading" || isInitialized) return;

        const initializeWishlist = async () => {
            // 1. Load Local (Guest) Data first
            const localData = localStorage.getItem("wishlist_guest");
            const localIds: string[] = localData ? JSON.parse(localData) : [];

            // 2. Handle Logged In User
            if (status === "authenticated") {
                try {
                    // Check if we need to merge
                    if (localIds.length > 0) {
                        // Merge local data with DB
                        await fetch("/api/wishlist/merge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: localIds }),
                        });
                        localStorage.removeItem("wishlist_guest");
                    }

                    // Fetch final state from DB
                    const res = await fetch("/api/wishlist");
                    if (res.ok) {
                        const data = await res.json();
                        setWishlistIds(data.ids || []);
                    }
                } catch (e) {
                    console.error("Init failed", e);
                    setWishlistIds(localIds); // Fallback to local
                }
            } else {
                // 3. Handle Guest
                setWishlistIds(localIds);
            }

            setIsInitialized(true); // Mark as done
        };

        initializeWishlist();
    }, [status, isInitialized]); // Dependencies

    // Helper to update LocalStorage
    const updateLocal = (ids: string[]) => {
        if (status !== "authenticated") {
            localStorage.setItem("wishlist_guest", JSON.stringify(ids));
        }
    };

    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = async (productId: string) => {
        // Optimistic Update
        let newIds: string[];
        if (wishlistIds.includes(productId)) {
            newIds = wishlistIds.filter(id => id !== productId);
        } else {
            newIds = [...wishlistIds, productId];
        }
        setWishlistIds(newIds);
        updateLocal(newIds);

        // Server Sync
        if (status === "authenticated") {
            try {
                await fetch(`/api/wishlist/toggle/${productId}`, { method: "POST" });
            } catch (e) {
                console.error("Toggle failed", e);
            }
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
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};