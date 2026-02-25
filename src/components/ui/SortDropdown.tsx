"use client";

import { useRouter, usePathname } from "next/navigation";

interface SortDropdownProps {
    currentSort?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
}

export default function SortDropdown({ currentSort, categoryId, minPrice, maxPrice }: SortDropdownProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams();

        // Preserve existing filters
        if (categoryId) params.set('category', categoryId);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);

        // Set new sort value
        params.set('sort', e.target.value);

        // Navigate to the new URL
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            onChange={handleChange}
            className="bg-white border border-gray-200 rounded-lg py-2 px-4 text-sm text-gray-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            defaultValue={currentSort || 'featured'}
        >
            <option value="featured">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating</option>
        </select>
    );
}