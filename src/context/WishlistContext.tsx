"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useSession } from "next-auth/react";

interface WishlistContextType {
    wishlistIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    refreshWishlist: (validIds: string[]) => void; // NEW: Allow page to sync valid IDs
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const processedAuthState = useRef<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (processedAuthState.current === status) return;

        processedAuthState.current = status;

        const initializeWishlist = async () => {
            const localData = localStorage.getItem("wishlist_guest");
            let localIds: string[] = localData ? JSON.parse(localData) : [];

            // FIX: Validate that IDs are valid 24-char Hex strings (MongoDB ObjectIDs)
            localIds = localIds.filter(id => id && /^[a-fA-F0-9]{24}$/.test(id));

            if (status === "authenticated") {
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
                    setWishlistIds(localIds);
                }
            } else if (status === "unauthenticated") {
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
                console.error("Toggle failed", e);
                setWishlistIds(wishlistIds);
                updateLocal(wishlistIds);
            }
        }
    };

    // NEW: Function to update list if invalid products are found
    const refreshWishlist = (validIds: string[]) => {
        // Only update if the list actually changed (e.g. ghost IDs removed)
        if (JSON.stringify(validIds.sort()) !== JSON.stringify(wishlistIds.sort())) {
            setWishlistIds(validIds);
            updateLocal(validIds);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};