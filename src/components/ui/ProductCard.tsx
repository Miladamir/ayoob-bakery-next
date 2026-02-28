"use client";

import Link from "next/link";
import Image from "next/image"; // Import Image
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { IProduct } from "@/models/Product";

interface ProductCardProps {
    product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart, cartItems } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const productId = product._id.toString();
    const isInCart = cartItems.some(item => item._id === productId);
    const isWishlisted = isInWishlist(productId);

    const displayPrice = product.discount > 0
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart(product, 1);
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(productId);
    };

    return (
        <div className="product-card bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer relative border border-transparent hover:shadow-xl transition-all duration-300">
            {/* Image Container */}
            <div className="relative h-72 overflow-hidden">
                <Link href={`/product/${productId}`} className="block w-full h-full">
                    <Image
                        src={product.images[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false} // Lazy load by default
                    />
                </Link>

                {/* Badge Logic */}
                {product.badge && (
                    <div className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide z-10">
                        {product.badge}
                    </div>
                )}

                {product.discount > 0 && (
                    <div className={`absolute top-4 ${product.badge ? 'left-24' : 'left-4'} bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wide z-10`}>
                        -{product.discount}%
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className="btn-favorite absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                >
                    <i className={`fa${isWishlisted ? 's' : 'r'} fa-heart ${isWishlisted ? 'text-brand-500' : 'text-gray-400'}`}></i>
                </button>
            </div>

            {/* Content Container */}
            <div className="p-5 border-t border-gray-50">
                {/* Category Tag */}
                <p className="text-xs text-brand-400 font-semibold uppercase tracking-widest mb-1">
                    {(product.category as any)?.name || 'Uncategorized'}
                </p>

                {/* Header: Title & Price */}
                <div className="flex justify-between items-start gap-4 mb-2">
                    <Link href={`/product/${productId}`}>
                        <h3 className="font-serif text-xl font-bold text-gray-800 leading-tight group-hover:text-brand-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="text-right flex-shrink-0">
                        <span className="text-xl font-bold text-brand-600">${displayPrice}</span>
                        <span className="block text-xs text-gray-400">{product.unit}</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {product.description ? product.description.substring(0, 60) + '...' : 'Delicious freshly baked item.'}
                </p>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 border-dashed">
                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <i key={i} className={`fa${product.ratings >= i ? 's' : product.ratings >= i - 0.5 ? 's fa-star-half-stroke' : 'r'} fa-star`}></i>
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">({product.reviews?.length || 0})</span>
                    </div>

                    {/* Add to Cart Logic */}
                    {isInCart ? (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-green-600">
                                <i className="fa-solid fa-check-circle"></i>
                                <span className="text-sm font-bold">Added</span>
                            </div>
                            <Link href="/cart" onClick={(e) => e.stopPropagation()} className="text-brand-600 font-bold text-sm hover:underline">
                                View Cart
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="btn-add-cart w-10 h-10 rounded-full border-2 border-gray-100 text-gray-400 flex items-center justify-center hover:border-brand-500 hover:text-white hover:bg-brand-500 transition-all"
                        >
                            <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}