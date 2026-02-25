"use client";

import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-brand-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                <img
                    src={mainImage}
                    alt="Product Image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setMainImage(img)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-brand-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}