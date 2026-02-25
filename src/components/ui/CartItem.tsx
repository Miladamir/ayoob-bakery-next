"use client";

import { useState } from "react";
import Link from "next/link";
import { IProduct } from "@/models/Product";

interface CartItemProps {
    product: IProduct;
    quantity: number;
    note?: string;
    index: number;
    onUpdate: (index: number, newQty: number) => void;
    onRemove: (index: number) => void;
    onNoteUpdate: (index: number, note: string) => void;
}

export default function CartItem({ product, quantity, note, index, onUpdate, onRemove, onNoteUpdate }: CartItemProps) {
    const [currentQty, setCurrentQty] = useState(quantity);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [tempNote, setTempNote] = useState(note || "");

    const handleQtyChange = (change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        setCurrentQty(newQty);
        onUpdate(index, newQty);
    };

    const itemSubtotal = (product.price * currentQty).toFixed(2);

    return (
        <>
            <div className="cart-item bg-white rounded-3xl shadow-xl overflow-hidden group relative border border-gray-100 mb-6">

                {/* Top: Image & Badge */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={product.images[0]}
                        className="cart-item-img w-full h-full object-cover"
                        alt={product.name}
                    />

                    {/* Gradient Overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-10"></div>

                    {product.badge && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                {product.badge}
                            </span>
                        </div>
                    )}

                    {/* Remove Button */}
                    <button
                        onClick={() => onRemove(index)}
                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-md"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 -mt-10 relative z-20">

                    {/* Header */}
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                            <Link href={`/product/${product._id}`}>{product.name}</Link>
                        </h3>
                        <span className="item-subtotal text-xl md:text-2xl font-bold text-brand-600">
                            ${itemSubtotal}
                        </span>
                    </div>

                    {/* Unit / Options Display */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                            {product.unit}
                        </span>
                    </div>

                    {/* Note (If exists) */}
                    {note && (
                        <div className="mb-4 text-sm text-gray-500 border-l-2 border-brand-200 pl-3 italic">
                            "{note}"
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-4">

                        {/* Quantity Selector */}
                        <div className="flex items-center bg-brand-50 rounded-xl overflow-hidden border border-brand-100">
                            <button
                                onClick={() => handleQtyChange(-1)}
                                className="w-11 h-11 flex items-center justify-center text-brand-600 hover:bg-brand-200 transition-colors text-lg font-bold"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                value={currentQty}
                                readOnly
                                className="w-10 h-11 text-center border-0 text-md font-bold text-gray-800 bg-transparent focus:outline-none"
                            />
                            <button
                                onClick={() => handleQtyChange(1)}
                                className="w-11 h-11 flex items-center justify-center text-brand-600 hover:bg-brand-200 transition-colors text-lg font-bold"
                            >
                                +
                            </button>
                        </div>

                        {/* Add Note Button */}
                        <button
                            onClick={() => setShowNoteModal(true)}
                            className="flex-grow h-11 border-2 border-dashed border-gray-200 rounded-xl font-semibold text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <i className="fa-solid fa-pen"></i>
                            <span>{note ? 'Edit Note' : 'Add Note'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Simple Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl">
                        <h3 className="font-serif text-xl font-bold mb-4">Add a Note</h3>
                        <textarea
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-500 outline-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="w-1/3 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onNoteUpdate(index, tempNote); setShowNoteModal(false); }}
                                className="flex-grow py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}