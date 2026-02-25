"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { IProduct } from "@/models/Product";

interface ProductTabsProps {
    bestSelling: IProduct[];
    newArrivals: IProduct[];
    popular: IProduct[];
    featured: IProduct[];
}

export default function ProductTabs({ bestSelling, newArrivals, popular, featured }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState("bestselling");

    const tabs = [
        { key: "bestselling", label: "Best Sellers", data: bestSelling },
        { key: "newarrivals", label: "New Arrivals", data: newArrivals },
        { key: "popular", label: "Popular", data: popular },
        { key: "featured", label: "Featured", data: featured },
    ];

    const activeData = tabs.find((t) => t.key === activeTab)?.data || [];

    return (
        <section id="menu" className="section-padding">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-brand-500 font-semibold tracking-widest uppercase text-sm">From the Oven</span>
                    <h2 className="text-4xl font-bold mt-2">Our Daily Creations</h2>
                    <div className="w-16 h-1 bg-brand-500 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center gap-2 md:gap-4 mb-12 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 border ${activeTab === tab.key
                                ? "bg-brand-500 text-white border-brand-500 shadow-lg"
                                : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <div className="products-grid-container">
                    {activeData.length > 0 ? (
                        <div className="products-grid active">
                            {/* Fix: Removed isWishlisted and isInCart props. ProductCard handles these internally now. */}
                            {activeData.map((product: any) => (
                                <ProductCard
                                    key={product._id.toString()}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No products found in this category.</p>
                        </div>
                    )}
                </div>

                {/* View Full Menu */}
                <div className="text-center mt-12">
                    <a
                        href="/products"
                        className="inline-block border-b-2 border-brand-500 text-brand-600 font-bold uppercase tracking-wider hover:text-brand-700 transition-colors"
                    >
                        View Full Menu
                    </a>
                </div>
            </div>
        </section>
    );
}