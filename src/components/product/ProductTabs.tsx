"use client";

import { useState } from "react";
import ReviewSection from "./ReviewSection";

interface ProductTabsProps {
    product: any;
}

export default function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState("description");

    const tabs = [
        { key: "description", label: "Description" },
        { key: "ingredients", label: "Ingredients" },
        { key: "nutrition", label: "Nutrition" },
        { key: "reviews", label: `Reviews (${product.reviews?.length || 0})` },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "description":
                return <p className="text-gray-600 leading-relaxed">{product.description || "No detailed description available."}</p>;
            case "ingredients":
                return <p className="text-gray-600 leading-relaxed">{product.ingredients || "Ingredients information not available."}</p>;
            case "nutrition":
                return <p className="text-gray-600 leading-relaxed">{product.nutrition || "Nutritional information not available."}</p>;
            case "reviews":
                return <ReviewSection product={product} />;
            default:
                return null;
        }
    };

    return (
        <section className="py-16 bg-brand-50">
            <div className="container mx-auto px-6">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-10 flex gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-4 border-b-2 whitespace-nowrap font-semibold transition-colors ${activeTab === tab.key
                                    ? "border-brand-500 text-brand-600"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm min-h-[200px]">
                    {renderContent()}
                </div>
            </div>
        </section>
    );
}