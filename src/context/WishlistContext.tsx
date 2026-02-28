"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useSession } from "next-auth/react";

interface WishlistContextType {
    wishlistIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    // Track processed state to handle Login transitions
    const processedAuthState = useRef<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (processedAuthState.current === status) return;

        processedAuthState.current = status;

        const initializeWishlist = async () => {
            if (status === "authenticated") {
                const localData = localStorage.getItem("wishlist_guest");
                const localIds: string[] = localData ? JSON.parse(localData) : [];

                try {
                    if (localIds.length > 0) {
                        await fetch("/api/wishlist/merge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: localIds }),
                        });
                        localStorage.removeItem("wishlist_guest");
                    }

                    const res = await fetch("/api/wishlist");
                    if (res.ok) {
                        const data = await res.json();
                        setWishlistIds(data.ids || []);
                    }
                } catch (e) {
                    console.error("Init failed", e);
                }
            } else if (status === "unauthenticated") {
                const localData = localStorage.getItem("wishlist_guest");
                const localIds: string[] = localData ? JSON.parse(localData) : [];
                setWishlistIds(localIds);
            }
        };

        initializeWishlist();
    }, [status]);

    const updateLocal = (ids: string[]) => {
        if (status !== "authenticated") {
            localStorage.setItem("wishlist_guest", JSON.stringify(ids));
        }
    };

    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = async (productId: string) => {
        let newIds: string[];
        const wasInWishlist = wishlistIds.includes(productId);

        if (wasInWishlist) {
            newIds = wishlistIds.filter(id => id !== productId);
        } else {
            newIds = [...wishlistIds, productId];
        }

        setWishlistIds(newIds);
        updateLocal(newIds);

        if (status === "authenticated") {
            try {
                await fetch(`/api/wishlist/toggle/${productId}`, { method: "POST" });
            } catch (e) {
                console.error("Toggle failed, reverting", e);
                // Revert on failure
                setWishlistIds(wishlistIds);
                updateLocal(wishlistIds);
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