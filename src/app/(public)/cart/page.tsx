"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
    const { cartItems, cartTotal, updateQuantity, removeItem } = useCart();

    const handleUpdate = (productId: string, newQty: number) => {
        if (newQty < 1) return;
        updateQuantity(productId, newQty);
    };

    const handleRemove = (productId: string) => {
        if (confirm("Are you sure you want to remove this item?")) {
            removeItem(productId);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="font-serif text-5xl font-bold mb-4">Your Selection</h1>
                    <p className="text-brand-200">Review your items before pickup</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" className="w-24 h-24 mx-auto mb-6 opacity-50" alt="Empty" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
                            <p className="text-gray-500 mb-6">Looks like you haven't added any delicious items yet.</p>
                            <Link href="/products" className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold uppercase text-sm tracking-wider hover:bg-brand-700 transition-colors">
                                Start Browsing
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left: Cart Items List */}
                            <div className="lg:col-span-2 space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
                                        {/* Image */}
                                        <div className="w-1/3 h-48 relative">
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="w-2/3 p-6 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/product/${item._id}`} className="hover:text-brand-600">
                                                    <h3 className="font-serif text-xl font-bold text-gray-800">{item.name}</h3>
                                                </Link>
                                                <p className="text-sm text-gray-400 mt-1">{item.unit}</p>
                                                <p className="text-lg font-bold text-brand-600 mt-2">${item.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => handleUpdate(item._id, item.quantity - 1)}
                                                        className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-bold"
                                                    >-</button>
                                                    <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdate(item._id, item.quantity + 1)}
                                                        className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-bold"
                                                    >+</button>
                                                </div>

                                                {/* Remove & Subtotal */}
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                                                    <button
                                                        onClick={() => handleRemove(item._id)}
                                                        className="text-red-500 text-sm font-semibold hover:underline mt-1"
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-28">
                                    <h3 className="font-serif text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Order Summary</h3>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({cartItems.length} items)</span>
                                            <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Pickup Fee</span>
                                            <span className="text-green-600 font-semibold">FREE</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mb-6">
                                        <div className="flex justify-between text-gray-800">
                                            <span className="text-xl font-bold">Total</span>
                                            <span className="text-2xl font-bold text-brand-600">${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 text-sm text-blue-700">
                                        <p className="font-bold flex items-center gap-2"><i className="fa-solid fa-store"></i> Pickup Only</p>
                                        <p className="text-blue-600 mt-1">Orders must be collected in-store.</p>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className="block w-full bg-brand-600 text-white h-14 rounded-xl font-bold uppercase tracking-wider text-md flex items-center justify-center gap-2 shadow-lg hover:bg-brand-700 transition-colors"
                                    >
                                        <i className="fa-solid fa-bag-shopping"></i> Proceed to Checkout
                                    </Link>

                                    <Link href="/products" className="block text-center mt-4 text-brand-600 font-semibold text-sm hover:underline">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}