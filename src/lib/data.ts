import dbConnect from './dbConnect';
import Category from '@/models/Category';
import { ICategory } from '@/models/Category';

export interface NestedCategory extends ICategory {
    subcategories: ICategory[];
}

/**
 * The category tree, read fresh from the database.
 *
 * Previously wrapped in unstable_cache (1 hour) — that's what made
 * admin changes take up to an hour to appear, and busting it relied
 * on revalidateTag, whose signature changed in newer Next versions.
 * Both pages that read this (/products, /categories) are dynamic and
 * already hit the DB per request, so the plain read costs nothing
 * and changes show up instantly.
 */
export async function getNestedCategories(): Promise<NestedCategory[]> {
    await dbConnect();

    // two queries total (no per-category N+1), grouped in memory
    const [tops, subs] = await Promise.all([
        Category.find({ parent: null }).lean(),
        Category.find({ parent: { $ne: null } }).lean(),
    ]);

    return tops.map((top: any) => ({
        ...top,
        subcategories: subs.filter((s: any) => String(s.parent) === String(top._id)),
    })) as unknown as NestedCategory[];
}