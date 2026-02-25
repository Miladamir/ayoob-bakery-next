import dbConnect from './dbConnect';
import Category from '@/models/Category';
import { ICategory } from '@/models/Category';

// Define NestedCategory. 
// Note: Ideally, this should not extend 'Document' if it comes from .lean(), 
// but for simplicity in this migration, we cast it.
export interface NestedCategory extends ICategory {
    subcategories: ICategory[];
}

export async function getNestedCategories(): Promise<NestedCategory[]> {
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

    // Fix: Cast to 'unknown' first, then to 'NestedCategory[]' to satisfy TypeScript
    // This is safe because .lean() returns the data shape we expect, just without Mongoose methods.
    return nestedCategories as unknown as NestedCategory[];
}