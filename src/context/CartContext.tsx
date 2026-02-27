"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface CartItem {
    _id: string;
    name: string;
    price: number;
    images: string[];
    unit: string;
    quantity: number;
    note?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    addToCart: (product: any, quantity: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { status } = useSession(); // Use only status
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 1. Consolidated Initialization
    useEffect(() => {
        if (status === "loading" || isInitialized) return;

        const initializeCart = async () => {
            const localData = localStorage.getItem("cart_guest");
            const localItems: CartItem[] = localData ? JSON.parse(localData) : [];

            if (status === "authenticated") {
                try {
                    if (localItems.length > 0) {
                        await fetch("/api/cart/merge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ items: localItems }),
                        });
                        localStorage.removeItem("cart_guest");
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
            } else {
                setCartItems(localItems);
            }

            setIsInitialized(true);
        };

        initializeCart();
    }, [status, isInitialized]);

    const updateLocal = (items: CartItem[]) => {
        if (status !== "authenticated") {
            localStorage.setItem("cart_guest", JSON.stringify(items));
        }
    };

    const addToCart = async (product: any, quantity: number) => {
        const existingIndex = cartItems.findIndex(item => item._id === product._id);
        let newItems: CartItem[];

        if (existingIndex > -1) {
            newItems = [...cartItems];
            newItems[existingIndex].quantity += quantity;
        } else {
            const newItem: CartItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
                unit: product.unit,
                quantity: quantity
            };
            newItems = [...cartItems, newItem];
        }

        setCartItems(newItems);
        updateLocal(newItems);

        if (status === "authenticated") {
            try {
                await fetch(`/api/cart/add/${product._id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity }),
                });
            } catch (e) {
                console.error("Add to cart failed", e);
            }
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        const newItems = cartItems.map(item =>
            item._id === productId ? { ...item, quantity } : item
        );
        setCartItems(newItems);
        updateLocal(newItems);

        if (status === "authenticated") {
            await fetch(`/api/cart/update/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });
        }
    };

    const removeItem = async (productId: string) => {
        const newItems = cartItems.filter(item => item._id !== productId);
        setCartItems(newItems);
        updateLocal(newItems);

        if (status === "authenticated") {
            await fetch(`/api/cart/remove/${productId}`, { method: "POST" });
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        updateLocal([]);
        if (status === "authenticated") {
            await fetch("/api/cart/clear", { method: "POST" });
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};