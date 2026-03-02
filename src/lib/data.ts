import dbConnect from './dbConnect';
import Category from '@/models/Category';
import { ICategory } from '@/models/Category';
import { unstable_cache } from 'next/cache';

// Define NestedCategory. 
export interface NestedCategory extends ICategory {
    subcategories: ICategory[];
}

// Cached version of the function
export const getNestedCategories = unstable_cache(
    async (): Promise<NestedCategory[]> => {
        await dbConnect();

        const topCategories = await Category.find({ parent: null }).lean();

        const nestedCategories = await Promise.all(
            topCategories.map(async (cat) => {
                const subs = await Category.find({ parent: cat._id }).lean();
                return {
                    ...cat,
                    subcategories: subs,
                };
            })
        );

        return nestedCategories as unknown as NestedCategory[];
    },
    ['nested-categories'], // Cache key
    {
        revalidate: 3600, // Revalidate every hour (3600 seconds)
        tags: ['categories'] // Tag for manual revalidation
    }
);

// Helper to revalidate cache when admin updates data
export async function revalidateCategoriesCache() {
    'use server';
    const { revalidateTag } = await import('next/cache');
    revalidateTag('categories', 'max');
}