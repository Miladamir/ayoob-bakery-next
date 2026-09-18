"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useSession } from "next-auth/react";
import { readGuestCart, writeGuestCart, clearGuestCart } from "@/lib/localStore";

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    images: string[];
    unit: string;
    quantity: number;
    note?: string;
    /** which option value this line is (e.g. "Half boule") —
        a line's identity is (product, variant) */
    variant?: string;
}

/** stable unique key for a cart line — product + variant */
export const cartLineKey = (item: { _id: string; variant?: string }) =>
    item.variant ? `${item._id}@${item.variant}` : item._id;

const MAX_QTY = 99;

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    addToCart: (product: any, quantity: number, variant?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, variant?: string) => Promise<void>;
    removeItem: (productId: string, variant?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** does this line match (id, variant)? undefined and "" both mean "base line" */
const sameLine = (item: CartItem, id: string, variant?: string) =>
    item._id === id && (item.variant || undefined) === (variant || undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartReady, setCartReady] = useState(false);

    const processedAuthState = useRef<string | null>(null);
    const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* PHASE 8: latest cart for the logout-retention path below */
    const cartItemsRef = useRef<CartItem[]>([]);
    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    /* ---------- crash-proof init (Phase 6) + logout retention (Phase 8) ---------- */
    useEffect(() => {
        if (status === "loading") return;
        const previous = processedAuthState.current;
        if (previous === status) return;
        processedAuthState.current = status;

        const initializeCart = async () => {
            const localItems = readGuestCart();

            if (status === "authenticated") {
                try {
                    if (localItems.length > 0) {
                        await fetch("/api/cart/merge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: localItems }),
                        });
                        clearGuestCart();
                    }
                    const res = await fetch("/api/cart");
                    if (res.ok) {
                        const data = await res.json();
                        setCartItems(data.items || []);
                    }
                } catch (e) {
                    console.error("Cart init failed", e);
                    setCartItems(localItems);
                }
            } else if (status === "unauthenticated") {
                /* PHASE 8 — LOGOUT RETENTION: signing out no longer wipes the
                   cart mid-visit. The just-viewed server cart carries over
                   into guest mode (localStorage); the server copy is
                   untouched and re-merges on the next login (max semantics).
                   DELETE THIS BLOCK to restore the old empty-on-logout
                   behaviour. */
                if (previous === "authenticated" && localItems.length === 0) {
                    const current = cartItemsRef.current;
                    if (current.length > 0) {
                        /* store one image per line — the UI only uses images[0] */
                        writeGuestCart(
                            current.map((it) => ({ ...it, images: it.images?.slice(0, 1) ?? [] }))
                        );
                        setCartItems(current);
                        setCartReady(true);
                        return;
                    }
                }
                setCartItems(localItems);
            }
            setCartReady(true);
        };

        initializeCart();
    }, [status]);

    /* single persistence point (Phase 6) */
    useEffect(() => {
        if (!cartReady) return;
        if (status !== "authenticated") {
            writeGuestCart(cartItems);
        }
    }, [cartItems, cartReady, status]);

    /* ---------- mutations — functional, race-safe (Phase 6) ---------- */

    const addToCart = async (product: any, quantity: number, variant?: string) => {
        const v = variant || undefined;
        const addQty = Math.max(1, Math.min(MAX_QTY, Math.round(Number(quantity)) || 1));

        setCartItems((prev) => {
            const existingIndex = prev.findIndex((item) => sameLine(item, product._id, v));
            if (existingIndex > -1) {
                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    quantity: Math.min(MAX_QTY, next[existingIndex].quantity + addQty),
                };
                return next;
            }
            return [
                ...prev,
                {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    images: Array.isArray(product.images) ? product.images : [],
                    unit: product.unit ?? "quantity",
                    quantity: addQty,
                    variant: v,
                },
            ];
        });

        if (status === "authenticated") {
            try {
                await fetch(`/api/cart/add/${product._id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: addQty, variant: v }),
                });
            } catch (e) {
                console.error("Add to cart failed", e);
            }
        }
    };

    const updateQuantity = async (productId: string, quantity: number, variant?: string) => {
        const v = variant || undefined;
        const q = Math.max(1, Math.min(MAX_QTY, Math.round(Number(quantity)) || 1));

        setCartItems((prev) =>
            prev.map((item) => (sameLine(item, productId, v) ? { ...item, quantity: q } : item))
        );

        if (status === "authenticated") {
            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = setTimeout(async () => {
                try {
                    await fetch(`/api/cart/update/${productId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantity: q, variant: v }),
                    });
                } catch (e) {
                    console.error("Update failed", e);
                }
            }, 500);
        }
    };

    const removeItem = async (productId: string, variant?: string) => {
        const v = variant || undefined;
        setCartItems((prev) => prev.filter((item) => !sameLine(item, productId, v)));

        if (status === "authenticated") {
            try {
                await fetch(`/api/cart/remove/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ variant: v }),
                });
            } catch (e) {
                console.error("Remove failed", e);
            }
        }
    };

    const clearCart = async () => {
        const snapshot = cartItems;
        setCartItems([]);

        if (status === "authenticated" && snapshot.length > 0) {
            await Promise.allSettled(
                snapshot.map((item) =>
                    fetch(`/api/cart/remove/${item._id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ variant: item.variant || undefined }),
                    }).catch(() => null)
                )
            );
        }
    };

    return (
        <CartContext.Provider
            value={{ cartItems, cartCount, cartTotal, addToCart, updateQuantity, removeItem, clearCart, cartReady }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};