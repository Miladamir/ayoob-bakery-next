"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useSession } from "next-auth/react";
import { readGuestWishlist, writeGuestWishlist, clearGuestWishlist, isId } from "@/lib/localStore";

interface WishlistContextType {
    wishlistIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    refreshWishlist: (validIds: string[]) => void;
    /** true once the initial guest/server wishlist load has finished */
    wishlistReady: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession();
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [wishlistReady, setWishlistReady] = useState(false);

    const processedAuthState = useRef<string | null>(null);
    const inflight = useRef<Map<string, number>>(new Map());

    /* PHASE 8: latest wishlist for the logout-retention path below */
    const wishlistIdsRef = useRef<string[]>([]);
    useEffect(() => {
        wishlistIdsRef.current = wishlistIds;
    }, [wishlistIds]);

    /* crash-proof init (Phase 6) + logout retention (Phase 8) */
    useEffect(() => {
        if (status === "loading") return;
        const previous = processedAuthState.current;
        if (previous === status) return;

        processedAuthState.current = status;

        const initializeWishlist = async () => {
            const localIds = readGuestWishlist();

            if (status === "authenticated") {
                try {
                    if (localIds.length > 0) {
                        await fetch("/api/wishlist/merge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: localIds }),
                        });
                        clearGuestWishlist();
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
                /* PHASE 8 — LOGOUT RETENTION: same policy as the cart.
                   DELETE THIS BLOCK to restore empty-on-logout. */
                if (previous === "authenticated" && localIds.length === 0) {
                    const current = wishlistIdsRef.current;
                    if (current.length > 0) {
                        writeGuestWishlist(current);
                        setWishlistIds(current);
                        setWishlistReady(true);
                        return;
                    }
                }
                setWishlistIds(localIds);
            }

            setWishlistReady(true);
        };

        initializeWishlist();
    }, [status]);

    /* single persistence point (Phase 6) */
    useEffect(() => {
        if (!wishlistReady) return;
        if (status !== "authenticated") {
            writeGuestWishlist(wishlistIds);
        }
    }, [wishlistIds, wishlistReady, status]);

    const isInWishlist = (productId: string) => wishlistIds.includes(productId);

    const toggleWishlist = async (productId: string) => {
        if (!isId(productId)) return;

        const flip = (prev: string[]) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId];

        const seq = (inflight.current.get(productId) ?? 0) + 1;
        inflight.current.set(productId, seq);
        setWishlistIds(flip);

        if (status === "authenticated") {
            try {
                await fetch(`/api/wishlist/toggle/${productId}`, { method: "POST" });
                if (inflight.current.get(productId) === seq) {
                    inflight.current.delete(productId);
                }
            } catch (e) {
                console.error("Toggle failed", e);
                if (inflight.current.get(productId) === seq) {
                    inflight.current.delete(productId);
                    setWishlistIds(flip);
                }
            }
        }
    };

    const refreshWishlist = (validIds: string[]) => {
        setWishlistIds((prev) => {
            const next = Array.from(new Set(validIds.filter(isId)));
            const same =
                prev.length === next.length && next.every((id) => prev.includes(id));
            return same ? prev : next;
        });
    };

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, refreshWishlist, wishlistReady }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};