"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types
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
    cartTotal: number;
    cartCount: number;
    addToCart: (product: any, quantity: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // Fetch initial cart from server (session/db)
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch("/api/cart");
                if (res.ok) {
                    const data = await res.json();
                    setCartItems(data.items || []);
                }
            } catch (error) {
                console.error("Failed to fetch cart", error);
            }
        };
        fetchCart();
    }, []);

    // Recalculate totals whenever cartItems change
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartTotal(total);
        setCartCount(count);
    }, [cartItems]);

    const addToCart = async (product: any, quantity: number) => {
        // 1. Optimistic UI Update
        const existingItem = cartItems.find(item => item._id === product._id);

        let newItems;
        if (existingItem) {
            newItems = cartItems.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        } else {
            const newItem: CartItem = {
                _id: product._id,
                name: product.name,
                price: product.price, // Note: Logic for discount/variants should happen before passing here
                images: product.images,
                unit: product.unit,
                quantity
            };
            newItems = [...cartItems, newItem];
        }
        setCartItems(newItems);

        // 2. Server Sync
        try {
            await fetch(`/api/cart/add/${product._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity })
            });
        } catch (error) {
            console.error("Failed to add to cart", error);
            // Revert on failure if needed
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        // Optimistic Update
        const prevItems = cartItems;
        const newItems = cartItems.map(item =>
            item._id === productId ? { ...item, quantity } : item
        );
        setCartItems(newItems);

        try {
            await fetch(`/api/cart/update/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity })
            });
        } catch (error) {
            setCartItems(prevItems); // Revert
        }
    };

    const removeItem = async (productId: string) => {
        const prevItems = cartItems;
        setCartItems(cartItems.filter(item => item._id !== productId));

        try {
            await fetch(`/api/cart/remove/${productId}`, { method: "POST" });
        } catch (error) {
            setCartItems(prevItems);
        }
    };

    const clearCart = async () => {
        setCartItems([]);
        await fetch("/api/cart/clear", { method: "POST" });
    };

    return (
        <CartContext.Provider value={{ cartItems, cartTotal, cartCount, addToCart, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};