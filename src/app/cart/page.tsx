"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CartItem from "@/components/ui/CartItem"; // Re-using the component from Phase 4
import { useState } from "react";

export default function CartPage() {
    const { cartItems, cartTotal, updateQuantity, removeItem, clearCart } = useCart();
    const [showPickupModal, setShowPickupModal] = useState(false);

    const handleUpdate = (index: number, newQty: number) => {
        // In the context, we track by ID. Here in the UI, we track by index.
        // We need to find the ID from the index.
        const item = cartItems[index];
        if (item) updateQuantity(item._id, newQty);
    };

    const handleRemove = (index: number) => {
        const item = cartItems[index];
        if (item) removeItem(item._id);
    };

    const handleNoteUpdate = (index: number, note: string) => {
        // Note: For simplicity, we'll log this. Implementing note updates requires 
        // extending the Context and API to handle the 'note' field.
        console.log("Update note for", cartItems[index]._id, note);
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
                            <div className="lg:col-span-2">
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={item._id}
                                        product={item as any} // Cast to any to match IProduct structure expected by component
                                        quantity={item.quantity}
                                        note={item.note}
                                        index={index}
                                        onUpdate={handleUpdate}
                                        onRemove={handleRemove}
                                        onNoteUpdate={handleNoteUpdate}
                                    />
                                ))}
                            </div>

                            {/* Right: Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-24 border border-gray-100">
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
                                        <p className="text-blue-600 mt-1">We do not offer delivery. Orders must be collected in-store.</p>
                                    </div>

                                    <button
                                        onClick={() => setShowPickupModal(true)}
                                        className="w-full bg-brand-600 text-white h-14 rounded-xl font-bold uppercase tracking-wider text-md flex items-center justify-center gap-2 shadow-lg hover:bg-brand-700 transition-colors"
                                    >
                                        <i className="fa-solid fa-bag-shopping"></i> Proceed to Pickup
                                    </button>

                                    <Link href="/products" className="block text-center mt-4 text-brand-600 font-semibold text-sm hover:underline">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Pickup Modal */}
            {showPickupModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="bg-brand-600 p-6 text-white text-center">
                            <i className="fa-solid fa-store text-4xl mb-2"></i>
                            <h3 className="font-serif text-2xl font-bold">In-Store Pickup</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <p className="text-gray-600 text-center">
                                We currently do not offer delivery. Please select a time to pick up your order.
                            </p>
                            <form action="/api/order/place" method="POST" className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                                    <input type="text" name="customerName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <input type="tel" name="customerPhone" required className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Pickup Time</label>
                                    <select name="pickupTime" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500 outline-none">
                                        <option value="asap">As soon as possible</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">1:00 PM</option>
                                        <option value="17:00">5:00 PM</option>
                                    </select>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <button type="button" onClick={() => setShowPickupModal(false)} className="w-1/3 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-grow py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md">Place Order</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}