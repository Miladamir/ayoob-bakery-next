import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import CategoryCard from "@/components/ui/CategoryCard";
import { ICategory } from "@/models/Category";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    await dbConnect();

    // Fetch top-level categories
    const categories = await Category.find({ parent: null }).lean();

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block text-brand-300 uppercase tracking-[0.4em] text-xs font-bold mb-4">Explore Our Range</span>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">The Menu</h1>
                    <p className="text-brand-200 text-lg max-w-xl mx-auto">From crusty sourdoughs to delicate pastries, explore our full collection.</p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((cat, index) => {
                                // Logic to make first/last items wide (from original site)
                                const isWide = (index === 0 || index === categories.length - 1) && categories.length > 1;
                                return (
                                    <div key={cat._id.toString()} className={`${isWide ? 'lg:col-span-2' : ''}`}>
                                        <CategoryCard category={cat as ICategory} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-gray-600">No categories found.</h3>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}