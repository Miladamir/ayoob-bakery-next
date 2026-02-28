import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/ui/ProductCard";
import SortDropdown from "@/components/ui/SortDropdown";
import Link from "next/link";
import { NestedCategory, getNestedCategories } from "@/lib/data";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Update the Props interface for Next.js 15+
interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: Props) {
    await dbConnect();

    // 1. Await searchParams (CRITICAL FIX for Next.js 15+)
    const resolvedParams = await searchParams;

    // 2. Parse Parameters safely
    const currentPage = parseInt(resolvedParams.page as string || "1");
    const limit = 9;
    const skip = (currentPage - 1) * limit;
    const categoryId = resolvedParams.category as string;

    // 3. Fetch Categories for Sidebar
    const nestedCategories = await getNestedCategories();

    // 4. Determine Current Category & View Mode
    let currentCategory: any = null;
    let isSubcategoryView = false;
    let subcategories: any[] = [];

    if (categoryId) {
        currentCategory = await Category.findById(categoryId).populate('parent').lean();

        // Check if this category has children (Subcategory View)
        const children = await Category.find({ parent: categoryId }).lean();
        if (children.length > 0) {
            isSubcategoryView = true;
            subcategories = children;
        }
    }

    // 5. Build Query for Products
    const query: any = {};

    if (!isSubcategoryView && categoryId) {
        query.category = categoryId;
    }

    // Price Filters (using resolvedParams)
    if (resolvedParams.minPrice) query.price = { ...query.price, $gte: parseFloat(resolvedParams.minPrice as string) };
    if (resolvedParams.maxPrice) query.price = { ...query.price, $lte: parseFloat(resolvedParams.maxPrice as string) };

    // 6. Build Sort Object
    const sortOptions: any = { createdAt: -1 }; // Default
    if (resolvedParams.sort === 'price-asc') sortOptions.price = 1;
    else if (resolvedParams.sort === 'price-desc') sortOptions.price = -1;
    else if (resolvedParams.sort === 'rating-desc') sortOptions.ratings = -1;

    // 7. Fetch Data
    let products: any[] = [];
    let totalProducts = 0;
    let totalPages = 1;

    if (!isSubcategoryView) {
        totalProducts = await Product.countDocuments(query);
        totalPages = Math.ceil(totalProducts / limit);

        products = await Product.find(query)
            .populate('category')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
    }

    // Serialize
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedSubcategories = JSON.parse(JSON.stringify(subcategories));
    const serializedCurrentCategory = JSON.parse(JSON.stringify(currentCategory));

    // Helper to build pagination/filter URLs (using resolvedParams)
    const buildUrl = (newParams: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
        if (categoryId) params.set('category', categoryId);
        if (resolvedParams.minPrice) params.set('minPrice', resolvedParams.minPrice as string);
        if (resolvedParams.maxPrice) params.set('maxPrice', resolvedParams.maxPrice as string);
        if (resolvedParams.sort) params.set('sort', resolvedParams.sort as string);

        for (const key in newParams) {
            if (newParams[key]) {
                params.set(key, newParams[key]!);
            } else {
                params.delete(key);
            }
        }
        return `/products?${params.toString()}`;
    };

    return (
        <>
            {/* PAGE HEADER */}
            <section className="pt-32 pb-12 bg-brand-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-800 to-brand-900"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                        {serializedCurrentCategory ? serializedCurrentCategory.name : 'Our Collection'}
                    </h1>
                    <p className="text-brand-200 text-lg animate-fade-in-up delay-100">
                        Browse our freshly baked selection
                    </p>

                    {/* Breadcrumbs */}
                    <div className="mt-6 flex justify-center gap-2 text-sm text-brand-300 animate-fade-in-up delay-200">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>/</span>
                        {serializedCurrentCategory && serializedCurrentCategory.parent ? (
                            <>
                                <Link href={`/products?category=${serializedCurrentCategory.parent._id}`} className="hover:text-white">
                                    {serializedCurrentCategory.parent.name}
                                </Link>
                                <span>/</span>
                            </>
                        ) : null}
                        <span className="text-white">
                            {serializedCurrentCategory ? serializedCurrentCategory.name : 'Menu'}
                        </span>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    {/* CHANGED: gap-12 to gap-8 to reduce whitespace */}
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* SIDEBAR */}
                        {/* CHANGED: lg:w-1/4 to lg:w-1/5 (20% width) */}
                        <aside className="lg:w-1/5 hidden lg:block">
                            <div className="sidebar-sticky space-y-8">

                                {/* Search */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Search</label>
                                    <div className="relative">
                                        <form action="/search" method="GET">
                                            <input
                                                type="text"
                                                name="q"
                                                placeholder="Find a product..."
                                                className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:border-brand-500 transition-colors"
                                            />
                                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand-500">
                                                <i className="fa-solid fa-search"></i>
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Categories</h3>
                                    <div className="space-y-2">
                                        <Link
                                            href="/products"
                                            className={`filter-sidebar-btn ${!categoryId ? 'active' : ''} w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-brand-100 hover:text-brand-700 transition-colors flex justify-between items-center group`}
                                        >
                                            <span>All Products</span>
                                        </Link>

                                        {nestedCategories.map((cat) => (
                                            <div key={cat._id.toString()}>
                                                <Link
                                                    href={`/products?category=${cat._id}`}
                                                    className={`filter-sidebar-btn ${categoryId === cat._id.toString() ? 'active' : ''} w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-brand-100 hover:text-brand-700 transition-colors flex justify-between items-center group`}
                                                >
                                                    <span>{cat.name}</span>
                                                </Link>

                                                {/* Subcategories */}
                                                {cat.subcategories && cat.subcategories.length > 0 && (
                                                    <div className="ml-2 mt-1 space-y-1">
                                                        {cat.subcategories.map((sub: any) => (
                                                            <Link
                                                                key={sub._id.toString()}
                                                                href={`/products?category=${sub._id}`}
                                                                className={`filter-sidebar-btn ${categoryId === sub._id.toString() ? 'active' : ''} w-full text-left py-2 px-3 pl-6 rounded-lg text-gray-500 text-sm hover:bg-brand-100 hover:text-brand-700 transition-colors flex justify-between items-center group`}
                                                            >
                                                                <span>— {sub.name}</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="border-t border-gray-200 pt-8">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Filters</h3>
                                    <form action="/products" method="GET" className="space-y-4">
                                        {categoryId && <input type="hidden" name="category" value={categoryId} />}

                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                                            <input type="number" name="minPrice" defaultValue={resolvedParams.minPrice as string || 0} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                                            <input type="number" name="maxPrice" defaultValue={resolvedParams.maxPrice as string} className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm" />
                                        </div>

                                        <button type="submit" className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-brand-600">Apply</button>
                                    </form>
                                </div>
                            </div>
                        </aside>

                        {/* PRODUCT GRID */}
                        {/* CHANGED: lg:w-3/4 to lg:w-4/5 (80% width) */}
                        <main className="lg:w-4/5">

                            {/* Utility Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
                                <p className="text-gray-500 text-sm">
                                    Showing <span className="font-bold text-gray-800">{products.length}</span> results
                                </p>

                                <div className="flex items-center gap-4">
                                    {/* Mobile Filter Button */}
                                    <button className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                        <i className="fa-solid fa-filter mr-2"></i> Filters
                                    </button>

                                    {/* Sort Dropdown - Pass resolvedParams */}
                                    <SortDropdown
                                        currentSort={resolvedParams.sort as string}
                                        categoryId={categoryId}
                                        minPrice={resolvedParams.minPrice as string}
                                        maxPrice={resolvedParams.maxPrice as string}
                                    />
                                </div>
                            </div>

                            {/* Conditional Rendering: Subcategories OR Products */}
                            {isSubcategoryView ? (
                                // Subcategory Grid
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {serializedSubcategories.map((sub: any) => (
                                        <Link
                                            key={sub._id}
                                            href={`/products?category=${sub._id}`}
                                            className="bg-white rounded-xl shadow-md overflow-hidden group block hover:shadow-lg transition-all"
                                        >
                                            <div className="h-48 bg-brand-100 relative overflow-hidden">
                                                <img
                                                    src={sub.image || 'https://via.placeholder.com/400'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    alt={sub.name}
                                                />
                                            </div>
                                            <div className="p-6 text-center">
                                                <h3 className="font-serif text-xl font-bold text-gray-800">{sub.name}</h3>
                                                <p className="text-brand-500 text-sm mt-2 font-semibold group-hover:underline">View Products →</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                // Product Grid
                                <>
                                    {/* CHANGED: gap-8 to gap-6 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {serializedProducts.length > 0 ? (
                                            serializedProducts.map((product: any) => (
                                                <ProductCard key={product._id} product={product} />
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12">
                                                <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" className="w-24 h-24 mx-auto mb-4 opacity-50" alt="Empty" />
                                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Products Found</h3>
                                                <p className="text-gray-500">Try adjusting your filters or search term.</p>
                                                <Link href="/products" className="mt-4 inline-block bg-brand-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-600">
                                                    Clear Filters
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-16 flex justify-center items-center gap-2">
                                            {/* Prev */}
                                            {currentPage > 1 && (
                                                <Link
                                                    href={buildUrl({ page: (currentPage - 1).toString() })}
                                                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
                                                >
                                                    <i className="fa-solid fa-arrow-left text-sm"></i>
                                                </Link>
                                            )}

                                            {/* Numbers */}
                                            {[...Array(totalPages)].map((_, i) => (
                                                <Link
                                                    key={i}
                                                    href={buildUrl({ page: (i + 1).toString() })}
                                                    className={`w-12 h-12 rounded-full ${i + 1 === currentPage ? 'bg-brand-900 text-white' : 'border border-gray-200'} flex items-center justify-center font-bold hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors`}
                                                >
                                                    {i + 1}
                                                </Link>
                                            ))}

                                            {/* Next */}
                                            {currentPage < totalPages && (
                                                <Link
                                                    href={buildUrl({ page: (currentPage + 1).toString() })}
                                                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
                                                >
                                                    <i className="fa-solid fa-arrow-right text-sm"></i>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                        </main>
                    </div>
                </div>
            </section>
        </>
    );
}