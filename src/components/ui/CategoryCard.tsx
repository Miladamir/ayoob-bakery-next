import Link from "next/link";
import { ICategory } from "@/models/Category";

interface CategoryCardProps {
    category: ICategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link
            href={`/products?category=${category._id}`}
            className="group block relative h-96 w-full rounded-2xl overflow-hidden shadow-lg border-glow"
        >
            {/* 1. Background Image Layer */}
            <div className="absolute inset-0">
                <img
                    src={category.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop'}
                    alt={category.name}
                    className="img-zoom-container w-full h-full object-cover"
                />
            </div>

            {/* 2. Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent opacity-90"></div>

            {/* 3. Content Layer */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">

                {/* Item Count / Tagline */}
                <div className="flex items-center gap-2 mb-2 text-brand-300">
                    <i className="fa-solid fa-bowl-food text-sm"></i>
                    <span className="text-xs font-semibold uppercase tracking-widest">
                        {category.description ? category.description.substring(0, 20) + '...' : 'Browse Collection'}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-3xl font-bold mb-2 leading-tight text-white drop-shadow-md">
                    {category.name}
                </h3>

                {/* Divider Line */}
                <div className="w-10 h-0.5 bg-brand-500 mb-3 transition-all duration-300 group-hover:w-16"></div>

                {/* Call to Action */}
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-400 group-hover:text-white transition-colors">
                    <span className="slide-up-text">Explore Collection</span>
                    <i className="fa-solid fa-arrow-right text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></i>
                </div>
            </div>
        </Link>
    );
}