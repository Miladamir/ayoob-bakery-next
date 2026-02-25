"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductActionsProps {
    product: any;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addToCart, cartItems } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    // Calculate initial display price
    const initialPrice = product.discount > 0
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);

    const [selectedPrice, setSelectedPrice] = useState(parseFloat(initialPrice));
    const [quantity, setQuantity] = useState(1);

    const isInCart = cartItems.some(item => item._id === product._id);
    const isWishlisted = isInWishlist(product._id);

    const handleOptionChange = (price: number) => {
        // If discount exists, apply it to the option price
        const finalPrice = product.discount > 0
            ? price * (1 - product.discount / 100)
            : price;
        setSelectedPrice(finalPrice);
    };

    const handleAddToCart = async () => {
        // Construct product data with the currently selected variant price
        const productData = {
            ...product,
            price: selectedPrice
        };
        await addToCart(productData, quantity);
    };

    return (
        <div>
            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <i key={i} className={`${product.ratings >= i ? 'fas' : 'far'} fa-star`}></i>
                    ))}
                </div>
                <span className="text-gray-500 text-sm">({product.reviews?.length || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-6">
                <span className="text-5xl font-bold text-brand-600">${selectedPrice.toFixed(2)}</span>
                {product.discount > 0 && (
                    <span className="text-gray-400 line-through text-xl mb-1">${product.price.toFixed(2)}</span>
                )}
                <span className="text-gray-400 text-sm mb-2">/ {product.unit}</span>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
                <p className="text-gray-600 text-lg leading-relaxed mb-8 border-l-4 border-brand-200 pl-4">
                    {product.shortDescription}
                </p>
            )}

            {/* Options / Variants */}
            {product.options && product.options.length > 0 && (
                <div className="space-y-4 mb-6">
                    {product.options.map((opt: any, i: number) => (
                        <div key={i}>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{opt.name}</label>
                            <div className="flex flex-wrap gap-3">
                                {opt.values.map((val: any, j: number) => (
                                    <button
                                        key={j}
                                        onClick={() => handleOptionChange(val.price)}
                                        className={`px-5 py-2 border-2 rounded-lg font-semibold text-sm transition-colors ${j === 0
                                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                                            : 'border-gray-200 text-gray-700 hover:border-brand-300'
                                            }`}
                                    >
                                        {val.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-14">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 h-full text-gray-500 hover:bg-gray-50 text-lg font-bold">−</button>
                    <input type="number" value={quantity} readOnly className="w-14 h-full text-center border-0 text-lg font-semibold bg-transparent focus:outline-none" />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-5 h-full text-gray-500 hover:bg-gray-50 text-lg font-bold">+</button>
                </div>

                {/* Add to Cart Button */}
                {isInCart ? (
                    <Link href="/cart" className="flex-grow bg-green-600 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-colors">
                        <i className="fa-solid fa-check"></i> View in Cart
                    </Link>
                ) : (
                    <button onClick={handleAddToCart} className="flex-grow bg-brand-600 text-white h-14 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg flex items-center justify-center gap-3">
                        <i className="fa-solid fa-shopping-bag"></i> Add to Cart
                    </button>
                )}

                {/* Wishlist */}
                <button
                    onClick={() => toggleWishlist(product._id)}
                    className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500'}`}
                >
                    <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xl`}></i>
                </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <i className="fa-solid fa-truck-fast text-brand-500 text-lg"></i>
                    <span>Fresh Daily</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <i className="fa-solid fa-leaf text-brand-500 text-lg"></i>
                    <span>100% Organic</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <i className="fa-solid fa-shield-check text-brand-500 text-lg"></i>
                    <span>Quality Guarantee</span>
                </div>
            </div>
        </div>
    );
}